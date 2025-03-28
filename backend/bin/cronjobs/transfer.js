const debug = require("debug")("cronjobs:transfer");
const moment = require("moment-timezone");
const Async = require("async");
const _ = require("lodash");

const config = require("../../server/model-config.json");
const app = require("../../server/server");
const reporting = require("../../common/reporting");
const formatters = require("../../common/formatters");

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const yearTransition = async () => {
  // First get the reference date (next day) that we'll use for all calculations
  const referenceDate = moment().add(1, "d");

  // Calculate start of previous year
  const startOfYear = moment(referenceDate)
    .subtract(1, "year")
    .startOf("year");

  // Calculate end of previous year
  const endOfYear = moment(startOfYear).endOf("year");

  // Get the year from our reference date
  const year = referenceDate.year();
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
    year: year,
    closed: false
  };

  while (app.booting) {
    debug("============ APP BOOTING ============");
    await sleep(100);
  }
  debug("============ APP STARTED ============");

  debug("====== USING VARIABLES =========");
  debug(`startOfYear: ${startOfYear}`);
  debug(`endOfYear: ${endOfYear}`);
  debug(`year: ${year}`);

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
        debug(`job=yearTransition status=failed error=${err}`);
        throw err;
      } else {
        const users = _.chain(dbUsers)
          .map(user => user.toJSON())
          .filter(user => !_.find(user.roles, { name: "admin" }))
          .value();
        debug(
          `job=yearTransition going to transfer count=${users.length} users`
        );

        Async.eachSeries(
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
                  const profile = _.cloneDeep(defaultProfile);
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
                  debug(
                    `employment-profile query for user=${
                      user.id
                    } query: ${JSON.stringify(where)}`
                  );
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

                        debug(
                          Object.assign({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            ...profile
                          })
                        );

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
              `job=yearTransition status=done successfull=${successfull.length} failed=${failed.length}`
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
                from: config.Email.options.from,
                to: "devops@zebbra.ch",
                subject: "Zeiterfassung-medi cronjob report",
                html
              };

              app.models.Email.send(options, mailErr => {
                if (mailErr) {
                  debug(mailErr);
                }
                process.exit(0);
              });
            } else {
              process.exit(0);
            }
          }
        );
      }
    }
  );
};

if (require.main === module) {
  yearTransition();
}

// Export for testing
module.exports = {
  yearTransition
};
