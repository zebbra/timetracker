export const profileData = [
  {
    fieldType: 'textfield',
    name: 'firstName',
    label: 'Vorname',
  },
  {
    fieldType: 'textfield',
    name: 'lastName',
    label: 'Nachname',
  },
  {
    fieldType: 'textfield',
    name: 'username',
    label: 'Benutzername',
    forceDisable: true,
  },
  {
    fieldType: 'textfield',
    name: 'email',
    label: 'Email-Adresse',
    forceDisable: true,
  },
];

export const profileActionButtons = [
  {
    label: 'Speichern',
    submitButton: true,
    secondary: true,
  },
];

export const passwordData = [
  {
    fieldType: 'textfield',
    name: 'oldPassword',
    label: 'Altes Passwort',
    type: 'password',
  },
  {
    fieldType: 'textfield',
    name: 'newPassword',
    label: 'Neues Passwort',
    type: 'password',
  },
  {
    fieldType: 'textfield',
    name: 'confirmPassword',
    label: 'Neues Passwort bestätigen',
    type: 'password',
  },
];

export const passwordActionButtons = [
  {
    label: 'Ändern',
    submitButton: true,
    secondary: true,
  },
];

export const deleteUserData = [
  {
    fieldType: 'textfield',
    name: 'confirmationUsername',
    label: 'Benutzername',
  },
];

export const deleteActionButtons = [
  {
    label: 'Löschen',
    submitButton: true,
    primary: true,
  },
];
