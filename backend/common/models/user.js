const async = require("async");
const debug = require("debug")("app:user");
const path = require("path");
const _ = require("lodash");
const validators = require("../validators");
const config = require("../../server/model-config.json");

const ONE_DAY = 60 * 60 * 24;

module.exports = User => {
  /**
   * Validations
   */
  User.validatesFormatOf("username", {
    with: validators.ALPHA_NUMERIC_EXTENDED_REGEX
  });
  User.validatesPresenceOf("username");
  User.validatesLengthOf("username", { min: 3, max: 15 });
  User.validatesFormatOf("firstName", { with: validators.NAME_REGEX });
  User.validatesLengthOf("firstName", { min: 3, max: 50 });
  User.validatesFormatOf("lastName", { with: validators.NAME_REGEX });
  User.validatesLengthOf("lastName", { min: 3, max: 50 });
  User.validatesLengthOf("email", { max: 100 });
  User.validatesFormatOf("email", { with: validators.VALID_EMAIL_DOMAINS });

  /**
   * Overwrite the users validatePassword method in order to be able
   * to verify the plain password
   */
  const passwordProperties = User.definition.properties.password;
  User.validatePassword = plain =>
    validators.validatePassword(plain, passwordProperties);

  /**
   * Remote hooks
   */
  User.afterRemote("create", (ctx, user, next) => {
    const errorHandler = (error, errorMessage, userId, principal) => {
      if (error) debug(error);
      if (userId) User.deleteById(userId);
      if (principal) {
        principal.delete(() => {
          next(errorMessage);
        });
      } else {
        next(errorMessage);
      }
    };

    User.assignUserRole(user, (roleError, principal) => {
      if (roleError) {
        errorHandler(
          roleError,
          "could not assign user role",
          user.id,
          principal
        );
      } else {
        User.sendVerificationMail(user, emailError => {
          if (emailError) {
            errorHandler(
              emailError,
              "could not send out verification email",
              user.id,
              principal
            );
          } else {
            next();
          }
        });
      }
    });
  });

  User.afterRemote("prototype.patchAttributes", (ctx, user, next) => {
    if (!user.emailVerified) {
      user.updateAttribute("emailVerified", true, next);
    } else {
      next();
    }
  });

  /**
   * Events
   */
  // send password reset link when requested
  User.on("resetPasswordRequest", info => {
    const { host, port } = User.app.settings.frontend;
    const url = `https://${host}${port ? `:${port}` : ""}/reset?token=${
      info.accessToken.id
    }`;
    const text = `Klicke auf folgenden Link um dein Passwort zurückzusetzen: ${url}`;

    const options = {
      from: config.Email.options.from,
      to: info.email,
      subject: "Passwort zurücksetzen",
      text
    };

    User.app.models.Email.send(options, err => {
      if (err) {
        debug(err);
      }
    });
  });

  /**
   * Static methods
   */
  // send verification email after registration
  User.sendVerificationMail = (user, callback) => {
    if (
      process.env.NODE_ENV !== "production" ||
      process.env.STAGING === "true"
    ) {
      // in dev and test mode we directly verify the user
      user.emailVerified = true;
      user.save(userError => {
        if (userError) {
          callback(userError);
        } else {
          debug("confirmed user %o", user);
          callback();
        }
      });
    } else {
      // otherwise we send out a verification email
      const options = Object.assign(User.getVerifyOptions(), {
        to: user.email,
        user
      });

      // this sends out the verification email
      user.verify(options, verifyError => {
        if (verifyError) {
          callback(verifyError);
        } else {
          callback();
        }
      });
    }
  };

  // overwrite the default getVerifyOptions method
  User.getVerifyOptions = () => {
    const { host, port } = User.app.settings.frontend;
    const base = User.base.getVerifyOptions();
    const options = {
      from: config.Email.options.from,
      subject: "Danke für die Registrierung",
      template: path.resolve(__dirname, "../../server/views/verify.ejs"),
      text:
        "Klicke auf den folgenden Link um deine Email-Adresse zu bestätigen:",
      host,
      // eslint-disable-next-line no-undefined
      port: port === false ? undefined : port,
      protocol: "https"
    };
    Object.assign(base, options);
    return base;
  };

  // assign the default user role to the user
  User.assignUserRole = (user, callback) => {
    const findRole = next => {
      User.app.models.Role.findOne(
        { where: { name: "user" } },
        (roleError, userRole) => {
          if (roleError) {
            next(roleError);
          } else if (!userRole) {
            next("role user was not found");
          } else {
            next(null, userRole);
          }
        }
      );
    };

    const createPrincipal = (userRole, next) => {
      userRole.principals.create(
        {
          principalType: User.app.models.RoleMapping.USER,
          principalId: user.id
        },
        (principalError, principal) => {
          if (principalError) {
            next(principalError);
          } else if (!principal) {
            next("could not assign user role");
          } else {
            next(null, principal);
          }
        }
      );
    };

    async.waterfall([findRole, createPrincipal], callback);
  };

  /**
   * Custom remote methods
   */
  User.teamsForLeader = (id, data, { accessToken }, callback) => {
    // Get the memberships for this user where it is teamleader
    const getMemberships = next => {
      const where = {
        memberId: accessToken.userId,
        isTeamleader: true
      };
      Object.assign(where, (data && data.where) || {});

      const fields = { teamId: true };
      Object.assign(fields, (data && data.fields) || {});

      User.app.models.membership.find({ where, fields }, next);
    };

    // Get the teams for this user where it is teamleader
    const getTeams = (memberships, next) => {
      const where = {
        id: { inq: memberships.map(membership => membership.teamId) }
      };

      User.app.models.team.find({ where }, next);
    };

    async.waterfall([getMemberships, getTeams], callback);
  };

  User.remoteMethod("teamsForLeader", {
    accepts: [
      {
        arg: "id",
        description: "user id",
        type: "string",
        required: true,
        http: { source: "path" }
      },
      {
        arg: "filter",
        description:
          // eslint-disable-next-line quotes
          'Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})',
        type: "object"
      },
      {
        arg: "options",
        type: "object",
        http: "optionsFromRequest"
      }
    ],
    accessType: "READ",
    description: "List the teams for which this user is the teamleader",
    http: {
      path: "/:id/teamsForLeader",
      verb: "get"
    },
    returns: {
      arg: "data",
      root: true,
      type: "array"
    }
  });

  User.impersonate = (
    currentUserId,
    targetUserId,
    { accessToken },
    callback
  ) => {
    if (accessToken.userId.toString() === targetUserId.toString()) {
      const err = new Error("You are not allowed to impersonate yourself");
      Object.assign(err, {
        status: 400
      });
      callback(err);
    } else {
      User.teamsForLeader(currentUserId, {}, { accessToken }, (err, teams) => {
        if (err) {
          callback(err);
        } else {
          let targetUser;
          _.each(teams, team => {
            const jsonTeam = team.toJSON();
            targetUser = _.find(
              jsonTeam.members,
              member => member.id.toString() === targetUserId.toString()
            );
            if (targetUser) return false;
            return true;
          });

          if (targetUser) {
            User.findById(targetUser.id, (userErr, user) => {
              if (userErr) {
                callback(userErr);
              } else {
                user.createAccessToken(ONE_DAY, (tokenErr, token) => {
                  if (tokenErr) {
                    callback(tokenErr);
                  } else {
                    callback(null, Object.assign(user, { token }));
                  }
                });
              }
            });
          } else {
            const notAllowedErr = new Error(
              "You are not allowed to impersonate this user"
            );
            Object.assign(notAllowedErr, {
              status: 403
            });
            callback(notAllowedErr);
          }
        }
      });
    }
  };

  User.remoteMethod("impersonate", {
    accepts: [
      {
        arg: "id",
        description: "current user id",
        type: "string",
        required: true,
        http: { source: "path" }
      },
      {
        arg: "userId",
        description: "The ID of the user you want to impersonate (target user)",
        type: "string",
        required: true
      },
      {
        arg: "options",
        type: "object",
        http: "optionsFromRequest"
      }
    ],
    accessType: "WRITE",
    description: "Impersonate a user",
    http: {
      path: "/:id/impersonate",
      verb: "post"
    },
    returns: {
      arg: "data",
      root: true,
      type: "array"
    }
  });
};
