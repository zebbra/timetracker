const logError = require("debug")("app:error:employment");
const moment = require("moment");
const validators = require("../validators");
const errors = require("../errors");

module.exports = Employment => {
  /**
   * Validations
   */
  Employment.validatesFormatOf("scope", { with: validators.PERCENT });
  Employment.validatesDateOf("start");
  Employment.validatesDateOf("end");
  Employment.validatesPresenceOf("userId");

  /**
   * Operation hooks
   */

  // Make sure that the start date can not be set after the end date
  Employment.observe("before save", (ctx, next) => {
    let userId;
    let start;
    let end;
    let id;
    let internal = false;

    if (ctx.instance) {
      userId = ctx.instance.userId;
      start = ctx.instance.start;
      end = ctx.instance.end;
    } else if (ctx.currentInstance) {
      userId = ctx.currentInstance.userId;
      start = ctx.data.start || ctx.currentInstance.start;
      end = ctx.data.end || ctx.currentInstance.end;
      id = ctx.currentInstance.id;
    } else {
      internal = true;
    }

    if (start) {
      start = moment(start)
        .startOf("day")
        .toDate();
    }

    if (internal) {
      next();
    } else if (!start) {
      next(
        errors.customValidationError(
          "employment",
          { start: ["missing"] },
          { start: ["is missing"] }
        )
      );
    } else if (!validators.startBeforeEnd(start, end)) {
      logError(`start ${start} is after end ${end}`);
      next(
        errors.customValidationError(
          "employment",
          { start: ["invalid"], end: ["invalid"] },
          { start: ["must be after end"], end: ["must be before start"] }
        )
      );
    } else {
      Employment.intersections(id, start, end, userId, (err, intersections) => {
        if (err) {
          logError(err);
          next(err);
        } else if (intersections.length > 0) {
          logError(
            `found ${intersections.length} intersections for range ${start}-${end}`
          );
          next(
            errors.customValidationError(
              "employment",
              { start: ["invalid"], end: ["invalid"] },
              { start: ["existing employment"], end: ["existing employment"] }
            )
          );
        } else {
          // all valid
          next();
        }
      });
    }
  });

  /**
   * Find existing employments for the given start-end range
   */
  Employment.intersections = (id, start, end, userId, callback) => {
    // start is before this start and end is either after this end or null (open)
    const intersectionQueryStartAndEnd = {
      and: [
        { start: { lte: start } },
        { or: [{ end: null }, { end: { gte: end } }] }
      ]
    };

    // start is in this start-end range
    const intersectionQueryStart = {
      and: [{ start: { gte: start } }]
    };
    if (end) {
      intersectionQueryStart.and.push({ start: { lte: end } });
    }

    // end is in this start - end range
    const intersectionQueryEnd = {
      and: [{ end: { gte: start } }]
    };
    if (end) {
      intersectionQueryEnd.and.push({ end: { lte: end } });
    }

    // final query
    const intersectionQuery = {
      or: [
        intersectionQueryStartAndEnd,
        intersectionQueryStart,
        intersectionQueryEnd
      ],
      userId
    };

    // do not include this employment (for updates)
    if (id) {
      intersectionQuery.id = { neq: id };
    }

    Employment.find({ where: intersectionQuery, order: "start" }, callback);
  };

  /**
   * Remote hooks that execute before or after calling a remote method
   */
  Employment.beforeRemote("create", (ctx, unused, next) => {
    // make sure that the user cannot set a custom userId on the employment
    ctx.args.data.userId = ctx.req.accessToken.userId;
    next();
  });
};
