const _ = require("lodash");

_.mixin({
  deep: (obj, mapper) => {
    return mapper(
      _.mapValues(obj, v => {
        return _.isPlainObject(v) ? _.deep(v, mapper) : v;
      })
    );
  }
});

const log = (ctx, Model) => {
  const { req, method } = ctx;
  const audit = {
    method: req.method,
    url: req.originalUrl,
    eventName: method.sharedClass.name,
    subEventName: method.name,
    arguments: {
      params: req.params,
      query: req.query,
      headers: req.headers,
      args: ctx.args
    }
  };

  // remove request and response because of size and circular references
  if (audit.arguments.args.req) {
    delete audit.arguments.args.req;
  }
  if (audit.arguments.args.res) {
    delete audit.arguments.args.res;
  }

  // use loopbacks toJSON to remove circular references from models
  audit.result = Array.isArray(ctx.result)
    ? ctx.result.map(entry => entry.toJSON())
    : ctx.result && ctx.result.toJSON
    ? ctx.result.toJSON()
    : {};
  audit.error = ctx.error || {};
  audit.status = ctx.error
    ? ctx.error.statusCode || ctx.error.status || ctx.res.statusCode
    : ctx.result && Object.keys(ctx.result) > 0
    ? 200
    : 204;

  const logWithUser = (currentUser = {}) => {
    currentUser.ip =
      req.ip ||
      req._remoteAddress ||
      (req.connection && req.connection.remoteAddress) ||
      // eslint-disable-next-line no-undefined
      undefined;

    audit.user = currentUser;

    // $ and . are not allowed as keys in mongo, so escape them all
    const auditSanitized = _.deep(audit, x => {
      return _.mapKeys(x, (_val, key) => {
        return key.replace(/[$.]/g, "");
      });
    });

    process.nextTick(() => {
      Model.app.models.Changelog.create(auditSanitized, err => {
        if (err) {
          console.log(err);
        }
      });
    });
  };

  try {
    let currentUser = {};

    if (!req.currentUser) {
      if (req.accessToken) {
        Model.app.models.User.findById(req.accessToken.userId, (err, user) => {
          if (err) {
            currentUser.name = "system";
          }
          if (user) {
            currentUser = user.toObject();
            req.currentUser = currentUser;
          } else {
            currentUser.name = "USER NOT FOUND";
          }
          logWithUser(currentUser);
        });
      } else {
        currentUser.name = "ANONYMOUS";
        logWithUser(currentUser);
      }
    } else {
      currentUser = req.currentUser;
      logWithUser(currentUser);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = Model => {
  Model.afterRemote("*.patchAttributes", (ctx, _var, next) => {
    log(ctx, Model);
    next();
  });
  Model.afterRemote("**.create", (ctx, _var, next) => {
    log(ctx, Model);
    next();
  });
  Model.afterRemote("**.deleteById", (ctx, _var, next) => {
    log(ctx, Model);
    next();
  });
};
