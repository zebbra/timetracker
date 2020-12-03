const Path = require("path");
const Async = require("async");
const debug = require("debug")("database:amazon:download");
const _ = require("lodash");
const client = require("s3-client").createClient({
  s3Options: {
    accessKeyId: process.env.AMAZON_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY,
    region: "eu-central-1"
  }
});

const list = require("./list");

function download(bucket, callback) {
  return Async.waterfall(
    [
      next => list(bucket, next),
      _latest,
      (file, next) => _download(file, bucket, next)
    ],
    (err, result) => {
      if (err) {
        return callback(err);
      }

      return callback(null, result);
    }
  );
}

function _latest(files, callback) {
  const sortedFiles = files.sort(
    (a, b) =>
      new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime()
  );
  const file = sortedFiles[0];
  debug(`Found latest file ${file.Key}`);
  callback(null, file);
}

function _download(file, bucket, callback) {
  const ending = _.last(file.Key.split("."));
  const destinationPath = Path.join(
    __dirname,
    "../atlas",
    "dump",
    `backup.${ending}`
  );
  debug(`Going to download to ${destinationPath}`);
  const downloader = client.downloadFile({
    localFile: destinationPath,
    s3Params: {
      Bucket: bucket,
      Key: file.Key
    }
  });
  downloader.on("error", err => callback(err));
  const logProgress = _.throttle(
    () =>
      debug(
        "progress",
        ((downloader.progressAmount / downloader.progressTotal) * 100).toFixed(
          2
        ),
        "%"
      ),
    500
  );
  downloader.on("progress", logProgress);
  downloader.on("end", () => {
    logProgress.cancel();
    return callback(null, destinationPath);
  });
}

module.exports = download;
