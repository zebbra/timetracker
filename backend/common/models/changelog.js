module.exports = Changelog => {
  /**
   * Validations
   */
  Changelog.validatesPresenceOf("result");
  Changelog.validatesPresenceOf("user");
};
