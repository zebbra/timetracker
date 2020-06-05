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
    fieldType: 'checkbox',
    name: 'flat',
    label: 'Werte zusammenfassen',
  },
  {
    fieldType: 'checkbox',
    name: 'comments',
    label: 'Bemerkungen hinzufügen',
  },
];

export const actionButtons = [
  {
    label: 'Export',
    submitButton: true,
    secondary: true,
  },
];
