const async = require("async");
const errors = require("../errors");

/**
 * This mixin is used to check the integrity constraints (the child object has a parent)
 * by checking that the foreign keys of parent objects exist correctly when creating a child object
 */
const checkBelongsToIntegrity = (ctx, next) => {
  if (ctx.instance) {
    const codes = {};
    const messages = {};
    let error = false;

    async.eachSeries(
      ctx.Model.definition.settings.relations,
      (relation, nextRelation) => {
        if (relation.type === "belongsTo" && relation.foreignKey !== "") {
          const parentModelName = relation.model;
          const parentModel = ctx.Model.app.models[parentModelName];
          const parentId = ctx.instance[relation.foreignKey];

          if (!parentId) {
            nextRelation(`Id for ${parentModelName} is missing. `);
          } else {
            parentModel.findById(parentId, (parentError, parent) => {
              if (parentError) {
                nextRelation(parentError);
              } else if (parent) {
                nextRelation();
              } else {
                codes[relation.foreignKey] = ["integrity"];
                messages[relation.foreignKey] = [
                  `violates belongsTo integrity (${parentModelName} with id ${parentId} does not exist)`
                ];
                error = true;
                nextRelation();
              }
            });
          }
        } else {
          nextRelation();
        }
      },
      err => {
        if (err) {
          next(err);
        } else if (error) {
          next(
            errors.customValidationError(ctx.Model.modelName, codes, messages)
          );
        } else {
          next();
        }
      }
    );
  } else {
    next();
  }
};

module.exports = Model => {
  Model.observe("before save", checkBelongsToIntegrity);
};
