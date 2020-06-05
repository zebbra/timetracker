module.exports = app => {
  const { Role } = app.models;

  Role.registerResolver("teamLeader", (role, ctx, cb) => {
    const reject = () => {
      process.nextTick(() => {
        cb(null, false);
      });
    };

    // reject if target model is not user
    if (ctx.modelName !== "user") return reject();

    // reject anonymous users
    const { userId } = ctx.accessToken;
    if (!userId) return reject();

    // reject if the logged in user is not the requested user (enforce $owner)
    if (ctx.modelId.toString() !== userId.toString()) return reject();

    // check if the user is a teamLeader
    return app.models.membership.count(
      { memberId: userId, isTeamleader: true },
      (err, count) => {
        if (err) {
          cb(err);
        } else {
          cb(null, count > 0);
        }
      }
    );
  });
};
