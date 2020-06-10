const Async = require("async");
const debug = require("debug")("database:decompress");
const targz = require("targz");
const fs = require("fs");
const tar = require("tar-fs");
const rimraf = require("rimraf");

function run(file, callback) {
  const dest = file.replace("backup.tgz", "");
  return Async.waterfall(
    [next => _decompress(file, dest, next), _untar, _rename],
    callback
  );
}

function _decompress(src, dest, callback) {
  debug(`Decompress ${src} to ${dest}`);
  return targz.decompress({ src, dest }, err => {
    callback(err, `${dest}backup/export`, dest);
    debug(`Cleanup ${src}`);
    fs.unlink(src, err => err && debug(err));
  });
}

function _untar(src, dest, callback) {
  debug(`Untar ${src} to ${dest}`);
  const extract = tar.extract(dest);
  extract.on("error", err => callback(err));
  extract.on("finish", () => {
    callback(null, dest);
    debug(`Cleanup ${dest}backup`);
    rimraf(`${dest}backup`, err => err && debug(err));
  });
  return fs.createReadStream(src).pipe(extract);
}

function _rename(folder, callback) {
  const oldPath = `${folder}timetracker-server`;
  const newPath = `${folder}timetracker`;
  debug(`Rename ${oldPath} to ${newPath}`);
  return fs.rename(oldPath, newPath, err => callback(err, newPath));
}

module.exports = run;
