module.exports = Membership => {
  /**
   * Validations
   */
  Membership.validatesPresenceOf("memberId");
  Membership.validatesPresenceOf("teamId");
};
