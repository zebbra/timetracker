export const data = [
  {
    fieldType: 'selectfield',
    name: 'project',
    label: 'Projekt',
    options: [
      { value: 'Default', label: 'Default' },
      { value: 'Unterrichts-Pool', label: 'Unterrichts-Pool' },
      { value: 'Schulpool', label: 'Schulpool' },
      { value: 'Aufwand Weiterbildung und Dienstleistung', label: 'Aufwand Weiterbildung und Dienstleistung' },
    ],
  },
  {
    fieldType: 'textfield',
    name: 'label',
    label: 'Bezeichnung',
    submitOnEnter: true,
  },
  {
    fieldType: 'selectfield',
    name: 'unit',
    label: 'Einheit',
    options: [
      { value: 't', label: 'Text' },
      { value: 'h', label: 'Stunden' },
      { value: 'l', label: 'Lektionen' },
    ],
    format: 'prettyUnit',
  },
  {
    fieldType: 'textfield',
    name: 'factor',
    label: 'Umrechnungsfaktor',
    disabled: true,
  },
  {
    fieldType: 'dateselect',
    name: 'start',
    label: 'Startdatum',
    format: 'asDate',
    maxDate: 'maxStart',
  },
  {
    fieldType: 'dateselect',
    name: 'end',
    label: 'Enddatum',
    format: 'asDate',
    minDate: 'minEnd',
  },
  {
    fieldType: 'drafteditor',
    name: 'tooltip',
    label: 'Tooltip',
    format: 'asTooltip',
    textAlign: 'center',
  },
];

export const actionButtons = [
  {
    label: 'Senden',
    submitButton: true,
    secondary: true,
  },
  {
    label: 'Abbrechen',
    buttonAction: 'cancel',
  },
];
