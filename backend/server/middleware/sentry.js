// register raven error handler as lookback middleware.
// see https://github.com/getsentry/raven-node/issues/162#issuecomment-321205014
//
// NOTE: will only report exceptions if SENTRY_DSN environment var is set

const Raven = require("raven");

const options = {
  environment:
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  logger: "server",
  autoBreadcrumbs: true
};

Raven.config(options).install();

module.exports = {
  serverErrors: () => Raven.errorHandler()
};
