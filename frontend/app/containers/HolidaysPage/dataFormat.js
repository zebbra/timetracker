export const data = [
  {
    fieldType: 'textfield',
    name: 'label',
    label: 'Bezeichnung',
    submitOnEnter: true,
  },
  {
    fieldType: 'textfield',
    name: 'value',
    label: 'Tage',
    submitOnEnter: true,
  },
  {
    fieldType: 'dateselect',
    name: 'date',
    label: 'Datum',
    format: 'asDate',
    minDate: 'minDate',
    maxDate: 'maxDate',
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
