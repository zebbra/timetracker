const debug = require("debug")("cronjobs");
const path = require("path");
const moment = require("moment-timezone");
const async = require("async");
const _ = require("lodash");

const app = require(path.resolve(__dirname, "../server/server"));
const reporting = require(path.resolve(__dirname, "../common/reporting"));
const formatters = require(path.resolve(__dirname, "../common/formatters"));

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const yearTransition = async () => {
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

  while (app.booting) {
    debug("============ APP BOOTING ============");
    await sleep(100);
  }
  debug("============ APP STARTED ============");

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

                        debug(
                          Object.assign({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            ...profile
                          })
                        );

                        successfull.push(
                          `${user.username}: ${JSON.stringify(profile)}`
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
            // eslint-disable-next-line no-process-exit
            process.exit(0);
          }
        );
      }
    }
  );
};

yearTransition();
