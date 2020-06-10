const Path = require("path");
const debug = require("debug")("cronjobs:atlas:dump");
const { spawn } = require("child_process");

function dump(callback) {
  const destinationPath = Path.join(__dirname, "dump", "backup.gz");
  const dumpProcess = spawn("mongodump", [
    "--host",
    process.env.ATLAS_HOST,
    "--ssl",
    "--username",
    "admin",
    "--password",
    process.env.ATLAS_PASS,
    "--authenticationDatabase",
    "admin",
    `--archive=${destinationPath}`,
    "--gzip",
    "--db",
    "timetracker"
  ]);

  dumpProcess.stdout.on("data", data => debug(data.toString()));
  dumpProcess.stderr.on("data", data => debug(data.toString()));
  dumpProcess.on("close", code => {
    debug(`dump process exited with code ${code}`);
    return callback(null, destinationPath);
  });
}

module.exports = dump;
