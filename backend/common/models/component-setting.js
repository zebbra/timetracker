module.exports = ComponentSetting => {
  /**
   * Remote hooks that execute before or after calling a remote method
   */
  ComponentSetting.beforeRemote("create", (ctx, unused, next) => {
    // make sure that the user cannot set a custom userId on the component-setting
    ctx.args.data.userId = ctx.req.accessToken.userId;
    next();
  });
};
