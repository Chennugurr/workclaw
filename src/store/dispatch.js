import axios from '@/lib/axios';
import { ACTIONS, STATUS } from './constants';
import useStore, { initialState } from './store';

/**
 * Dispatches actions to update the application state.
 *
 * @function dispatch
 * @async
 * @param {Object} action - The action object to be dispatched.
 * @param {Symbol} action.type - The type of the action.
 * @param {*} [action.payload] - Optional payload for the action.
 * @throws {Error} If the action type is not handled.
 *
 * @example
 * // Fetch user data
 * dispatch({ type: ACTIONS.USER.FETCH });
 *
 * // Update user data
 * dispatch({ type: ACTIONS.USER.UPDATE, payload: { name: 'John Doe' } });
 *
 * // Logout user
 * dispatch({ type: ACTIONS.USER.LOGOUT });
 */
const dispatch = async (action) => {
  switch (action.type) {
    case ACTIONS.USER.FETCH: {
      useStore.setState((state) => ({
        user: {
          ...state.user,
          [STATUS.LOADING]: true,
        },
      }));
      try {
        const res = await axios.get('/auth/whoami');
        const user = res.data.data;
        useStore.setState({
          authenticated: true,
          user: {
            ...user,
            [STATUS.LOADING]: false,
            [STATUS.ERROR]: null,
          },
        });
        return user;
      } catch (error) {
        useStore.setState((state) => ({
          authenticated: false,
          user: {
            ...initialState.user,
            [STATUS.ERROR]: error.message,
            [STATUS.LOADING]: false,
          },
        }));
        return null;
      }
    }

    case ACTIONS.USER.LOGOUT: {
      useStore.setState(initialState);
      // TODO: Implement server-side logout if required
      return null;
    }

    case ACTIONS.USER.UPDATE: {
      useStore.setState((state) => ({
        user: { ...state.user, ...action.payload },
      }));
      return action.payload;
    }

    case ACTIONS.ORGANIZATIONS.FETCH: {
      try {
        const state = useStore.getState();
        const userId = state.user.id;
        if (!userId) return [];
        let selected = state.organization.selected;

        const res = await axios.get(
          `/search/orgs?${new URLSearchParams({
            page: 1,
            limit: 50,
            userId,
          }).toString()}`
        );
        const orgs = (res.data.data.items || []).map((org) => ({
          id: org.id,
          name: org.name,
          logo: org.logo,
        }));

        selected = orgs.find((org) => org.id === selected.id) || orgs[0] || {};
        useStore.setState({
          organization: {
            ...initialState.organization,
            selected,
            items: orgs,
            [STATUS.LOADING]: false,
            [STATUS.ERROR]: null,
          },
        });
        return orgs;
      } catch (error) {
        useStore.setState((state) => ({
          organization: {
            ...initialState.organization,
            [STATUS.ERROR]: error.message,
            [STATUS.LOADING]: false,
          },
        }));
        return [];
      }
    }

    case ACTIONS.ORGANIZATIONS.SET: {
      const state = useStore.getState();
      const userId = state.user.id;
      if (!userId) return null;
      let selected = state.organization.selected;
      const organizations = action.payload;

      if (organizations && Array.isArray(organizations)) {
        const orgs = organizations.map((org) => ({
          id: org.id,
          name: org.name,
          logo: org.logo,
        }));
        selected = orgs.find((org) => org.id === selected.id) || orgs[0] || {};
        useStore.setState({
          organization: {
            ...initialState.organization,
            selected,
            items: orgs,
          },
        });
        return selected;
      }

      return null;
    }

    case ACTIONS.ORGANIZATIONS.SELECT: {
      const org = useStore.getState().organization;
      const selected = org.items.find((item) => item.id === action.payload);
      if (!selected) return null;
      useStore.setState({
        organization: {
          ...org,
          selected,
        },
      });
      return selected;
    }

    default: {
      console.warn('Unknown action type:', action.type);
      throw new Error(`Unhandled action type: ${String(action.type)}`);
    }
  }
};

export default dispatch;
