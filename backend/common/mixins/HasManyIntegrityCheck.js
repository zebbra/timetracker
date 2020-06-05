const async = require("async");
const _ = require("lodash");
const errors = require("../errors");

/**
 * This mixin checks integrity constraints (if the parent object has children, you can not delete it)
 * by making a request about the children who are attached to that parent
 *   - you need to set the foreignKey attribute on the relation
 *   - if the relation has the dependent: destroy attribut set then we destroy the matched childrens
 */
const checkHasManyIntegrity = (ctx, options, next) => {
  if (ctx.where) {
    const codes = {};
    const messages = {};
    let error = false;

    // do not apply the integrity check on the excluded relations
    let relations = ctx.Model.definition.settings.relations;
    if (options.exclude) {
      relations = _.filter(
        relations,
        relation => !_.includes(options.exclude, relation.model)
      );
    }

    async.eachSeries(
      relations,
      (relation, nextRelation) => {
        if (relation.type === "hasMany" && relation.foreignKey !== "") {
          const childrenModelName = relation.model;
          const childrenModel = ctx.Model.app.models[childrenModelName];
          const childrenModelRelation = _.find(
            childrenModel.definition.settings.relations,
            { model: ctx.Model.modelName }
          );
          const where = {};
          where[relation.foreignKey] = ctx.where.id;

          childrenModel.find({ where }, (childrenErr, children) => {
            if (childrenErr) {
              nextRelation(childrenErr);
            } else if (children.length) {
              if (
                childrenModelRelation &&
                childrenModelRelation.dependent === "destroy"
              ) {
                childrenModel.destroyAll(
                  Object.assign(where, { skipUserRelationClosedTest: true }),
                  nextRelation
                );
              } else {
                codes[relation.foreignKey] = ["integrity"];
                messages[relation.foreignKey] = ["violates hasMany integrity"];
                error = true;
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

module.exports = (Model, options) => {
  Model.observe("before delete", (ctx, next) =>
    checkHasManyIntegrity(ctx, options, next)
  );
};
