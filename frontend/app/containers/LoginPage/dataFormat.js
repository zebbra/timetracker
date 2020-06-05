export const loginData = [
  {
    fieldType: 'textfield',
    name: 'value',
    label: 'Benutzername / Email',
    submitOnEnter: true,
  }, {
    fieldType: 'textfield',
    name: 'password',
    label: 'Passwort',
    type: 'password',
    submitOnEnter: true,
  }, {
    fieldType: 'checkbox',
    name: 'rememberMe',
    label: 'Angemeldet bleiben',
  },
];

export const loginActionButtons = [
  {
    label: 'Anmelden',
    submitButton: true,
    secondary: true,
  },
];

export const resetData = [
  {
    fieldType: 'textfield',
    name: 'email',
    label: 'Email',
    submitOnEnter: true,
  },
];

export const resetActionButton = [
  {
    label: 'Anfordern',
    submitButton: true,
    secondary: true,
  },
];

export const newPasswordData = [
  {
    fieldType: 'textfield',
    name: 'newPassword',
    label: 'Neues Passwort',
    type: 'password',
    submitOnEnter: true,
  },
];

export const newPasswordButton = [
  {
    label: 'Senden',
    submitButton: true,
    secondary: true,
  },
];
