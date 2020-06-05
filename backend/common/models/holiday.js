const logError = require("debug")("app:error:holiday");
const validators = require("../validators");
const errors = require("../errors");

module.exports = Holiday => {
  /**
   * Validations
   */
  Holiday.validatesFormatOf("label", validators.ALPHA_NUMERIC_EXTENDED_REGEX);
  Holiday.validatesPresenceOf("label");

  /**
   * Remote hooks that execute before or after calling a remote method
   */
  Holiday.beforeRemote("create", (ctx, unused, next) => {
    // make sure that the user cannot set a custom userId on the holiday
    Holiday.app.models.element.findOne(
      { where: { holiday: true } },
      (err, element) => {
        if (err) {
          logError(err);
          next(err);
        } else if (!element) {
          next(
            errors.customValidationError(
              "holiday",
              { elementId: ["missing"] },
              { elementId: ["no holiday element found"] }
            )
          );
        } else {
          ctx.args.data.userId = ctx.req.accessToken.userId;
          ctx.args.data.elementId = element.id;
          next();
        }
      }
    );
  });
};
