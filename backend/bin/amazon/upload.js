const Path = require("path");
const debug = require("debug")("cronjobs:amazon:upload");
const client = require("s3-client").createClient({
  s3Options: {
    accessKeyId: process.env.AMAZON_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY,
    region: "eu-central-1"
  }
});

function upload(callback) {
  const params = {
    localFile: Path.join(__dirname, "../atlas", "tmp", "backup.gz"),
    s3Params: {
      Bucket: "medi-timetracker-backup",
      Key: `mongo-timetracker-${new Date().getDate()}.gz`
    }
  };

  debug(`Starting upload for ${params.localFile} to ${params.s3Params.Key}`);
  const uploader = client.uploadFile(params);
  uploader.on("error", err => callback(err));
  uploader.on("progress", () =>
    debug(
      "progress",
      uploader.progressMd5Amount,
      uploader.progressAmount,
      uploader.progressTotal
    )
  );
  uploader.on("end", () => callback());
}

module.exports = upload;
