const debug = require("debug")("app:server");

module.exports = function loginDemoUser(app) {
  if (process.env.NODE_ENV === "development") {
    app.models.user.login(
      {
        username: "demo",
        password: "demo1234"
      },
      "user",
      (_err, token) => {
        if (token) debug("demo user %o", { id: token.userId, token: token.id });
      }
    );
  }
};
