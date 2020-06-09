const Path = require("path");
const debug = require("debug")("cronjobs:atlas:backup");
const { spawn } = require("child_process");

function backup(callback) {
  const backupProcess = spawn("mongodump", [
    "--host",
    process.env.ATLAS_HOST,
    "--ssl",
    "--username",
    "admin",
    "--password",
    process.env.ATLAS_PASS,
    "--authenticationDatabase",
    "admin",
    `--archive=${Path.join(__dirname, "tmp", "backup.gz")}`,
    "--gzip",
    "--db",
    "timetracker"
  ]);

  backupProcess.stdout.on("data", data => debug(data.toString()));
  backupProcess.stderr.on("data", data => debug(data.toString()));
  backupProcess.on("close", code => {
    debug(`backup process exited with code ${code}`);
    return callback();
  });
}

module.exports = backup;
