const logError = require("debug")("app:error:setpoint");
const moment = require("moment-timezone");
const errors = require("../errors");
const validators = require("../validators");

module.exports = Setpoint => {
  /**
   * Validations
   */
  Setpoint.validatesPresenceOf("elementId");
  Setpoint.validatesPresenceOf("userId");
  Setpoint.validatesPresenceOf("yearIndex");
  Setpoint.validatesUniquenessOf("yearIndex");

  /**
   * Remote hooks that execute before or after calling a remote method
   */
  Setpoint.beforeRemote("create", (ctx, unused, next) => {
    // make sure that the user cannot set a custom userId on the setpoint
    ctx.args.data.userId = ctx.req.accessToken.userId;
    next();
  });

  /**
   * Operation hooks that execute when models perform crud operations
   *
   * Before save
   *   - check for closed year (if year is set)
   *   - validate value (if value is set)
   */
  Setpoint.observe("before save", (ctx, next) => {
    let elementId;
    let userId;
    let year;
    let value;
    let closed;
    let internal = false;

    if (ctx.instance) {
      ({ elementId, userId, year, value, closed } = ctx.instance);
    } else if (ctx.currentInstance) {
      // we do not allow update of elementId --> set it to currentInstance on update
      elementId = ctx.currentInstance.elementId;
      // we do not allow update of userId --> set it to currentInstance on update
      userId = ctx.currentInstance.userId;
      ({ year, value, closed } = ctx.data);
    } else {
      internal = true;
    }

    if (internal) {
      next();
    } else if (closed === true) {
      next(errors.RECORD_CLOSED);
    } else if (!elementId) {
      next(
        errors.customValidationError(
          "setpoint",
          { elementId: ["missing"] },
          { elementId: ["is missing"] }
        )
      );
    } else {
      Setpoint.app.models.element.findById(elementId, (err, element) => {
        if (err) {
          // database error
          logError(err);
          next(errors.DATABASE_ERROR);
        } else if (!element) {
          // the referenced element was not found --> return error
          logError(`element with id ${elementId} is missing`);
          next(
            errors.customValidationError(
              "setpoint",
              { elementId: ["missing"] },
              { elementId: ["was not found"] }
            )
          );
        } else if (element.type !== "dynamic") {
          // validate that the setpoint can only be generated for dynamic elements
          logError(`element with id ${element.id} must be of type dynamic`);
          next(
            errors.customValidationError(
              "setpoint",
              { elementId: ["invalid"] },
              { elementId: ["is a not a dynamic element"] }
            )
          );
        } else if (year && moment(element.start).year() > year) {
          // validate that setpoint year is in valid element date range
          logError(
            `year ${year} is invalid due to element start ${element.start}`
          );
          next(
            errors.customValidationError(
              "setpoint",
              { year: ["invalid"] },
              { year: ["in invalid element range start"] }
            )
          );
        } else if (year && element.end && moment(element.end).year() < year) {
          // validate that setpoint year is in valid element date range
          logError(`year ${year} is invalid due to element end ${element.end}`);
          next(
            errors.customValidationError(
              "setpoint",
              { year: ["invalid"] },
              { year: ["in invalid element range end"] }
            )
          );
        } else if (year && validators.isClosedYear(year) === true) {
          // validate year for close date if set
          logError(`year ${year} is invalid`);
          next(
            errors.customValidationError(
              "setpoint",
              { year: ["invalid"] },
              { year: [errors.RECORD_CLOSED] }
            )
          );
        } else if (value && !validators.twoDecimalsNumber(value)) {
          // validate value by unit if set
          logError(`value ${value} is invalid`);
          next(
            errors.customValidationError(
              "setpoint",
              { value: ["invalid"] },
              { value: [errors.INVALID_VALUE] }
            )
          );
        } else {
          // all valid
          if (year) {
            // set the index on element-user-year on create / update
            const index = `${elementId}-${userId}-${year}`;
            if (ctx.instance) {
              ctx.instance.yearIndex = index;
            } else {
              ctx.data.yearIndex = index;
            }
          }
          next();
        }
      });
    }
  });

  /**
   * Before delete
   *   - check for closed date
   */
  Setpoint.observe("before delete", (ctx, next) => {
    if (ctx.where.skipUserRelationClosedTest) {
      delete ctx.where.skipUserRelationClosedTest;
      return next();
    }

    if (ctx.where.order) delete ctx.where.order; // bug-fix for memory-db tests

    // make sure that "closed" setpoints cannot be deleted
    return Setpoint.app.models[ctx.Model.modelName].findOne(
      { where: ctx.where },
      (err, setpoint) => {
        if (err) {
          logError(err);
          next(errors.DATABASE_ERROR);
        } else if (
          (setpoint && validators.isClosedYear(setpoint.year)) ||
          setpoint.closed === true
        ) {
          next(errors.RECORD_CLOSED_ERROR);
        } else {
          next();
        }
      }
    );
  });
};
