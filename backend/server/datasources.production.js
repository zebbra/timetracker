module.exports = {
  mongoDS: {
    url: process.env.MONGO_URL,
    name: "mongoDS",
    protocol: "mongodb+srv",
    connector: "mongodb"
  },
  emailDS: {
    name: "emailDS",
    connector: "mail",
    transports: [
      {
        type: "smtp",
        host: process.env.SMTP_HOST,
        secure: false,
        port: 25,
        tls: {
          rejectUnauthorized: false
        }
      }
    ]
  }
};
