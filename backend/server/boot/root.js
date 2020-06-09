const loopback = require("loopback");
const moment = require("moment-timezone");

moment.tz.setDefault("Europe/Zurich");

module.exports = server => {
  // Install a `/` route that returns server status
  const router = server.loopback.Router();
  router.get("/", server.loopback.status());
  server.use(router);
  server.use(
    loopback.token({
      model: server.models.accessToken,
      currentUserLiteral: "me"
    })
  );
};
