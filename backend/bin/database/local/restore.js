const Async = require("async");
const debug = require("debug")("database:local:restore");
const { spawn } = require("child_process");
const decompress = require("../atlas/decompress");

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
      return callback(err, folder, bucket);
    });
  }
  return callback(null, file, bucket);
}

function _getArguments(path, bucket, callback) {
  const args = ["--host", "localhost", "--drop"];

  if (bucket === "cloud.zebbra.ch.backups") {
    ["--dir", path, "--db", "timetracker"].forEach(arg => args.push(arg));
  } else {
    [`--archive=${path}`, "--gzip"].forEach(arg => args.push(arg));
  }

  return callback(null, path, args);
}

function _runCommand(path, args, callback) {
  debug(`Running mongorestore with ${args}`);
  const restoreProcess = spawn("mongorestore", args);
  restoreProcess.stdout.on("data", data => debug(data.toString()));
  restoreProcess.stderr.on("data", data => debug(data.toString()));
  restoreProcess.on("close", code => {
    debug(`Restore process exited with code ${code}`);
    return callback(null, path);
  });
}

module.exports = restore;
