const _ = require("lodash");
const async = require("async");
const moment = require("moment-timezone");
const debug = require("debug")("app:reporting:elements");

const { DATE_KEY_FORMAT } = require("./constants");
const formatters = require("../formatters");
const { fetchElements, fetchSetpoints } = require("./helpers");

moment.locale("de");

const elementsReporting = (models, params, callback) => {
  debug(JSON.stringify(params));
  const { start, end, userId, flat, position, includeRaw = false } = params;

  if (!start || !end || !userId)
    return callback(
      new Error("missing parameters (start, end, and userId are mandatory")
    );

  if (!start.isSame(end, "year"))
    return callback(new Error("invalid range (multiple years)"));

  const trackFields = includeRaw ? ["duration", "value", "date"] : ["duration"];

  const getElements = next => {
    fetchElements(
      models.element,
      {
        start,
        end,
        fields: ["id", "factor", "unit", "label", "project"],
        type: "dynamic",
        label: position,
        includeTracks: true,
        userId,
        trackFields
      },
      next
    );
  };

  const getSetpoints = next => {
    fetchSetpoints(
      models.setpoint,
      {
        year: start.year(),
        userId,
        fields: ["elementId", "value"]
      },
      next
    );
  };

  return async.parallel({ getElements, getSetpoints }, (err, data) => {
    if (err) {
      return callback(err);
    }
    const { getElements: elements, getSetpoints: setpoints } = data;

    const report = {
      reportingPeriod: {
        type: "elements",
        start,
        end
      },
      data: []
    };

    if (includeRaw) {
      report.raw = {};
    }

    report.data = _.map(elements, entry => {
      const element = entry.toJSON();

      const setpoint = _.find(setpoints, {
        elementId: element.id
      }) || {
        value: 0
      };

      const actual = formatters.asDecimal(
        formatters.secondsAsHours(
          _.reduce(
            element.tracks,
            (sum, track) => {
              if (includeRaw) {
                const key = moment(track.date).format(DATE_KEY_FORMAT);

                if (!report.raw[key]) report.raw[key] = [];

                report.raw[key].push({
                  label: element.label,
                  duration: track.duration,
                  unit: element.unit,
                  value: track.value
                });
              }

              return sum + track.duration;
            },
            0
          )
        )
      );

      const target = formatters.asDecimal(setpoint.value * element.factor);
      const targetLession = element.unit === "l" ? setpoint.value : null;

      const saldo = target * -1 + actual;

      Object.assign(element, {
        actual,
        actualFixed: formatters.asDecimalFixed(actual),
        targetLession,
        target,
        saldo
      });
      delete element.tracks;
      return element;
    });

    if (flat) {
      return callback(null, report.data);
    } else {
      return callback(null, report);
    }
  });
};

module.exports = elementsReporting;
