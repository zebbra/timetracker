const Async = require("async");
const Path = require("path");
const fs = require("fs");
const Raven = require("raven");
const debug = require("debug")("cronjobs:backup");
const backup = require("./atlas/backup");
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
  Async.waterfall([backup, upload, _cleanup], err => {
    if (err) {
      debug(`Database backup failed ${err}`);
      Raven.captureException("Backup failed err", err);
    } else {
      debug("Database backup successful");
    }
  });
}

function _cleanup(callback) {
  return fs.unlink(Path.join(__dirname, "atlas", "tmp", "backup.gz"), err => {
    if (err && err.code !== "ENOENT") {
      return callback(err);
    }

    return callback();
  });
}

module.exports = run;
