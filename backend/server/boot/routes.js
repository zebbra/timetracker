module.exports = app => {
  const router = app.loopback.Router();
  router.get("/api/frontend-version", (_req, res) => {
    res.send({ version: app.settings.frontend.version });
  });
  app.use(router);
};
