const path = require("path");
const debug = require("debug")("db:migration:autoupdate");

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
 * Auto-update the schemas for datascource and models defined aboth
 */
ds.autoupdate([...defaultModels, ...models], err => {
  if (err) throw err;
  debug("models %o %s", [...defaultModels, ...models], ds.adapter.name);
  ds.disconnect();
});
