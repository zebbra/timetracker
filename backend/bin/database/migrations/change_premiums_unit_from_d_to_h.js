const path = require("path");
const debug = require("debug")("db:migrations");
const moment = require("moment-timezone");

const app = require(path.resolve(__dirname, "../../../server/server"));
debug("Loading application...");
setTimeout(run, 1000 * 10);

function run() {
  const Element = app.models.element;
  const ds = app.dataSources.mongoDS;

  Element.findOne(
    { where: { label: "Treueprämien", unit: "d", end: null } },
    (err, element) => {
      if (err) {
        throw err;
      }

      if (element) {
        debug("Running Treueprämien unit change migration");
        element.updateAttributes(
          {
            end: moment()
              .year(2024)
              .endOf("year")
              .endOf("day")
          },
          (err, updatedElement) => {
            if (err) {
              throw err;
            }
            debug(
              "Treueprämien with unit d successfully ended at end of year 2024"
            );
            debug(updatedElement);

            const start = moment()
              .year(2025)
              .startOf("year")
              .startOf("day");

            Element.create(
              {
                project: "Default",
                label: "Treueprämien",
                type: "static",
                unit: "h",
                factor: 1,
                holiday: false,
                start,
                end: null,
                tooltip: "<p>Keine Informationen vorhanden</p>",
                maxStart: start
                  .clone()
                  .add(4, "years")
                  .toDate(),
                deletable: false
              },
              (err, newElement) => {
                if (err) {
                  throw err;
                }
                debug("Treueprämien with unit h successfully created");
                debug(newElement);
                ds.disconnect();
              }
            );
          }
        );
      } else {
        debug("Treueprämien migration already applied");
        ds.disconnect();
      }
    }
  );
}
