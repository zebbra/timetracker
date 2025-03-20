const _ = require("lodash");
const async = require("async");
const moment = require("moment-timezone");

const { fetchEmployments, calcWeekdays } = require("./helpers");
const formatters = require("../formatters");
const fetchAll = require("./all");
const { DATE_KEY_FORMAT, INDICATOR_TO_REPORTS_LOOKUP } = require("./constants");

moment.locale("de");

const csvReporting = (models, params, callback) => {
  // whether to sum up or to display per day
  const aggregated = params.flat;

  // if true and aggregated is false, then we filter out
  // days for which there are no entries
  const compact = params.compact;

  // if a position is given, we report only the given
  // element / indicator
  const position = params.position;

  params.includeRaw = true;
  params.yearScope = true;
  params.enhanced = true;
  params.asMap = true;
  params.flat = false;

  const { start, end, userId } = params;
  if (!start || !end || !userId)
    return callback(
      new Error("missing parameters (start, end, and userId are mandatory")
    );

  if (!start.isSame(end, "year"))
    return callback(new Error("invalid range (multiple years)"));

  if (aggregated && compact)
    return callback(new Error("aggregated and compact are mutually exclusive"));

  if (aggregated && params.includeComments)
    return callback(
      new Error("aggregated and comments are mutually exclusive")
    );

  if (position && params.includeComments)
    return callback(new Error("position and comments are mutually exclusive"));

  const getEmployments = next => {
    if (!aggregated) {
      fetchEmployments(
        models.employment,
        {
          start: start.clone().startOf("year"),
          end: end.clone().endOf("year"),
          userId
        },
        next
      );
    } else {
      next();
    }
  };

  return async.parallel(
    {
      getAll: next => fetchAll(models, params, next),
      getEmployments
    },
    (err, data) => {
      if (err) {
        return callback(err);
      }

      const {
        getAll: { elements, timeseries, reports },
        getEmployments: employments
      } = data;

      if (position) {
        const elementLabels = elements.data.map(({ label }) => label);
        const indicatorLabels = Object.keys(reports.indicators);
        const validPositions = _.uniq(_.concat(elementLabels, indicatorLabels));
        if (!_.includes(validPositions, position)) {
          return callback(new Error(`Position ${position} is not valid`));
        }
      }

      let timestamps = false;
      if (compact) {
        const elementTimestamps = Object.keys(elements.raw);
        const timeseriesTimestamps = Object.keys(timeseries.raw);
        timestamps = _.sortBy(
          _.uniq(_.concat(elementTimestamps, timeseriesTimestamps))
        ).reverse();
      }

      let dates;
      if (compact && timestamps) {
        dates = timestamps
          .map(date => ({ date: moment(date) }))
          .filter(timestamp => {
            // must be between start and end
            return timestamp.date.isBetween(start, end, "day", "[]");
          });
      } else if (!aggregated) {
        const result = calcWeekdays(
          {
            start,
            end
          },
          employments
        );
        dates = result.dates;
      }

      const rows = [];

      function genHeaders(title = "Element") {
        if (aggregated) {
          return [title, "Soll [L]", "Soll [h]", "Ist [h]", "Saldo"];
        }

        return [
          title,
          ...dates.map(o => o.date.format("ddd DD.MM.YYYY")),
          "Soll [L]",
          "Soll [h]",
          "Ist [h]",
          "Saldo"
        ];
      }

      function genTitle(title) {
        if (aggregated) {
          return [title, null, null, null, null];
        }

        return [title, ...dates.map(() => null), null];
      }

      function genEmptyRow() {
        if (aggregated) {
          return [null, null, null, null, null];
        }

        return [null, ...dates.map(() => null), null];
      }

      const sumTracks = {};
      function genRow(element, type) {
        const row = [element.label];

        if (!aggregated) {
          const aggrKey = element.sum || element.sub;
          if (aggrKey) {
            if (!sumTracks[aggrKey]) {
              sumTracks[aggrKey] = {};
            }
          }

          dates.forEach(({ date }) => {
            if (type || element.getSum) {
              const key = date.format(DATE_KEY_FORMAT);
              let track;
              if (element.getSum) {
                track = _.get(sumTracks, `${element.getSum}.${key}`);
              } else if (type === "lecture") {
                track = _.find(_.get(elements.raw, key, []), {
                  label: element.lookupKey || element.label
                });
              } else if (type === "hours") {
                track = _.find(_.get(timeseries.raw, key, []), {
                  label: element.lookupKey
                });
              }

              if (track) {
                if (aggrKey && track.unit !== "t") {
                  if (!sumTracks[aggrKey][key]) {
                    sumTracks[aggrKey][key] = {
                      duration: element.sum
                        ? track.duration
                        : track.duration * -1
                    };
                  } else {
                    sumTracks[aggrKey][key].duration += element.sum
                      ? track.duration
                      : track.duration * -1;
                  }
                }
                row.push(
                  track.unit === "t"
                    ? track.value
                    : `${element.sub ? "-" : ""}${formatters.asDecimalFixed(
                        formatters.secondsAsHours(track.duration)
                      )}`
                );
              } else {
                row.push(null);
              }
            } else {
              row.push(null);
            }
          });
        }

        switch (element.unit) {
          case "l":
            row.push(
              formatters.asDecimal(
                element.lessions || element.target / element.factor
              )
            );
            row.push(formatters.asDecimal(element.target));
            break;
          default:
            row.push(null);
            row.push(formatters.asDecimal(element.target));
        }

        row.push(formatters.asDecimal(element.actual));
        row.push(
          formatters.asDecimal(
            element.saldo || element.target * -1 + element.actual
          )
        );

        return row;
      }

      const POSITIONS_WITH_SALDO = ["Krankheit", "Bew. Nachqual."];
      if (position) {
        rows.push(genHeaders("Position"));
        if (reports.indicators[position]) {
          const element = {
            label: position,
            lookupKey: position,
            actual: reports[`${INDICATOR_TO_REPORTS_LOOKUP[position]}Actual`],
            target: reports[`${INDICATOR_TO_REPORTS_LOOKUP[position]}Target`],
            sub: "Total Jahresarbeitszeit"
          };
          if (POSITIONS_WITH_SALDO.includes(position)) {
            element.saldo =
              reports[`${INDICATOR_TO_REPORTS_LOOKUP[position]}Actual`];
          }
          rows.push(genRow(element, "hours"));
        } else {
          const element = _.find(elements.data, { label: position });
          if (element) {
            rows.push(genRow({ ...element, sum: element.project }, "lecture"));
          }
        }

        return callback(null, rows);
      }

      // Filter out elements which we do not want to report in generic elements report
      const projects = _.chain(elements.data)
        .filter(entry => !_.includes(["Default"], entry.project))
        .groupBy("project")
        .mapValues(entries => {
          const sorted = _.map(_.sortBy(entries, "label"), entry => {
            entry.sum = entry.project;
            return entry;
          });

          const localTotal = {
            label: `Total ${entries[0].label}`,
            unit: "l",
            actual: _.sum(_.map(entries, "actual")),
            target: _.sum(_.map(entries, "target")),
            lessions: _.sum(_.map(entries, "targetLession")),
            getSum: entries[0].project
          };

          sorted.push(localTotal);

          rows.push(genTitle(sorted[0].project));
          rows.push(genHeaders());
          sorted.forEach(element => {
            rows.push(genRow(element, "lecture"));
          });
          rows.push(genEmptyRow());
          return sorted;
        })
        .value();

      rows.push(genTitle("Total"));
      rows.push(genHeaders());
      let totalActual = 0;
      let totalTarget = 0;
      let totalLessions = 0;
      _.values(projects).forEach((elements, index) => {
        const totalElement = _.clone(_.last(elements));
        if (index > 0) {
          totalElement.label = ` + ${totalElement.label}`;
        }
        totalElement.sum = "Total Lehrauftrag";
        totalActual += totalElement.actual;
        totalTarget += totalElement.target;
        totalLessions += totalElement.lessions;
        rows.push(genRow(totalElement));
      });
      rows.push(
        genRow({
          label: " = Total Lehrauftrag",
          unit: "l",
          actual: totalActual,
          target: totalTarget,
          lessions: totalLessions,
          getSum: "Total Lehrauftrag"
        })
      );
      rows.push(genEmptyRow());

      rows.push(genTitle("Jahresarbeitszeit Effektiv"));
      rows.push(genHeaders());
      rows.push(
        genRow(
          {
            label: "Total Jahresarbeitszeit",
            lookupKey: "Von-Bis",
            actual: reports.totalHoursActual,
            target: reports.totalHoursTarget,
            sum: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow(
          {
            label: "./. Total Ferien in Stunden je nach %",
            lookupKey: "Ferien",
            actual: reports.totalVacationsForYearActual,
            target: reports.totalVacationsForYearTarget,
            sub: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow({
          label: " = Total Jahresarbeitszeit netto",
          actual: reports.totalWorkingHoursForYearNetActual,
          target: reports.totalWorkingHoursForYearNetTarget
        })
      );
      rows.push(
        genRow({
          label: "ev. Minus/plus Zeitübertrag Vorjahr",
          actual: reports.totalTransferTimeActual,
          target: reports.totalTransferTimeTarget,
          sub: "Total Jahresarbeitszeit"
        })
      );
      rows.push(
        genRow({
          label: "ev. Minus bewilligte Ferien Vorjahr in Stunden",
          actual: reports.totalTransferVacationsActual,
          target: reports.totalTransferVacationsTarget,
          sub: "Total Jahresarbeitszeit"
        })
      );
      rows.push(
        genRow(
          {
            label: "ev. Minus Militär, Mutterschaft und Diverses",
            lookupKey: "Militär / Mutterschaft / Diverses",
            actual: reports.totalMixedActual,
            target: reports.totalMixedTarget,
            sub: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow(
          {
            label: "ev. Minus Bewilligte Nachqualifikation",
            lookupKey: "Bew. Nachqual.",
            actual: reports.totalQualiActual,
            target: reports.totalQualiTarget,
            sub: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow(
          {
            label: "ev. Minus Treueprämien",
            lookupKey: "Treueprämien",
            actual: reports.totalPremiumsActual,
            target: reports.totalPremiumsTarget,
            sub: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow(
          {
            label: "ev. Minus Besondere Abwesenheiten",
            lookupKey: "Besondere Abwesenheiten",
            actual: reports.totalSpecialAbsencesActual,
            target: reports.totalSpecialAbsencesTarget,
            saldo: reports.totalSpecialAbsencesActual,
            sub: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow(
          {
            label: "ev. Minus Krankheit",
            lookupKey: "Krankheit",
            actual: reports.totalSicknessActual,
            target: reports.totalSicknessTarget,
            saldo: reports.totalSicknessActual,
            sub: "Total Jahresarbeitszeit"
          },
          "hours"
        )
      );
      rows.push(
        genRow({
          label: " = Total Jahresarbeitszeit effektiv",
          actual: reports.totalWorkingHoursForYearEffectivelyActual,
          target: reports.totalWorkingHoursForYearEffectivelyTarget,
          getSum: "Total Jahresarbeitszeit"
        })
      );
      rows.push(genEmptyRow());

      rows.push(genTitle("Finale Zusammenfassung"));
      rows.push(genHeaders());
      rows.push(
        genRow({
          label: " Total Lehrauftrag",
          actual: reports.totalLectureshipHoursActual,
          target: reports.totalLectureshipHoursTarget,
          lessions: reports.totalLectureshipLessionsTarget,
          sum: "Total Saldo",
          getSum: "Total Lehrauftrag",
          unit: "l"
        })
      );
      rows.push(
        genRow({
          label: " ./. Total Jahresarbeitszeit effektiv",
          actual: reports.totalWorkingHoursForYearEffectivelyActual,
          target: reports.totalWorkingHoursForYearEffectivelyTarget,
          sum: "Total Saldo",
          getSum: "Total Jahresarbeitszeit"
        })
      );
      rows.push(
        genRow({
          label: " = Saldo pro Jahr ",
          actual: reports.totalSaldoActual,
          target: reports.totalSaldoTarget,
          getSum: "Total Saldo"
        })
      );

      if (!aggregated && params.includeComments) {
        rows.push(genEmptyRow());
        rows.push(genTitle("Bemerkungen"));
        rows.push(genHeaders());
        rows.push(
          genRow(
            {
              label: "Zeit",
              lookupKey: "Bemerkungen",
              unit: "t"
            },
            "hours"
          )
        );
        rows.push(
          genRow(
            {
              label: "Leistungselemente",
              lookupKey: "Bemerkungen",
              unit: "t"
            },
            "lecture"
          )
        );
        rows.push(
          genRow(
            {
              label: "Leistungselemente",
              lookupKey: "Bemerkungen 2",
              unit: "t"
            },
            "lecture"
          )
        );
        rows.push(
          genRow(
            {
              label: "Leistungselemente",
              lookupKey: "Bemerkungen 3",
              unit: "t"
            },
            "lecture"
          )
        );
        rows.push(
          genRow(
            {
              label: "Leistungselemente",
              lookupKey: "Bemerkungen 4",
              unit: "t"
            },
            "lecture"
          )
        );
      }

      return callback(null, rows);
    }
  );
};

module.exports = csvReporting;
