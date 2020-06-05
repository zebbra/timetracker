export const data = [
  {
    fieldType: 'textfield',
    name: 'firstName',
    label: 'Vorname',
    submitOnEnter: true,
  },
  {
    fieldType: 'textfield',
    name: 'lastName',
    label: 'Nachname',
    submitOnEnter: true,
  },
  {
    fieldType: 'textfield',
    name: 'username',
    label: 'Benutzername',
    submitOnEnter: true,
  },
  {
    fieldType: 'textfield',
    name: 'email',
    label: 'EMail',
    submitOnEnter: true,
  },
  {
    fieldType: 'textfield',
    name: 'rolesAsString',
    label: 'Rollen',
    disabled: true,
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
