import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STATUS } from './constants';

export const initialState = {
  authenticated: false,
  user: {
    [STATUS.LOADING]: false,
    [STATUS.ERROR]: null,
  },
  organization: {
    [STATUS.LOADING]: false,
    [STATUS.ERROR]: null,
    selected: {},
    items: [],
  },
};

/**
 * Custom hook for managing global application state using Zustand.
 *
 * @function useStore
 * @returns {Object} The store object containing the current state and setter functions.
 *
 * @example
 * import { useStore } from './store';
 *
 * function MyComponent() {
 *   const { authenticated, user } = useStore();
 *
 *   if (authenticated) {
 *     return <div>Welcome, {user.name}!</div>;
 *   } else {
 *     return <div>Please log in.</div>;
 *   }
 * }
 */
const useStore = create(
  persist(() => ({ ...initialState }), {
    name: '@app/ls/store',
  })
);

export default useStore;
