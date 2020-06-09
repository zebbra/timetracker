const schedule = require("node-schedule");
const debug = require("debug")("cronjobs");
const path = require("path");
const moment = require("moment");
const async = require("async");
const _ = require("lodash");

const backup = require("./backup");
const app = require(path.resolve(__dirname, "../server/server"));
const reporting = require(path.resolve(__dirname, "../common/reporting"));
const formatters = require(path.resolve(__dirname, "../common/formatters"));

const YEAR_MODELS = ["employment-profile", "setpoint"];
const DATE_MODELS = ["track", "holiday"];
const END_MODELS = ["employment"];

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
      debug(
        `job=closeModel model=${model}s status=failed error=${err} nextInvocation=${closeAllModelsJob.nextInvocation()}`
      );
    } else {
      debug(
        `job=closeModel closed count=${
          info.count
        } ${model}s nextInvocation=${closeAllModelsJob.nextInvocation()}`
      );
    }

    setTimeout(() => callback(err), 2000);
  });
};

const closeAllModels = () => {
  const models = [
    "employment-profile",
    "employment",
    "track",
    "holiday",
    "setpoint"
  ];
  const successfull = [];
  const failed = [];

  debug(`job=closeAllModels going to close models=${models.join(", ")}`);
  async.eachSeries(
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
        `job=closeAllModels status=done successfull=${
          successfull.length
        } failed=${
          failed.length
        } nextInvocation=${closeAllModelsJob.nextInvocation()}`
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
          from: "noreply@medi.ch",
          to: "devops@zebbra.ch",
          subject: "Zeiterfassung-medi cronjob report",
          html
        };

        app.models.Email.send(options, err => {
          if (err) {
            debug(err);
          }
        });
      }
    }
  );
};

const yearTransition = () => {
  const startOfYear = moment()
    .subtract(1, "year")
    .startOf("year");
  const endOfYear = startOfYear.clone().endOf("year");
  const year = moment().year();
  const successfull = [];
  const failed = [];
  const defaultProfile = {
    plannedVacations: 0,
    plannedMixed: 0,
    plannedQuali: 0,
    plannedPremiums: 0,
    transferTotalLastYear: 0,
    transferOvertime: 0,
    transferGrantedVacations: 0,
    transferGrantedOvertime: 0,
    manualCorrection: 0,
    year: moment().year(),
    closed: false
  };

  app.models.user.find(
    {
      include: {
        relation: "roles",
        scope: {
          where: { name: { neq: "admin" } }
        }
      }
    },
    (err, dbUsers) => {
      if (err) {
        debug(
          `job=yearTransition status=failed error=${err} nextInvocation=${yearTransitionJob.nextInvocation()}`
        );
      } else {
        const users = _.chain(dbUsers)
          .map(user => user.toJSON())
          .filter(user => !_.find(user.roles, { name: "admin" }))
          .value();
        debug(
          `job=yearTransition going to transfer count=${users.length} users`
        );

        async.eachSeries(
          users,
          (user, next) => {
            reporting.timeseriesReporting(
              app.models,
              { start: startOfYear, end: endOfYear, userId: user.id },
              (reportingErr, report) => {
                if (reportingErr) {
                  debug(
                    `job=yearTransition user=${user.id} action=report status=failed error=${reportingErr} going to apply default profile`
                  );
                  failed.push(`${user.username}: ${reportingErr.message}`);
                  setTimeout(next, 100);
                } else {
                  const profile = _.clone(defaultProfile);
                  profile.userId = user.id;

                  if (report.total.target > 0) {
                    profile.transferTotalLastYear = report.total.target;
                  }

                  if (report.total.currentSaldo > 0) {
                    if (
                      report.total.currentSaldo >
                      profile.transferTotalLastYear / 100
                    ) {
                      profile.transferOvertime = formatters.asDecimal(
                        profile.transferTotalLastYear / 100
                      );
                    } else {
                      profile.transferOvertime = report.total.currentSaldo;
                    }
                  }

                  const where = { userId: user.id, year };
                  app.models["employment-profile"].findOne(
                    { where },
                    (findError, dbEntry) => {
                      if (findError) {
                        debug(
                          `job=yearTransition user=${user.id} action=findProfile status=failed error=${findError}`
                        );
                        failed.push(`${user.username}: ${findError.message}`);
                      } else {
                        if (dbEntry) {
                          profile.id = dbEntry.id;
                        }

                        app.models["employment-profile"].upsert(
                          profile,
                          upserError => {
                            if (upserError) {
                              debug(
                                `job=yearTransition user=${user.id} action=createProfile status=failed error=${findError}`
                              );
                              failed.push(
                                `${user.username}: ${upserError.message}`
                              );
                            } else {
                              successfull.push(
                                `${user.username}: ${JSON.stringify(profile)}`
                              );
                            }
                          }
                        );
                      }

                      setTimeout(next, 100);
                    }
                  );
                }
              }
            );
          },
          () => {
            debug(
              `job=yearTransition status=done successfull=${
                successfull.length
              } failed=${
                failed.length
              } nextInvocation=${yearTransitionJob.nextInvocation()}`
            );

            if (process.env.NODE_ENV === "production") {
              let html =
                "<h2>Successfully transfered the following users</h2><ul>";
              successfull.forEach(user => {
                html += `<li>${user}</li>`;
              });
              html += "</ul>";

              if (failed.length > 0) {
                html += "<h2>Failed to transfer the following users</h2><ul>";
                failed.forEach(user => {
                  html += `<li>${user}</li>`;
                });
                html += "</ul>";
              }

              const options = {
                from: "noreply@medi.ch",
                to: "devops@zebbra.ch",
                subject: "Zeiterfassung-medi cronjob report",
                html
              };

              app.models.Email.send(options, mailErr => {
                if (mailErr) {
                  debug(mailErr);
                }
              });
            }
          }
        );
      }
    }
  );
};

// second minute hour day-of-month month day-of-week
const closeAllModelsJob = schedule.scheduleJob("0 5 0 1 3 *", closeAllModels);
debug(
  `starting job=closeAllModels nextInvocation=${closeAllModelsJob.nextInvocation()}`
);
const yearTransitionJob = schedule.scheduleJob("0 5 0 1 1 *", yearTransition);
debug(
  `starting job=yearTransitionJob nextInvocation=${yearTransitionJob.nextInvocation()}`
);
const databaseBackupJob = schedule.scheduleJob("0 0 2 * * *", backup);
debug(
  `starting job=databaseBackupJob nextInvocation=${databaseBackupJob.nextInvocation()}`
);
