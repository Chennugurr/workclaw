/**
 * @constant {Object} ACTIONS
 * @description Defines the available actions for the application's state management.
 *
 * @property {Object} USER - Actions related to user operations.
 * @property {Symbol} USER.FETCH - Action to fetch user data.
 * @property {Symbol} USER.LOGOUT - Action to log out the user.
 * @property {Symbol} USER.UPDATE - Action to update user data.
 * @property {Symbol} ORGANIZATIONS - Actions related to organizations operations.
 * @property {Symbol} ORGANIZATIONS.FETCH - Action to fetch organizations data.
 */
export const ACTIONS = Object.freeze({
  USER: Object.freeze({
    FETCH: Symbol('USER.FETCH'),
    LOGOUT: Symbol('USER.LOGOUT'),
    UPDATE: Symbol('USER.UPDATE'),
  }),
  ORGANIZATIONS: Object.freeze({
    FETCH: Symbol('ORGANIZATIONS.FETCH'),
    SET: Symbol('ORGANIZATIONS.SET'),
    SELECT: Symbol('ORGANIZATIONS.SELECT'),
  }),
});

/**
 * @constant {Object} STATUS
 * @description Defines the status constants for the application's state management.
 *
 * @property {Symbol} LOADING - Represents a loading state.
 * @property {Symbol} ERROR - Represents an error state.
 */
export const STATUS = Object.freeze({
  LOADING: Symbol('LOADING'),
  ERROR: Symbol('ERROR'),
});
