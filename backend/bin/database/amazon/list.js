const debug = require("debug")("database:amazon:list");
const client = require("s3-client").createClient({
  s3Options: {
    accessKeyId: process.env.AMAZON_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY,
    region: "eu-central-1"
  }
});

function list(bucket, callback) {
  const params = {
    s3Params: {
      Bucket: bucket
    }
  };

  debug(`Listing files for ${bucket}`);
  const files = [];
  const lister = client.listObjects(params);
  lister.on("error", err => {
    callback(err);
  });
  lister.on("data", data => {
    data.Contents.forEach(file => files.push(file));
  });
  lister.on("end", () => {
    callback(
      null,
      files.sort((a, b) => {
        if (a.Key < b.Key) {
          return 1;
        } else if (a.Key > b.Key) {
          return -1;
        }
        return 0;
      })
    );
  });
}

module.exports = list;
