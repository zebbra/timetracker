import CurrentUser from './CurrentUser';
import Session from './Session';
import Context from './Context';

/**
 * Takes a react component and an array of higher order component(s) and applys
 * the hocs to the component
 *
 * @param {node}    component   The react node to decorate with the higher order component(s)
 * @param {array}   wrappers    The higher order component(s) to apply
 */
export function composeComponents(component, wrappers = []) {
  return wrappers.reduce((c, wrapper) => wrapper(c), component);
}

export const requiresSession = Session;

export const currentUser = CurrentUser;

export const context = Context;

/**
 * Makes sure that the user has the `user` role when he wants to see the given component
 *
 * @param {node}  component   The component to decorate with the userContext hoc
 */
export const userContext = (component) => composeComponents(
  component,
  [
    (c) => context(c, { roles: ['user'] }),
    (c) => requiresSession(c),
  ]
);

/**
 * Makes sure that the user has the `teamleader` role when he wants to see the given component
 *
 * @param {node}  component   The component to decorate with the teamleaderContext hoc
 */
export const teamleaderContext = (component) => composeComponents(
  component,
  [
    (c) => context(c, { roles: ['teamleader'] }),
    (c) => requiresSession(c),
  ]
);

/**
 * Makes sure that the user has the `admin` role when he wants to see the given component
 *
 * @param {node}  component   The component to decorate with the adminContext hoc
 */
export const adminContext = (component) => composeComponents(
  component,
  [
    (c) => context(c, { roles: ['admin'] }),
    (c) => requiresSession(c),
  ]
);

/**
 * Makes sure that the user has the `super-admin` role when he wants to see the given component
 *
 * @param {node}  component   The component to decorate with the superAdminContext hoc
 */
export const superAdminContext = (component) => composeComponents(
  component,
  [
    (c) => context(c, { roles: ['super-admin'], fromOriginRoles: true }),
    (c) => requiresSession(c),
  ]
);
