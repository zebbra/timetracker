const path = require("path");
const async = require("async");
const moment = require("moment");
const debug = require("debug")("db:seed");

const app = require(path.resolve(__dirname, "../server/server"));
const ds = app.dataSources.mongoDS;
const defaultModels = ["AccessToken", "ACL", "RoleMapping", "Role"];
const customModels = [
  "user",
  "track",
  "element",
  "holiday",
  "setpoint",
  "component-setting",
  "employment-profile",
  "employment",
  "team",
  "membership"
];

if (process.env.NODE_ENV !== "development") {
  throw new Error("script not allowed (only on development environment)");
}

/**
 * Auto-migrate the schemas for datascource and models defined aboth
 * This will remove all defined model-collections and reinitialize them
 */
ds.automigrate([...defaultModels, ...customModels], err => {
  if (err) throw err;
  debug("models %o %s", [...defaultModels, ...customModels], ds.adapter.name);

  const User = app.models.user;
  const Element = app.models.element;
  const Track = app.models.track;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  // seed roles
  const roles = [
    {
      name: "admin"
    },
    {
      name: "user"
    }
  ];

  // seed users
  const users = [
    {
      // default admin
      email: "admin@medi.ch",
      username: "admin",
      firstName: "Admin",
      lastName: "Admin",
      password: "admin1234",
      emailVerified: true
    },
    {
      // not verified user
      email: "john.doe@medi.ch",
      username: "john",
      firstName: "John",
      lastName: "Doe",
      password: "john1234"
    },
    {
      // verified user
      email: "demo.example@medi.ch",
      username: "demo",
      firstName: "Demo",
      lastName: "Demo",
      password: "demo1234",
      emailVerified: true
    }
  ];

  // seed elements
  const elements = [
    {
      label: "Feiertage",
      type: "static",
      unit: "d",
      holiday: true,
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Ferien",
      type: "static",
      unit: "d",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Militär / Diverses",
      type: "static",
      unit: "d",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Bew. Nachqual.",
      type: "static",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Treueprämien",
      type: "static",
      unit: "d",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Besondere Abwesenheiten",
      type: "static",
      unit: "n",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Von-Bis-1",
      type: "range",
      unit: "r",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Von-Bis-2",
      type: "range",
      unit: "r",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Von-Bis-3",
      type: "range",
      unit: "r",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Unterrichts-Pool",
      label: "Unterrichten/Beraten/Begleiten",
      type: "dynamic",
      unit: "l",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate(),
      factor: 2.26
    },
    {
      project: "Unterrichts-Pool",
      label: "Begleiteter Einzelunterricht",
      type: "dynamic",
      unit: "l",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate(),
      factor: 1.58
    },
    {
      project: "Schulpool",
      label: "Praktikumsplatzbewirtschaftung",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Marketing / Selektion / Eignungsverfahren",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Weiterentwicklung / Koordination / Qualitätssicherung Lehrplan",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Stundenplanung",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label:
        "Wissensmanagement / Entwicklung und Bewirtschaftung von Lehrmitteln",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "LTT-Bewirtschaftung",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Interkantonale und internationale Zusammenarbeit",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Gesundheitsförderung / Strahlenschutz",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Sonderabfallbewirtschaftung",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Material-/Geräte und Raumbewirtschaftung",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Schulpool",
      label: "Patiententriage / Patientenbehandlung DH",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Aufwand Weiterbildung und Dienstleistung",
      label: "Entwicklung (WB)",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      project: "Aufwand Weiterbildung und Dienstleistung",
      label: "Unterricht (WB)",
      type: "dynamic",
      unit: "l",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate(),
      factor: 2.26
    },
    {
      project: "Aufwand Weiterbildung und Dienstleistung",
      label: "Begleitung (WB)",
      type: "dynamic",
      unit: "h",
      start: moment()
        .subtract(2, "years")
        .startOf("year")
        .toDate()
    },
    {
      label: "Bemerkungen",
      type: "static",
      unit: "t",
      start: moment()
        .subtract(2, "year")
        .startOf("year")
        .toDate()
    },
    {
      label: "Bemerkungen",
      type: "range",
      unit: "t",
      start: moment()
        .subtract(2, "year")
        .startOf("year")
        .toDate()
    },
    {
      label: "Bemerkungen",
      type: "dynamic",
      unit: "t",
      start: moment()
        .subtract(2, "year")
        .startOf("year")
        .toDate()
    }
  ];

  // temp variables
  let dbRoles;
  let dbUsers;
  const dbElements = [];

  const createRoles = next => {
    Role.create(roles, (error, models) => {
      if (error) throw error;
      debug("created roles %o", models);
      dbRoles = models;
      next();
    });
  };

  const createUsers = next => {
    User.create(users, (error, models) => {
      if (error) throw error;
      debug("created users %o", models);
      dbUsers = models;
      next();
    });
  };

  const createElements = next => {
    async.eachSeries(
      elements,
      (element, nextElement) => {
        Element.create(element, (error, model) => {
          if (error) throw error;
          debug("created elements %o", model);
          dbElements.push(model);
          nextElement();
        });
      },
      next
    );
  };

  const createTracks = next => {
    Track.create(
      [
        {
          date: moment()
            .subtract(2, "days")
            .toDate(),
          value: 2,
          userId: dbUsers[1].id,
          elementId: dbElements[9].id
        },
        {
          date: new Date(),
          value: 4,
          userId: dbUsers[2].id,
          elementId: dbElements[10].id
        }
      ],
      (error, models) => {
        if (error) throw error;
        debug("created tracks %o", models);
        next();
      }
    );
  };

  const assignRoles = next => {
    const assignAdminRole = subNext => {
      dbRoles[0].principals.create(
        {
          principalType: RoleMapping.USER,
          principalId: dbUsers[0].id
        },
        (error, principal) => {
          if (error) throw error;
          debug("created principal %o", principal);
          subNext();
        }
      );
    };

    const assignUserRoles = subNext => {
      const principals = [
        {
          principalType: RoleMapping.USER,
          principalId: dbUsers[1].id
        },
        {
          principalType: RoleMapping.USER,
          principalId: dbUsers[2].id
        }
      ];
      dbRoles[1].principals.create(principals, (error, principal) => {
        if (error) throw error;
        debug("created principal %o", principal);
        subNext();
      });
    };

    async.parallel([assignAdminRole, assignUserRoles], next);
  };

  async.waterfall(
    [createRoles, createUsers, createElements, createTracks, assignRoles],
    waterfallErr => {
      if (waterfallErr) throw err;
      ds.disconnect();
    }
  );
});
