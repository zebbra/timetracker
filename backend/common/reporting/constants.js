const HOURS_PER_DAY = 8.4;

const DATE_KEY_FORMAT = "YYYYMMDD";

const LABEL_TO_PROFILE_LOOKUP = {
  Ferien: "plannedVacations",
  Treueprämien: "plannedPremiums",
  "Militär / Mutterschaft / Diverses": "plannedMixed",
  "Bew. Nachqual.": "plannedQuali",
  "Besondere Abwesenheiten": "plannedSpecialAbsences",
  Krankheit: "plannedIllness"
};

const DAY_TO_HOURS_ELEMENTS = [
  "transferGrantedVacations",
  "plannedVacations",
  "plannedMixed",
  "plannedPremiums"
];

const DAY_TO_HOURS_ELEMENTS_2025 = [
  "transferGrantedVacations",
  "plannedVacations",
  "plannedMixed"
];

module.exports = {
  HOURS_PER_DAY,
  DATE_KEY_FORMAT,
  LABEL_TO_PROFILE_LOOKUP,
  DAY_TO_HOURS_ELEMENTS,
  DAY_TO_HOURS_ELEMENTS_2025
};
