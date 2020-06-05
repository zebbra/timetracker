/*
 *
 * CalendarInput constants
 *
 */
export const CALENDAR_INPUT_FORM = 'app/CalendarInput/CALENDAR_INPUT_FORM';
export const SET_INITIAL_VALUE = 'app/CalendarInput/SET_INITIAL_VALUE';

export const NAVIGATION_KEYS = [
  'ArrowLeft',
  'Shift+ArrowLeft',
  'ArrowRight',
  'Shift+ArrowRight',
  'ArrowUp',
  'Shift+ArrowUp',
  'ArrowDown',
  'Shift+ArrowDown',
  'Tab',
  'Shif+Tab',
  'Enter',
  'Escape',
];

export const UNIT_TO_HINT_LOOKUP = {
  d: '0 Tage',
  l: '0 Lektionen',
  h: '0 Stunden',
  n: '0 Stunden',
  r: 'hh:mm-hh:mm',
  t: 'Texteingabe',
};

export const SKIP_PARSE_UNITS = ['r', 't'];
