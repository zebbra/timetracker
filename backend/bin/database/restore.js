require("dotenv").config();
const debug = require("debug")("database:restore");
const Async = require("async");
const fs = require("fs");
const rimraf = require("rimraf");

const download = require("./amazon/download");
const restore = require("./atlas/restore");
const restoreLocal = require("./local/restore");

function run() {
  debug("Starting database restore from amazon s3 to mongoDB atlas");
  const bucket = process.argv.slice(2)[0] || "medi-timetracker-backup";
  const target = process.argv.slice(3)[0] || "atlas";

  if (
    ["medi-timetracker-backup", "cloud.zebbra.ch.backups"].indexOf(bucket) ===
    -1
  ) {
    throw new Error("invalid bucket argument");
  }

  Async.waterfall(
    [
      next => download(bucket, next),
      (file, next) =>
        target === "local"
          ? restoreLocal(file, bucket, next)
          : restore(file, bucket, next),
      (file, next) => _cleanup(file, bucket, next)
    ],
    err => {
      if (err) {
        debug(`Database restore failed ${err}`);
      } else {
        debug("Database restore successful");
      }
    }
  );
}

function _cleanup(path, bucket, callback) {
  debug(`Cleanup ${path}`);

  if (bucket === "cloud.zebbra.ch.backups") {
    return rimraf(path, callback);
  }

  return fs.unlink(path, err => {
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
