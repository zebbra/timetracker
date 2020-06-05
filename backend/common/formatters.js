module.exports.asDecimal = value => Math.round(value * 100) / 100;

module.exports.asDecimalFixed = value => value.toFixed(2);

module.exports.secondsAsHours = seconds => seconds / 60 / 60;

module.exports.hoursAsSeconds = hours => hours * 60 * 60;

module.exports.hoursAsDays = hours => hours / 24;
