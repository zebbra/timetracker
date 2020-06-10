const debug = require("debug")("cronjobs:amazon:upload");
const _ = require("lodash");
const client = require("s3-client").createClient({
  s3Options: {
    accessKeyId: process.env.AMAZON_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY,
    region: "eu-central-1"
  }
});

function upload(file, callback) {
  const params = {
    localFile: file,
    s3Params: {
      Bucket: "medi-timetracker-backup",
      Key: `mongo-timetracker-${new Date().getDate()}.gz`
    }
  };

  debug(`Starting upload for ${params.localFile} to ${params.s3Params.Key}`);
  const uploader = client.uploadFile(params);
  uploader.on("error", err => callback(err));
  const logProgress = _.throttle(
    () =>
      debug(
        "progress",
        ((uploader.progressAmount / uploader.progressTotal) * 100).toFixed(2),
        "%"
      ),
    500
  );
  uploader.on("progress", logProgress);
  uploader.on("end", () => {
    logProgress.cancel();
    return callback(null, file);
  });
}

module.exports = upload;
