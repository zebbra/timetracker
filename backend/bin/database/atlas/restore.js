const Async = require("async");
const debug = require("debug")("database:atlas:restore");
const { spawn } = require("child_process");
const decompress = require("./decompress");

function restore(file, bucket, callback) {
  debug(`Going to restore ${file}`);
  Async.waterfall(
    [next => _prepareFile(file, bucket, next), _getArguments, _runCommand],
    callback
  );
}

function _prepareFile(file, bucket, callback) {
  if (bucket === "cloud.zebbra.ch.backups") {
    return decompress(file, (err, folder) => {
      return callback(null, folder, bucket);
    });
  }
  return callback(null, file, bucket);
}

function _getArguments(path, bucket, callback) {
  const arguments = [
    "--host",
    process.env.ATLAS_HOST,
    "--ssl",
    "--username",
    "admin",
    "--password",
    process.env.ATLAS_PASS,
    "--authenticationDatabase",
    "admin",
    "--drop"
  ];

  if (bucket === "cloud.zebbra.ch.backups") {
    ["--dir", path, "--db", "timetracker"].forEach(arg => arguments.push(arg));
  } else {
    [`--archive=${path}`, "--gzip"].forEach(arg => arguments.push(arg));
  }

  return callback(null, path, arguments);
}

function _runCommand(path, arguments, callback) {
  debug(`Running mongorestore with ${arguments}`);
  const restoreProcess = spawn("mongorestore", arguments);
  restoreProcess.stdout.on("data", data => debug(data.toString()));
  restoreProcess.stderr.on("data", data => debug(data.toString()));
  restoreProcess.on("close", code => {
    debug(`Restore process exited with code ${code}`);
    return callback(null, path);
  });
}

module.exports = restore;
