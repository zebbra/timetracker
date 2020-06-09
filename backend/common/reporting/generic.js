const _ = require("lodash");
const moment = require("moment-timezone");

const formatters = require("../formatters");
const fetchAll = require("./all");

moment.locale("de");

const genericReporting = (models, params, callback) => {
  params.yearScope = true;
  params.enhanced = true;
  params.asMap = false;
  params.flat = false;
  params.includeRaw = false;

  return fetchAll(models, params, (err, data) => {
    if (err) {
      return callback(err);
    }

    const { reportingPeriod, elements, reports } = data;

    const report = {
      reportingPeriod: {
        type: "generic",
        start: reportingPeriod.start,
        end: reportingPeriod.end,
        workingdays: reportingPeriod.workingdays,
        profile: reportingPeriod.profile
      },
      data: []
    };

    // Filter out elements which we do not want to report in generic elements report
    const elementsToReport = _.filter(
      elements.data,
      entry => !_.includes(["Default"], entry.project)
    );

    // Handle element project totals (Unterrichts-Pool, Schulpool, and Aufwand Weiterbildung und Dienstleistung)
    const totals = {};
    _.keys(_.groupBy(elementsToReport, "project")).forEach(key => {
      totals[key] = {
        label: key,
        hours: 0,
        lessions: 0,
        actual: 0
      };
    });

    const projectsRaw = _.chain(elementsToReport)
      .groupBy("project")
      .mapValues(entries =>
        _.chain(entries)
          .map(entry => {
            // add to element's project total counters
            totals[entry.project].hours += entry.target;
            if (entry.unit === "l")
              totals[entry.project].lessions += entry.targetLession;
            totals[entry.project].actual += entry.actual;

            return [
              entry.label,
              entry.targetLession,
              formatters.asDecimal(entry.target),
              formatters.asDecimal(entry.actual),
              ""
            ];
          })
          .sortBy(0)
          .value()
      )
      .toPairs()
      .orderBy(0, "desc")
      .fromPairs()
      .value();

    const projects = {};
    for (const key of _.keys(projectsRaw)) {
      projects[key] = {
        data: projectsRaw[key],
        total: totals[key]
      };
      projects[key].total.hours = formatters.asDecimal(
        projects[key].total.hours
      );
      projects[key].total.actual = formatters.asDecimal(
        projects[key].total.actual
      );
    }

    let index = 0;
    _.keys(projects).forEach(key => {
      index += 1;
      const entries = projects[key].data;
      const total = projects[key].total;
      entries.push([
        `Total ${total.label}`,
        total.lessions,
        total.hours,
        total.actual,
        ""
      ]);
      report.data.push({
        order: index,
        title: key,
        data: entries
      });
    });

    const totalReport = [
      _.last(report.data[0].data),
      _.clone(_.last(report.data[1].data)),
      _.clone(_.last(report.data[2].data))
    ];
    totalReport[1][0] = ` + ${totalReport[1][0]}`;
    totalReport[2][0] = ` + ${totalReport[2][0]}`;
    totalReport.push([
      " = Total Lehrauftrag",
      formatters.asDecimal(
        totalReport[0][1] + totalReport[1][1] + totalReport[2][1]
      ),
      formatters.asDecimal(
        totalReport[0][2] + totalReport[1][2] + totalReport[2][2]
      ),
      formatters.asDecimal(
        totalReport[0][3] + totalReport[1][3] + totalReport[2][3]
      ),
      ""
    ]);

    index += 1;
    report.data.push({
      order: index,
      title: "Total",
      data: totalReport
    });

    const dataHoursEffectively = [
      [
        "Total Jahresarbeitszeit",
        null,
        reports.totalHoursTarget,
        reports.totalHoursActual,
        ""
      ],
      [
        " ./. Total Ferien in Stunden je nach %",
        null,
        reports.totalVacationsForYearTarget,
        reports.totalVacationsForYearActual,
        ""
      ],
      [
        " = Total Jahresarbeitszeit netto",
        null,
        reports.totalWorkingHoursForYearNetTarget,
        reports.totalWorkingHoursForYearNetActual,
        ""
      ],
      [
        "ev. Minus/plus Zeitübertrag Vorjahr",
        null,
        reports.totalTransferTimeTarget,
        reports.totalTransferTimeActual,
        ""
      ],
      [
        "ev. Minus bewilligte Ferien Vorjahr in Stunden",
        null,
        reports.totalTransferVacationsTarget,
        reports.totalTransferVacationsActual,
        ""
      ],
      [
        "ev. Minus Militär und Diverses",
        null,
        reports.totalMixedTarget,
        reports.totalMixedActual,
        ""
      ],
      [
        "ev. Minus Bewilligte Nachqualifikation",
        null,
        reports.totalQualiTarget,
        reports.totalQualiActual,
        ""
      ],
      [
        "ev. Minus Treueprämien",
        null,
        reports.totalPremiumsTarget,
        reports.totalPremiumsActual,
        ""
      ],
      [
        "ev. Minus Besondere Abwesenheiten",
        null,
        reports.totalSpecialAbsencesTarget,
        reports.totalSpecialAbsencesActual,
        ""
      ],
      [
        "ev. Minus Krankheit",
        null,
        reports.totalSicknessTarget,
        reports.totalSicknessActual,
        ""
      ],
      [
        " = Total Jahresarbeitszeit effektiv",
        null,
        reports.totalWorkingHoursForYearEffectivelyTarget,
        reports.totalWorkingHoursForYearEffectivelyActual,
        ""
      ]
    ];

    index += 1;
    report.data.push({
      order: index,
      title: "Jahresarbeitszeit Effektiv",
      data: dataHoursEffectively
    });

    const finalData = [
      [
        " Total Lehrauftrag",
        reports.totalLectureshipLessionsTarget,
        reports.totalLectureshipHoursTarget,
        reports.totalLectureshipHoursActual,
        ""
      ],
      [
        " ./. Total Jahresarbeitszeit effektiv",
        null,
        reports.totalWorkingHoursForYearEffectivelyTarget,
        reports.totalWorkingHoursForYearEffectivelyActual,
        ""
      ],
      [
        " = Saldo pro Jahr",
        null,
        reports.totalSaldoTarget,
        reports.totalSaldoActual,
        ""
      ]
    ];

    index += 1;
    report.data.push({
      order: index,
      title: "Finale Zusammenfassung",
      data: finalData
    });

    return callback(null, report);
  });
};

module.exports = genericReporting;
