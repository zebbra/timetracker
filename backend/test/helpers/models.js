/* global app */
const async = require("async");
const moment = require("moment-timezone");
const _ = require("lodash");

const roles = {
  userRole: { name: "user" },
  adminRole: { name: "admin" }
};

const users = {
  demo: {
    username: "demo",
    password: "demo1234",
    email: "demo@medi.ch",
    firstName: "Demo",
    lastName: "Demo",
    emailVerified: true,
    _meta: {
      role: "userRole"
    }
  },
  admin: {
    username: "admin",
    password: "admin1234",
    email: "admin@medi.ch",
    firstName: "Admin",
    lastName: "Admin",
    emailVerified: true,
    _meta: {
      role: "adminRole"
    }
  }
};

const elements = {
  element: {
    label: "DemoElement",
    type: "dynamic",
    unit: "l",
    start: moment()
      .subtract(3, "years")
      .toDate()
  },
  holidayElement: {
    label: "HolidayElement",
    type: "static",
    unit: "d",
    holiday: true,
    start: moment()
      .subtract(3, "years")
      .toDate()
  }
};

const createRoles = done => {
  const roleNames = _.keys(roles);

  async.each(
    roleNames,
    (role, nextRole) => {
      app.models.Role.findOrCreate(roles[role], (err, dbRole) => {
        if (err) {
          nextRole(err);
        } else {
          global[role] = dbRole;
          nextRole();
        }
      });
    },
    done
  );
};

const createUser = (type, customData, done) => {
  const userData = _.clone(users[type]) || _.clone(users.demo);
  const meta = userData._meta;
  Object.assign(userData, customData || {});
  delete userData._meta;

  app.models.user.findOrCreate(userData, (err, user) => {
    if (err) {
      done(err);
    } else {
      global[meta.role].principals.create(
        {
          principalType: app.models.RoleMapping.USER,
          principalId: user.id
        },
        roleErr => {
          if (roleErr) {
            done(roleErr);
          } else {
            done(null, user);
          }
        }
      );
    }
  });
};

const createElement = (type, customData, done) => {
  const elementData = elements[type] || elements.demoElement;
  Object.assign(elementData, customData);

  app.models.element.findOrCreate(elementData, (err, element) => {
    if (err) {
      done(err);
    } else {
      done(null, element);
    }
  });
};

const createTrack = (user, element, trackData, done) => {
  trackData.userId = user.id;
  trackData.elementId = element.id;

  app.models.track.findOrCreate(trackData, (err, track) => {
    if (err) {
      done(err);
    } else {
      done(null, track);
    }
  });
};

const createSetpoint = (user, element, setpointData, done) => {
  setpointData.userId = user.id;
  setpointData.elementId = element.id;

  app.models.setpoint.findOrCreate(setpointData, (err, setpoint) => {
    if (err) {
      done(err);
    } else {
      done(null, setpoint);
    }
  });
};

const createHoliday = (user, element, holidayData, done) => {
  holidayData.userId = user.id;
  holidayData.elementId = element.id;

  app.models.holiday.findOrCreate(holidayData, (err, holiday) => {
    if (err) {
      done(err);
    } else {
      done(null, holiday);
    }
  });
};

const login = (username, password, done) => {
  app.models.user.login({ username, password }, (err, token) => {
    if (err) {
      done(err);
    } else {
      done(null, token);
    }
  });
};

const loggedInUserElementTrack = done => {
  let user;
  let element;
  let track;
  let token;
  async.waterfall(
    [
      next => createRoles(next),
      next =>
        createUser("demo", {}, (err, dbUser) => {
          if (err) {
            next(err);
          } else {
            user = dbUser;
            next();
          }
        }),
      next =>
        createElement("element", {}, (err, dbElement) => {
          if (err) {
            next(err);
          } else {
            element = dbElement;
            next();
          }
        }),
      next =>
        createTrack(
          user,
          element,
          { date: new Date(), label: "demo", value: 1 },
          (err, dbTrack) => {
            if (err) {
              next(err);
            } else {
              track = dbTrack;
              next();
            }
          }
        ),
      next =>
        login(users.demo.username, users.demo.password, (err, dbToken) => {
          if (err) {
            next(err);
          } else {
            token = dbToken;
            next();
          }
        })
    ],
    err => {
      if (err) {
        done(err);
      } else {
        done(null, user, element, track, token);
      }
    }
  );
};

const loggedInUserElementSetpoint = done => {
  let user;
  let element;
  let setpoint;
  let token;

  async.waterfall(
    [
      next => createRoles(next),
      next =>
        createUser("demo", {}, (err, dbUser) => {
          if (err) {
            next(err);
          } else {
            user = dbUser;
            next();
          }
        }),
      next =>
        createElement("element", {}, (err, dbElement) => {
          if (err) {
            next(err);
          } else {
            element = dbElement;
            next();
          }
        }),
      next =>
        createSetpoint(
          user,
          element,
          { year: new Date().getFullYear(), value: 1 },
          (err, dbSetpoint) => {
            if (err) {
              next(err);
            } else {
              setpoint = dbSetpoint;
              next();
            }
          }
        ),
      next =>
        login(users.demo.username, users.demo.password, (err, dbToken) => {
          if (err) {
            next(err);
          } else {
            token = dbToken;
            next();
          }
        })
    ],
    err => {
      if (err) {
        done(err);
      } else {
        done(null, user, element, setpoint, token);
      }
    }
  );
};

const loggedInAdminElement = done => {
  let user;
  let element;
  let token;
  async.waterfall(
    [
      next => createRoles(next),
      next =>
        createUser("admin", {}, (err, dbUser) => {
          if (err) {
            next(err);
          } else {
            user = dbUser;
            next();
          }
        }),
      next =>
        createElement("element", {}, (err, dbElement) => {
          if (err) {
            next(err);
          } else {
            element = dbElement;
            next();
          }
        }),
      next =>
        login(users.admin.username, users.admin.password, (err, dbToken) => {
          if (err) {
            next(err);
          } else {
            token = dbToken;
            next();
          }
        })
    ],
    err => {
      if (err) {
        done(err);
      } else {
        done(null, user, element, token);
      }
    }
  );
};

module.exports = {
  createRoles,
  createUser,
  createElement,
  createTrack,
  createHoliday,
  login,
  loggedInUserElementTrack,
  loggedInUserElementSetpoint,
  loggedInAdminElement
};
