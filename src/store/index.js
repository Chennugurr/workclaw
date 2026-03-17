import useStore from './store';
import dispatch from './dispatch';

/**
 * Custom hook for accessing the application state.
 *
 * @function useAppState
 * @returns {Object} The current application state.
 *
 * @example
 * import { useAppState } from '@/store';
 *
 * function UserProfile() {
 *   const { authenticated, user } = useAppState();
 *
 *   if (!authenticated) {
 *     return <div>Please log in to view your profile.</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.name}!</h1>
 *       <p>Email: {user.email}</p>
 *     </div>
 *   );
 * }
 */
export const useAppState = (...args) => useStore(...args);

/**
 * Custom hook for accessing the dispatch function to update the application state.
 *
 * @function useAppDispatch
 * @returns {Function} The dispatch function to update the application state.
 *
 * @example
 * import { useAppDispatch } from '@/store';
 * import { ACTIONS } from '@/store/constants';
 *
 * function LoginButton() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleLogin = async () => {
 *     // Fetch user data
 *     await dispatch({ type: ACTIONS.USER.FETCH });
 *   };
 *
 *   return <button onClick={handleLogin}>Log In</button>;
 * }
 *
 * @example
 * import { useAppDispatch } from '@/store';
 * import { ACTIONS } from '@/store/constants';
 *
 * function UpdateProfileButton() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleUpdateProfile = () => {
 *     // Update user data
 *     dispatch({ type: ACTIONS.USER.UPDATE, payload: { name: 'John Doe' } });
 *   };
 *
 *   return <button onClick={handleUpdateProfile}>Update Profile</button>;
 * }
 *
 * @example
 * import { useAppDispatch } from '@/store';
 * import { ACTIONS } from '@/store/constants';
 *
 * function LogoutButton() {
 *   const dispatch = useAppDispatch();
 *
 *   const handleLogout = () => {
 *     // Logout user
 *     dispatch({ type: ACTIONS.USER.LOGOUT });
 *   };
 *
 *   return <button onClick={handleLogout}>Log Out</button>;
 * }
 */
export const useAppDispatch = () => dispatch;
