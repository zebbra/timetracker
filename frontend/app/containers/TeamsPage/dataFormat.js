export const data = [
  {
    fieldType: 'textfield',
    name: 'name',
    label: 'Name',
    submitOnEnter: true,
  },
  {
    fieldType: 'reactSelect',
    name: 'leaders',
    head: true,
    label: 'Teamleiter',
    format: 'asCustomTooltip',
    accessor: 'tooltipLeaders',
  },
  {
    fieldType: 'reactSelect',
    name: 'members',
    head: true,
    label: 'Teammitglieder',
    format: 'asCustomTooltip',
    accessor: 'tooltipMembers',
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
