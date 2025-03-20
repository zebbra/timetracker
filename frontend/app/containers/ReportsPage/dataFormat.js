export const data = [
  {
    name: 'label',
    label: 'Bezeichnung',
  },
  {
    name: 'unit',
    label: 'Einheit',
    format: 'prettyUnit',
    textAlign: 'center',
  },
  {
    name: 'actual',
    label: 'Ist',
    textAlign: 'center',
  },
  {
    name: 'target',
    label: 'Soll',
    textAlign: 'center',
  },
  {
    name: 'saldo',
    label: 'Saldo',
    textAlign: 'center',
  },
];

export const exportData = [
  {
    fieldType: 'dateselect',
    name: 'start',
    label: 'Startdatum',
  },
  {
    fieldType: 'dateselect',
    name: 'end',
    label: 'Enddatum',
  },
  {
    fieldType: 'selectfield',
    name: 'position',
    label: 'Position',
    options: [
      { value: null, label: 'Leer' },
      { value: 'Besondere Abwesenheiten', label: 'Besondere Abwesenheiten' },
      { value: 'Krankheit', label: 'Krankheit' },
      { value: 'Ferien', label: 'Ferien' },
      { value: 'Treueprämien', label: 'Treueprämien' },
      { value: 'Militär / Mutterschaft / Diverses', label: 'Militär, Mutterschaft und Diverses' },
      { value: 'Bew. Nachqual.', label: 'Bewilligte Nachqual.' },
      { value: 'Begleiteter Einzelunterricht / Klinik', label: 'Begleiteter Einzelunterricht / Klinik' },
      { value: 'Unterricht in der Klinik (Fachlehrpersonen)', label: 'Unterricht in der Klinik (Fachlehrpersonen)' },
      { value: 'Unterrichten/Beraten/Begleiten', label: 'Unterrichten/Beraten/Begleiten' },
      { value: 'Gesundheitsförderung / Strahlenschutz', label: 'Gesundheitsförderung / Strahlenschutz' },
      { value: 'Interkantonale und internationale Zusammenarbeit', label: 'Interkantonale und internationale Zusammenarbeit' },
      { value: 'LTT-Bewirtschaftung', label: 'LTT-Bewirtschaftung' },
      { value: 'Marketing / Selektion / Eignungsverfahren', label: 'Marketing / Selektion / Eignungsverfahren' },
      { value: 'Material-/Geräte und Raumbewirtschaftung', label: 'Material-/Geräte und Raumbewirtschaftung' },
      { value: 'Patiententriage / Patientenbehandlung DH', label: 'Patiententriage / Patientenbehandlung DH' },
      { value: 'Praktikumsplatzbewirtschaftung', label: 'Praktikumsplatzbewirtschaftung' },
      { value: 'Sonderabfallbewirtschaftung', label: 'Sonderabfallbewirtschaftung' },
      { value: 'Stundenplanung', label: 'Stundenplanung' },
      { value: 'Weiterentwicklung / Koordination / Qualitätssicherung Lehrplan', label: 'Weiterentwicklung / Koordination / Qualitätssicherung Lehrplan' },
      { value: 'Wissensmanagement / Entwicklung und Bewirtschaftung von Lehrmitteln', label: 'Wissensmanagement / Entwicklung und Bewirtschaftung von Lehrmitteln' },
      { value: 'Begleitung (WB)', label: 'Begleitung (WB)' },
      { value: 'Entwicklung (WB)', label: 'Entwicklung (WB)' },
      { value: 'Unterricht (WB)', label: 'Unterricht (WB)' },
    ],
  },
  {
    fieldType: 'checkbox',
    name: 'flat',
    label: 'Werte zusammenfassen',
  },
  {
    fieldType: 'checkbox',
    name: 'comments',
    label: 'Bemerkungen hinzufügen',
  },
  {
    fieldType: 'checkbox',
    name: 'compact',
    label: 'Kompakt',
  },
];

export const actionButtons = [
  {
    label: 'Export',
    submitButton: true,
    secondary: true,
  },
];
