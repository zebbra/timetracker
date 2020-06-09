const logError = require("debug")("app:error:track");
const moment = require("moment-timezone");
const errors = require("../errors");
const duration = require("../duration");
const validators = require("../validators");

const SKPI_PARSE_UNITS = ["r", "t"];

module.exports = Track => {
  /**
   * Validations
   */
  Track.validatesFormatOf("label", {
    with: validators.NAME_REGEX,
    allowNull: true,
    allowBlank: true
  });
  Track.validatesPresenceOf("elementId");
  Track.validatesPresenceOf("userId");
  Track.validatesUniquenessOf("dayIndex");

  /**
   * Remote hooks that execute before or after calling a remote method
   */
  Track.beforeRemote("create", (ctx, unused, next) => {
    // make sure that the user cannot set a custom userId on the track
    ctx.args.data.userId = ctx.req.accessToken.userId;
    next();
  });

  /**
   * Operation hooks that execute when models perform crud operations
   *
   * Before save
   *   - check for closed date (if date is set)
   *   - validate value (if value is set)
   *   - set duration (if value is set)
   */
  Track.observe("before save", (ctx, next) => {
    let elementId;
    let userId;
    let date;
    let value;
    let closed;
    let internal = false;

    if (ctx.instance) {
      ({ elementId, userId, date, value, closed } = ctx.instance);
    } else if (ctx.currentInstance) {
      // we do not allow update of elementId --> set it to currentInstance on update
      elementId = ctx.currentInstance.elementId;
      // we do not allow update of userId --> set it to currentInstance on update
      userId = ctx.currentInstance.userId;
      ({ date, value, closed } = ctx.data);
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
          "track",
          { elementId: ["missing"] },
          { elementId: ["is missing"] }
        )
      );
    } else {
      Track.app.models.element.findById(elementId, (err, element) => {
        if (err) {
          // database error
          logError(err);
          next(errors.DATABASE_ERROR);
        } else if (!element) {
          // the referenced element was not found --> return error
          logError(`element with id ${elementId} is missing`);
          next(
            errors.customValidationError(
              "track",
              { elementId: ["missing"] },
              { elementId: ["was not found"] }
            )
          );
        } else if (ctx.Model.modelName === "track" && element.holiday) {
          // validate that the track is not generated as holiday
          logError("track must not be of type holiday");
          next(
            errors.customValidationError(
              "track",
              { elementId: ["invalid"] },
              { elementId: ["is a holiday element"] }
            )
          );
        } else if (ctx.Model.modelName === "holiday" && !element.holiday) {
          // validate that the holiday is only generated as holiday
          logError("holiday related element must be of type holiday");
          next(
            errors.customValidationError(
              "holiday",
              { elementId: ["invalid"] },
              { elementId: ["is a holiday element"] }
            )
          );
        } else if (date && validators.startBeforeEnd(date, element.start)) {
          // validate that track date is in valid element date range
          logError(
            `date ${date} is invalid due to element start ${element.start}`
          );
          next(
            errors.customValidationError(
              "track",
              { date: ["invalid"] },
              { date: ["in invalid element range start"] }
            )
          );
        } else if (date && validators.startBeforeEnd(element.end, date)) {
          // validate that track date is in valid element date range
          logError(`date ${date} is invalid due to element end ${element.end}`);
          next(
            errors.customValidationError(
              "track",
              { date: ["invalid"] },
              { date: ["in invalid element range end"] }
            )
          );
        } else if (date && validators.isClosedDate(date)) {
          // validate date for close date if set
          logError(`date ${date} is invalid`);
          next(
            errors.customValidationError(
              "track",
              { date: ["invalid"] },
              { date: [errors.RECORD_CLOSED] }
            )
          );
        } else if (value && !validators.validateByUnit(element.unit, value)) {
          // validate value by unit if set
          logError(`value ${value} is invalid`);
          next(
            errors.customValidationError(
              "track",
              { value: ["invalid"] },
              { value: [errors.INVALID_VALUE] }
            )
          );
        } else {
          // all valid
          if (ctx.instance) {
            // calculate the duration on create
            if (value) {
              ctx.instance.duration = duration.durationByUnit(
                element.unit,
                value,
                element.factor
              );
              if (SKPI_PARSE_UNITS.indexOf(element.unit) === -1)
                ctx.instance.value = Number(ctx.instance.value);
            }

            if (date) {
              // set the index on element-user-date on create
              const index = `${elementId}-${userId}-${moment(date).format(
                "DDMMYYYY"
              )}`;
              ctx.instance.dayIndex = index;
            }

            ctx.instance.type = element.type;
          } else {
            // calculate the duration on update
            if (value) {
              ctx.data.duration = duration.durationByUnit(
                element.unit,
                value,
                element.factor
              );
              if (SKPI_PARSE_UNITS.indexOf(element.unit) === -1)
                ctx.data.value = Number(ctx.data.value);
            }

            if (date) {
              // set the index on element-user-date on update
              const index = `${elementId}-${userId}-${moment(date).format(
                "DDMMYYYY"
              )}`;
              ctx.data.dayIndex = index;
            }

            ctx.data.type = element.type;
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
  Track.observe("before delete", (ctx, next) => {
    if (ctx.where.skipUserRelationClosedTest) {
      delete ctx.where.skipUserRelationClosedTest;
      return next();
    }

    if (ctx.where.order) delete ctx.where.order; // bug-fix for memory-db tests

    // make sure that "closed" tracks cannot be deleted
    return Track.app.models[ctx.Model.modelName].findOne(
      { where: ctx.where },
      (err, track) => {
        if (err) {
          logError(err);
          next(errors.DATABASE_ERROR);
        } else if (
          (track && validators.isClosedDate(track.date)) ||
          (track && track.closed === true)
        ) {
          next(errors.RECORD_CLOSED_ERROR);
        } else {
          next();
        }
      }
    );
  });
};
