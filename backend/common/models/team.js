const async = require("async");
const _ = require("lodash");
const validators = require("../validators");

module.exports = Team => {
  /**
   * Validations
   */
  Team.validatesUniquenessOf("name");
  Team.validatesFormatOf("name", validators.NAME_REGEX);
  Team.validatesLengthOf("name", { min: 3, max: 100 });

  /**
   * Custom remote methods
   */
  Team.createTeamWithMembers = (data, unused, callback) => {
    const { name, members } = data;

    // Create the team
    const createTeam = next => {
      Team.create({ name }, next);
    };

    // Create the memberships
    const createMemberships = (team, next) => {
      const memberships = members.map(member => ({
        teamId: team.id,
        isTeamleader: !member.isTeamleader ? false : member.isTeamleader,
        memberId: member.id
      }));

      Team.app.models.membership.create(memberships, err => {
        if (err) {
          Team.deleteById(team.id);
          next(err);
        } else {
          next(null, team);
        }
      });
    };

    async.waterfall([createTeam, createMemberships], (err, team) => {
      if (err) {
        callback(err);
      } else {
        Team.findById(team.id, callback);
      }
    });
  };

  Team.remoteMethod("createTeamWithMembers", {
    http: { path: "/teamWithMembers", verb: "post" },
    accepts: [
      {
        arg: "data",
        description: "Model instance data",
        type: "object",
        model: "team",
        http: { source: "body" }
      },
      {
        arg: "options",
        type: "team",
        http: "optionsFromRequest"
      }
    ],
    description:
      "Create a new instance of the model with linked member instances and persist it into the data source.",
    accessType: "WRITE",
    returns: { arg: "data", type: "team", root: true }
  });

  Team.updateTeamWithMembers = (id, data, unused, callback) => {
    const { name, members } = data;

    // Get the team by id
    const findTeamById = next => {
      Team.findById(id, (err, team) => {
        if (err) {
          next(err);
        } else if (!team) {
          const missingTeamErr = Object.assign(
            new Error("The team instance is not valid"),
            {
              statusCode: 422,
              name: "ValidationError",
              details: {
                codes: [{ id: ["missing"] }],
                messages: [{ id: [`team with id ${id} was not found`] }]
              }
            }
          );
          next(missingTeamErr);
        } else {
          next(null, team);
        }
      });
    };

    // Update the team attributes
    const updateTeam = (team, next) => {
      team.updateAttributes({ name }, next);
    };

    // Get the memberships by team id
    const getMembershipsByTeamId = (team, next) => {
      const where = { teamId: team.id };
      Team.app.models.membership.find({ where }, (err, memberships) => {
        next(err, team, memberships);
      });
    };

    // Handle the membership changes
    const handleMembershipChanges = (team, memberships, next) => {
      // Create new memberships for members which do not occure in the memberships array
      const createMemberships = handleNext => {
        const newMemberships = _.filter(
          members || [],
          member => member.id && !_.find(memberships, { memberId: member.id })
        ).map(member => ({
          teamId: team.id,
          memberId: member.id,
          isTeamleader: member.isTeamleader
        }));

        Team.app.models.membership.create(newMemberships, err =>
          handleNext(err)
        );
      };

      // Update existing memberships for which the id exists in the members array and the isTeamleader flag differs
      const updateMemberships = handleNext => {
        async.eachSeries(
          memberships,
          (membership, nextMembership) => {
            const membershipChanged = _.find(members || [], member => {
              const idMatch = member.id === membership.memberId;
              const isTeamleaderChanged = !member.isTeamleader
                ? membership.isTeamleader === true
                : member.isTeamleader !== membership.isTeamleader;
              return idMatch && isTeamleaderChanged;
            });

            if (membershipChanged) {
              membership.updateAttributes(
                { isTeamleader: !membership.isTeamleader },
                err => nextMembership(err)
              );
            } else {
              nextMembership();
            }
          },
          handleNext
        );
      };

      // Delete existing memberships for which the id does not occure in the new array of members
      const deleteMemberships = handleNext => {
        const removeMemberships = _.filter(
          memberships,
          membership => !_.find(members || [], { id: membership.id })
        ).map(membership => membership.id);

        Team.app.models.membership.destroyAll(
          { id: { inq: removeMemberships } },
          err => handleNext(err)
        );
      };

      async.waterfall(
        [createMemberships, updateMemberships, deleteMemberships],
        err => {
          if (err) {
            next(err);
          } else {
            Team.findById(team.id, next);
          }
        }
      );
    };

    async.waterfall(
      [
        findTeamById,
        updateTeam,
        getMembershipsByTeamId,
        handleMembershipChanges
      ],
      callback
    );
  };

  Team.remoteMethod("updateTeamWithMembers", {
    http: { path: "/:id/teamWithMembers", verb: "put" },
    accepts: [
      {
        arg: "id",
        description: "team id",
        type: "string",
        required: true,
        http: { source: "path" }
      },
      {
        arg: "data",
        description: "Model instance data",
        type: "object",
        model: "team",
        http: { source: "body" }
      },
      {
        arg: "options",
        type: "team",
        http: "optionsFromRequest"
      }
    ],
    description:
      "Patch attributes for a model instance with linked members and persist it into the data source.",
    accessType: "WRITE",
    returns: { arg: "data", type: "team", root: true }
  });
};
