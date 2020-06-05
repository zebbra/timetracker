const logError = require("debug")("app:error:employment-profile");
const errors = require("../errors");
const validators = require("../validators");

module.exports = EmploymentProfile => {
  /**
   * Validations
   */
  EmploymentProfile.validatesFormatOf("plannedVacations", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("plannedMixed", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("plannedQuali", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("plannedPremiums", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("transferTotalLastYear", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("transferOvertime", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("transferGrantedVacations", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("transferGrantedOvertime", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesFormatOf("manualCorrection", {
    with: validators.TWO_DECIMALS
  });
  EmploymentProfile.validatesPresenceOf("yearIndex");
  EmploymentProfile.validatesUniquenessOf("yearIndex");
  EmploymentProfile.validatesPresenceOf("userId");

  /**
   * Remote hooks that execute before or after calling a remote method
   */
  EmploymentProfile.beforeRemote("create", (ctx, unused, next) => {
    // make sure that the user cannot set a custom userId on the employment-profile
    ctx.args.data.userId = ctx.req.accessToken.userId;
    next();
  });

  /**
   * Operation hooks that execute when models perform crud operations on the database
   *
   * Before save
   *  - check for closed year (if year is set)
   *  - validate value (if value is set)
   */
  EmploymentProfile.observe("before save", (ctx, next) => {
    let userId;
    let year;
    let closed;
    let transferTotalLastYear;
    let transferOvertime;
    let internal = false;

    if (ctx.instance) {
      ({
        userId,
        year,
        closed,
        transferTotalLastYear,
        transferOvertime
      } = ctx.instance);
    } else if (ctx.currentInstance) {
      // we do not allow update of userId --> set it to currentInstance on update
      ({ userId, year, closed } = ctx.currentInstance);
      // do not allow update of one of the following fields
      delete ctx.data.year;
      delete ctx.data.closed;

      if (ctx.data.transferTotalLastYear) {
        transferTotalLastYear = ctx.data.transferTotalLastYear;
      } else {
        transferTotalLastYear = ctx.currentInstance.transferTotalLastYear;
      }

      if (ctx.data.transferOvertime) {
        transferOvertime = ctx.data.transferOvertime;
      } else {
        transferOvertime = ctx.currentInstance.transferOvertime;
      }
    } else {
      internal = true;
    }

    if (internal) {
      next();
    } else if (closed === true) {
      next(errors.RECORD_CLOSED);
    } else if (year && validators.isClosedYear(year)) {
      // validate year for close date if set
      logError(`year ${year} is invalid`);
      next(
        errors.customValidationError(
          "employmentSetting",
          { year: ["invalid"] },
          { year: [errors.RECORD_CLOSED] }
        )
      );
    } else {
      // all valid

      if (transferTotalLastYear === 0) {
        transferOvertime = 0;
      } else {
        const onePercentOfTotalLastYear =
          Math.round(transferTotalLastYear) / 100;
        if (transferOvertime > onePercentOfTotalLastYear) {
          transferOvertime = onePercentOfTotalLastYear;
        }
      }

      if (year) {
        // set the index on user-year on create / update
        const index = `${userId}-${year}`;
        if (ctx.instance) {
          ctx.instance.transferOvertime = transferOvertime;
          ctx.instance.yearIndex = index;
        } else {
          ctx.data.transferOvertime = transferOvertime;
          ctx.data.yearIndex = index;
        }
      }
      next();
    }
  });

  /**
   * Before delete
   *   - check for closed date
   */
  EmploymentProfile.observe("before delete", (ctx, next) => {
    if (ctx.where.skipUserRelationClosedTest) {
      delete ctx.where.skipUserRelationClosedTest;
      return next();
    }

    if (ctx.where.order) delete ctx.where.order; // bug-fix for memory-db tests

    // make sure that "closed" employment-profiles cannot be deleted
    return EmploymentProfile.app.models[ctx.Model.modelName].findOne(
      { where: ctx.where },
      (err, profile) => {
        if (err) {
          logError(err);
          next(errors.DATABASE_ERROR);
        } else if (
          (profile && validators.isClosedYear(profile.year)) ||
          profile.closed === true
        ) {
          next(errors.RECORD_CLOSED_ERROR);
        } else {
          next();
        }
      }
    );
  });

  /**
   * Custom remote methods
   */

  EmploymentProfile.initializeDefaultForYear = (
    year,
    { accessToken },
    callback
  ) => {
    const data = {
      userId: accessToken.userId,
      year
    };

    EmploymentProfile.create(data, callback);
  };

  EmploymentProfile.remoteMethod("initializeDefaultForYear", {
    accepts: [
      {
        arg: "year",
        description:
          "The year for which to create the default employment profile",
        type: "number",
        required: true
      },
      {
        arg: "options",
        type: "object",
        http: "optionsFromRequest"
      }
    ],
    accessType: "EXECUTE",
    description:
      "Create the default employment profile for this user for the given year",
    http: {
      path: "/initialize",
      verb: "POST"
    },
    returns: {
      arg: "data",
      root: true,
      type: "employment-profile"
    }
  });
};
