/* eslint-disable no-undefined */
const logError = require("debug")("app:error:element");
const async = require("async");
const moment = require("moment-timezone");
const _ = require("lodash");
const validators = require("../validators");
const errors = require("../errors");
const reporting = require("../reporting");

module.exports = Element => {
  /**
   * Validations
   */
  Element.validatesInclusionOf("project", {
    in: [
      "Default",
      "Unterrichts-Pool",
      "Schulpool",
      "Aufwand Weiterbildung und Dienstleistung"
    ]
  });
  Element.validatesFormatOf("label", validators.ALPHA_NUMERIC_EXTENDED_REGEX);
  Element.validatesLengthOf("label", { min: 3, max: 100 });
  Element.validatesInclusionOf("type", { in: ["static", "range", "dynamic"] });
  Element.validatesInclusionOf("unit", { in: ["d", "r", "h", "l", "n", "t"] });
  Element.validatesNumericalityOf("factor");
  Element.validatesDateOf("start");
  Element.validatesDateOf("end");

  /**
   * Remote hooks
   */

  // we have to manually whitelist the allowed attributes because we can not
  // use the strict=true setting on the Element model due to the maxStart and
  // minEnd attributes
  Element.beforeRemote("create", (ctx, unused, next) => {
    const whitelist = _.keys(Element.definition.properties);
    ctx.args.data = _.pick(ctx.args.data, whitelist);

    // make sure only one element with holiday=true exists
    if (ctx.args.data.holiday) {
      Element.count({ holiday: true }, (err, count) => {
        if (err) {
          logError(err);
          next(err);
        } else if (count > 0) {
          next(
            errors.customValidationError(
              "element",
              { holiday: ["duplicated"] },
              { holiday: ["an element with attribute holiday already exists"] }
            )
          );
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });

  Element.beforeRemote("prototype.patchAttributes", (ctx, unused, next) => {
    if (ctx.instance && ctx.instance.type !== "dynamic") {
      next(
        errors.customValidationError(
          "element",
          { type: ["unauthorized"] },
          { type: ["not authorized to alter non-dynamic elements"] }
        )
      );
    } else {
      const whitelist = _.keys(Element.definition.properties);
      ctx.args.data = _.pick(ctx.args.data, whitelist);
      next();
    }
  });

  /**
   * Operation hooks
   */

  // Make sure that the start date can not be set after the end date
  // and that the start-end date range can only be shrinked so far
  // that there are not related tracks cut off
  Element.observe("before save", (ctx, next) => {
    let start;
    let end;
    let id;

    if (ctx.instance) {
      start = ctx.instance.start;
      end = ctx.instance.end;
    } else {
      start = ctx.data.start || ctx.currentInstance.start;
      end = ctx.data.end || ctx.currentInstance.end;
      id = ctx.currentInstance.id;
    }

    if (!start) {
      next(
        errors.customValidationError(
          "element",
          { start: ["missing"] },
          { start: ["is missing"] }
        )
      );
    } else if (end) {
      if (!validators.startBeforeEnd(start, end)) {
        logError(`start ${start} is after end ${end}`);
        next(
          errors.customValidationError(
            "element",
            { start: ["invalid"], end: ["invalid"] },
            { start: ["must be after end"], end: ["must be before start"] }
          )
        );
      } else if (id) {
        Element.checkForValidDateRange(id, start, end, next);
      } else {
        next();
      }
    } else if (id) {
      Element.checkForValidDateRange(id, start, end, next);
    } else {
      next();
    }
  });

  // Set the maxStart and minEnd date and deletable flags on the elements
  Element.observe("loaded", (ctx, next) => {
    Element.findValidDateRange(
      ctx.data.id,
      ctx.data.start,
      ctx.data.end,
      (err, validRange) => {
        if (err) {
          next(err);
        } else {
          Object.assign(ctx.data, validRange);
          next();
        }
      }
    );
  });

  /**
   * Verify that the new start and end dates to not cut off one of the related tracks
   */
  Element.findValidDateRange = (id, start, end, callback) => {
    let firstTrack;
    let lastTrack;
    let deletable = true;

    const findFirstTrackForElement = next => {
      if (start) {
        Element.app.models.track.find(
          { where: { elementId: id }, order: "date ASC", limit: 1 },
          (err, tracks) => {
            if (err) {
              next(err);
            } else {
              firstTrack = tracks[0];
              if (firstTrack) deletable = false;
              next();
            }
          }
        );
      } else {
        next();
      }
    };

    const findLastTrackForElement = next => {
      if (end) {
        Element.app.models.track.find(
          { where: { elementId: id }, order: "date DESC", limit: 1 },
          (err, tracks) => {
            if (err) {
              next(err);
            } else {
              lastTrack = tracks[0];
              if (lastTrack) deletable = false;
              next();
            }
          }
        );
      } else {
        next();
      }
    };

    async.parallel([findFirstTrackForElement, findLastTrackForElement], err => {
      if (err) {
        logError(err);
        callback(err);
      } else {
        callback(null, {
          maxStart: firstTrack ? firstTrack.date : undefined,
          minEnd: lastTrack ? lastTrack.date : undefined,
          deletable
        });
      }
    });
  };

  Element.checkForValidDateRange = (id, start, end, callback) => {
    Element.findValidDateRange(id, start, end, (err, validRange) => {
      if (err) {
        callback(err);
      } else {
        const codes = {};
        const messages = {};
        let hasValidationError = false;

        if (
          validRange.maxStart &&
          validators.startBeforeEnd(validRange.maxStart, start)
        ) {
          logError(`start ${start} does cut off tracks`);
          codes.start = ["invalid"];
          messages.start = ["does contain tracks in the cut of range"];
          hasValidationError = true;
        } else if (
          validRange.minEnd &&
          validators.startBeforeEnd(end, validRange.minEnd)
        ) {
          logError(`end ${end} does cut off tracks`);
          codes.end = ["invalid"];
          messages.end = ["does contain tracks in the cut of range"];
          hasValidationError = true;
        }

        if (hasValidationError) {
          callback(errors.customValidationError("element", codes, messages));
        } else {
          callback(null, validRange);
        }
      }
    });
  };

  /**
   * Custom remote methods
   */

  /**
   * Calcualte actual, target, and saldo values for all elements of the given type available for
   * the specified range (start-end)
   */
  Element.reporting = (filter, { accessToken }, callback) => {
    const VALID_REPORTING_TYPES = [
      "indicator",
      "elements",
      "timeseries",
      "generic",
      "export",
      "csv"
    ];
    const filterError = validators.requiresFilter(filter, "where", [
      "start",
      "end",
      "type"
    ]);
    const dateError = validators.validDates(filter.where, ["start", "end"]);

    if (filterError) {
      return callback(filterError);
    }
    if (dateError) {
      return callback(dateError);
    }

    let reportingType;
    if (_.includes(VALID_REPORTING_TYPES, filter.where.type)) {
      reportingType = `${filter.where.type}Reporting`;
    } else {
      return callback(
        new Error(`${filter.where.type} is not a valid reporting type`)
      );
    }

    const params = {
      start: moment(filter.where.start).startOf("day"),
      end: moment(filter.where.end).endOf("day"),
      userId: accessToken.userId,
      flat: filter.where.flat !== undefined ? filter.where.flat : true,
      asMap: filter.where.asMap !== undefined ? filter.where.asMap : false,
      enhanced:
        filter.where.enhanced !== undefined ? filter.where.enhanced : false,
      yearScope:
        filter.where.yearScope !== undefined ? filter.where.yearScope : false,
      includeRaw:
        filter.where.includeRaw !== undefined ? filter.where.includeRaw : false,
      includeComments: filter.where.comments === true
    };

    return reporting[reportingType](Element.app.models, params, callback);
  };

  Element.remoteMethod("reporting", {
    accepts: [
      {
        arg: "filter",
        description:
          // eslint-disable-next-line quotes
          'Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})',
        type: "object",
        required: true
      },
      {
        arg: "options",
        type: "object",
        http: "optionsFromRequest"
      }
    ],
    accessType: "READ",
    description:
      "Get the specified reporting type for the specified time range",
    http: {
      path: "/reporting",
      verb: "get"
    },
    returns: {
      arg: "data",
      root: true,
      type: "array"
    }
  });
};
