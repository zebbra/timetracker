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
        host: "smtp.sendgrid.net",
        secure: true,
        port: 465,
        tls: {
          rejectUnauthorized: false
        },
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_PASS
        }
      }
    ]
  }
};
