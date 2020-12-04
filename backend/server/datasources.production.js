module.exports = {
  mongoDS: {
    url: process.env.MONGO_URL,
    name: "mongoDS",
    protocol: "mongodb+srv",
    connector: "mongodb"
  },
  emailDS: {
    name: "emailDS",
    connector: "loopback-connector-mailgun",
    apikey: process.env.MAILGUN_API_KEY,
    domain: "sandbox1f404105e3f742cb84d090f69e5cc455.mailgun.org"
  }
};
