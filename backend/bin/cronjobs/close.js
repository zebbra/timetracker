const debug = require("debug")("cronjobs:close");
const moment = require("moment-timezone");
const Async = require("async");
const _ = require("lodash");

const config = require("../../server/model-config.json");
const app = require("../../server/server");

const YEAR_MODELS = ["employment-profile", "setpoint"];
const DATE_MODELS = ["track", "holiday"];
const END_MODELS = ["employment"];

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const closeModel = (model, query, callback) => {
  const Model = app.models[model];

  const fields = {
    closed: true
  };

  debug(
    `job=closeModel going to close ${model} for query=${JSON.stringify(query)}`
  );
  Model.update(query, fields, (err, info) => {
    if (err) {
      debug(`job=closeModel model=${model}s status=failed error=${err}`);
    } else {
      debug(`job=closeModel closed count=${info.count} ${model}s`);
    }

    setTimeout(() => callback(err), 2000);
  });
};

const closeAllModels = async () => {
  const models = [
    "employment-profile",
    "employment",
    "track",
    "holiday",
    "setpoint"
  ];
  const successfull = [];
  const failed = [];

  while (app.booting) {
    debug("============ APP BOOTING ============");
    await sleep(100);
  }
  debug("============ APP STARTED ============");

  debug(`job=closeAllModels going to close models=${models.join(", ")}`);
  Async.eachSeries(
    models,
    (model, next) => {
      const query = {
        closed: false
      };

      if (_.includes(YEAR_MODELS, model)) {
        _.assign(query, {
          year: { lt: moment().year() }
        });
      } else if (_.includes(DATE_MODELS, model)) {
        _.assign(query, {
          date: { lt: moment().startOf("year") }
        });
      } else if (_.includes(END_MODELS, model)) {
        _.assign(query, {
          end: { lt: moment().startOf("year") }
        });
      }

      closeModel(model, query, err => {
        if (err) {
          failed.push(model);
        } else {
          successfull.push(model);
        }
        next();
      });
    },
    () => {
      debug(
        `job=closeAllModels status=done successfull=${successfull.length} failed=${failed.length}`
      );

      if (process.env.NODE_ENV === "production") {
        let html = "<h2>Successfully closed the following models</h2><ul>";
        successfull.forEach(model => {
          html += `<li>${model}</li>`;
        });
        html += "</ul>";

        if (failed.length > 0) {
          html += "<h2>Closing of the following models failed</h2><ul>";
          failed.forEach(model => {
            html += `<li>${model}</li>`;
          });
          html += "</ul>";
        }

        const options = {
          from: config.Email.options.from,
          to: "devops@zebbra.ch",
          subject: "Zeiterfassung-medi cronjob report",
          html
        };

        app.models.Email.send(options, err => {
          if (err) {
            debug(err);
          }
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    }
  );
};

if (require.main === module) {
  closeAllModels();
}
