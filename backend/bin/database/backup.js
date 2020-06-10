require("dotenv").config();
const Async = require("async");
const fs = require("fs");
const Raven = require("raven");
const debug = require("debug")("cronjobs:database:backup");
const dump = require("./atlas/dump");
const upload = require("./amazon/upload");

const options = {
  environment:
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  logger: "server",
  autoBreadcrumbs: true
};

Raven.config(options).install();

function run() {
  debug("Starting database backup from mongoDB atlas to amazon S3");
  Async.waterfall(
    [
      dump,
      (file, next) => upload(file, next),
      (file, next) => _cleanup(file, next)
    ],
    err => {
      if (err) {
        debug(`Database backup failed ${err}`);
        Raven.captureException("Backup failed err", err);
      } else {
        debug("Database backup successful");
      }
    }
  );
}

function _cleanup(file, callback) {
  return fs.unlink(file, err => {
    if (err && err.code !== "ENOENT") {
      return callback(err);
    }

    return callback();
  });
}

module.exports = run;

if (require.main === module) {
  run();
}
