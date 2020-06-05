const async = require("async");
const _ = require("lodash");

/**
 * This mixin is used to check the integrity constrains for the hasManyThrough relationship.
 * Following integrity checks are applied:
 *
 * Before Delete:
 *  - checks whether there exists relations in the `through` table and returns an error if so
 *  - destroy all entries for existing relations in the `through` table if the `dependent: destroy` option is set
 */
const checkHasManyThroughIntegrity = (ctx, options, next) => {
  if (ctx.where) {
    const codes = {};
    const messages = {};
    let hasErrors = false;

    // do not apply the integrity check on the excluded relations
    let { relations } = ctx.Model.definition.settings;
    if (options.exclude) {
      relations = _.filter(
        relations,
        relation => !_.includes(options.exclude, relation.model)
      );
    }

    async.eachSeries(
      relations,
      (relation, nextRelation) => {
        if (
          relation.type === "hasMany" &&
          relation.foreignKey !== "" &&
          relation.through &&
          relation.through !== ""
        ) {
          const throughModelName = relation.through;
          const throughModel = ctx.Model.app.models[throughModelName];
          const throughModelRelation = _.find(
            throughModel.definition.settings.relations,
            { model: ctx.Model.modelName }
          );
          const where = {};
          where[relation.foreignKey] = ctx.where.id;

          throughModel.find({ where }, (throughErr, throughEntries) => {
            if (throughErr) {
              nextRelation(throughErr);
            } else if (throughEntries.length) {
              if (
                throughModelRelation &&
                throughModelRelation.dependent === "destroy"
              ) {
                throughModel.destroyAll(
                  Object.assign(where, { skipUserRelationClosedTest: true }),
                  nextRelation
                );
              } else {
                codes[relation.foreignKey] = ["integrity"];
                messages[relation.foreignKey] = [
                  "violates hasManyThrough initegrity"
                ];
                hasErrors = true;
                nextRelation();
              }
            } else {
              nextRelation();
            }
          });
        } else {
          nextRelation();
        }
      },
      err => {
        if (err) {
          next(err);
        } else if (hasErrors) {
          const integrityErr = Object.assign(
            new Error(`The \`${ctx.Model.modelName}\` instance is not valid`),
            {
              statusCode: 400,
              name: "IntegrityError",
              details: { codes, messages }
            }
          );
          next(integrityErr);
        } else {
          next();
        }
      }
    );
  } else {
    next();
  }
};

module.exports = (Model, options) => {
  Model.observe("before delete", (ctx, next) =>
    checkHasManyThroughIntegrity(ctx, options, next)
  );
};
