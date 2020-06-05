const loopback = require("loopback");

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
