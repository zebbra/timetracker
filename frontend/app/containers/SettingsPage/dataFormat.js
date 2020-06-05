export const data = [
  {
    fieldType: 'textfield',
    name: 'scope',
    label: 'Pensum %',
    submitOnEnter: true,
  },
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
