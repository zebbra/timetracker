const path = require("path");
const async = require("async");
const debug = require("debug")("db:migration:automigrate");
const moment = require("moment");

const app = require(path.resolve(__dirname, "../server/server"));
const ds = app.dataSources.mongoDS;
const defaultModels = ["AccessToken", "ACL", "RoleMapping", "Role"];
const models = [
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

/**
 * Auto-migrate the schemas for datascource and models defined aboth
 * This will remove all defined model-collections and reinitialize them
 */
ds.automigrate([...defaultModels, ...models], err => {
  if (err) throw err;
  debug("models %o %s", [...defaultModels, ...models], ds.adapter.name);

  const User = app.models.user;
  const Element = app.models.element;
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

  const createRoles = next => {
    Role.create(roles, (error, dbModels) => {
      if (error) throw error;
      debug("created roles %o", dbModels);
      dbRoles = dbModels;
      next();
    });
  };

  const createUsers = next => {
    User.create(users, (error, dbModels) => {
      if (error) throw error;
      debug("created users %o", dbModels);
      dbUsers = dbModels;
      next();
    });
  };

  const createElements = next => {
    async.eachSeries(
      elements,
      (element, nextElement) => {
        Element.create(element, (error, dbModels) => {
          if (error) throw error;
          debug("created elements %o", dbModels);
          nextElement();
        });
      },
      next
    );
  };

  const assignRoles = next => {
    dbRoles[0].principals.create(
      {
        principalType: RoleMapping.USER,
        principalId: dbUsers[0].id
      },
      (error, principal) => {
        if (error) throw error;
        debug("created principal %o", principal);
        next();
      }
    );
  };

  async.waterfall(
    [createRoles, createUsers, createElements, assignRoles],
    waterfallErr => {
      if (waterfallErr) throw err;
      ds.disconnect();
    }
  );
});
