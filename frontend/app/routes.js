// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import { getAsyncInjectors } from 'utils/asyncInjectors';
import { clear } from './local-storage';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default function createRoutes(store) {
  // Create reusable async injectors using getAsyncInjectors factory
  const { injectReducer, injectSagas } = getAsyncInjectors(store); // eslint-disable-line no-unused-vars

  return [
    {
      path: '/',
      name: 'home',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/HomePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/time',
      name: 'timePage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/TimePage/reducer'),
          import('containers/Calendar/reducer'),
          import('containers/CalendarInput/reducer'),
          import('containers/TimePage/sagas'),
          import('containers/Calendar/sagas'),
          import('containers/CalendarInput/sagas'),
          import('containers/TimePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([
          reducer,
          calendarReducer,
          calendarInputReducer,
          sagas,
          calendarSagas,
          calendarInputSagas,
          component,
        ]) => {
          injectReducer('timePage', reducer.default);
          injectReducer('calendar', calendarReducer.default);
          injectReducer('calendarInput', calendarInputReducer.default);
          injectSagas([
            ...sagas.default,
            ...calendarSagas.default,
            ...calendarInputSagas.default,
          ]);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/reports',
      name: 'reportsPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ReportsPage/reducer'),
          import('containers/ReportsPage/sagas'),
          import('containers/ReportsPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('reportsPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/settings',
      name: 'settingsPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/SettingsPage/reducer'),
          import('containers/SettingsPage/sagas'),
          import('containers/SettingsPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('settingsPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/login',
      name: 'loginPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/LoginPage/reducer'),
          import('containers/LoginPage/sagas'),
          import('containers/LoginPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('loginPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/signup',
      name: 'signupPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/SignupPage/reducer'),
          import('containers/SignupPage/sagas'),
          import('containers/SignupPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('signupPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/elements',
      name: 'elementsPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ElementsPage/reducer'),
          import('containers/ElementsPage/sagas'),
          import('containers/ElementsPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('elementsPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/holidays',
      name: 'holidaysPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/HolidaysPage/reducer'),
          import('containers/HolidaysPage/sagas'),
          import('containers/HolidaysPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('holidaysPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/api/users/confirm',
      name: 'signupPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/SignupPage/reducer'),
          import('containers/SignupPage/sagas'),
          import('containers/SignupPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('signupPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/reset',
      name: 'loginPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/LoginPage/reducer'),
          import('containers/LoginPage/sagas'),
          import('containers/LoginPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('loginPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/profile',
      name: 'profilePage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ProfilePage/reducer'),
          import('containers/ProfilePage/sagas'),
          import('containers/ProfilePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('profilePage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/unauthorized',
      name: 'unauthorized',
      getComponent(nextState, cb) {
        import('containers/UnauthorizedPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/teams',
      name: 'teamsPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/TeamsPage/reducer'),
          import('containers/TeamsPage/sagas'),
          import('containers/TeamsPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('teamsPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/impersonate',
      name: 'impersonatePage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ImpersonatePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/audits',
      name: 'auditsPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/AuditsPage/reducer'),
          import('containers/AuditsPage/sagas'),
          import('containers/AuditsPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('auditsPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/users',
      name: 'usersPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UsersPage/reducer'),
          import('containers/UsersPage/sagas'),
          import('containers/UsersPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('usersPage', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/updates',
      name: 'updatesPage',
      getComponent(nextState, cb) {
        import('containers/UpdatesPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/clear',
      getComponent() {
        clear();
      },
    }, {
      path: '*',
      name: 'notfound',
      getComponent(nextState, cb) {
        import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    },
  ];
}
