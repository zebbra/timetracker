import moment from 'moment-timezone';
import { head, last, find, findIndex, sortBy, includes, fromPairs, map, groupBy } from 'lodash';
import { Map } from 'immutable';

import { isClosedDate } from 'utils/generic-validators';

/**
 * Prepare the elements based on the user settings and the selectedDate.
 * If an element is hidden (by user settings) but has a track assigned, then we show this element
 * in the calendar.
 *
 * @param {array}         elements      The elements to prepare
 * @param {array}         tracks        The tracks for this week
 * @param {array}         holidays      The holidays for this week
 * @param {object}        userSettings  The user specific settings (hide/show certain days/elements)
 * @param {moment-date}   selectedDate  The currently selected date
 */
export function prepareElementsReducer(elements, tracks, holidays, userSettings, selectedDate) {
  let allDisabled = false;
  let rowIndex = 0;

  // disable all if we are in the closed range time
  if (isClosedDate(selectedDate)) {
    allDisabled = true;
  }

  let showWeekend = true;
  let showWeekendWithTrack = false;
  if (userSettings.showWeekend === false) {
    const hasTracks = tracks.filter((track) => includes([0, 6], new Date(track.date).getDay())).length > 0;
    const hasHolidays = holidays.filter((holiday) => {
      const date = new Date(holiday.date);
      return moment(date).isSame(selectedDate, 'isoweek') && includes([0, 6], new Date(holiday.date).getDay());
    }).length > 0;

    if (hasTracks || hasHolidays) {
      showWeekend = true;
      showWeekendWithTrack = true;
    } else {
      showWeekend = false;
    }
  }

  let indexCounter;
  return {
    elements: sortBy(elements, (element) => {
      if (userSettings.elements[element.id]) {
        return userSettings.elements[element.id].index;
      }

      // append to the end of the group
      if (!indexCounter) {
        indexCounter = fromPairs(map(groupBy(elements, 'type'), (value, key) => [key, value.length - 1]));
      }
      if (indexCounter[element.type] !== undefined) {
        indexCounter[element.type] += 1;
        return indexCounter[element.type];
      }

      // append to the end of the list if we do not know this element as user yet
      return elements.length;
    }).map((element) => {
      const preparedElement = Object.assign({}, element, {
        disabled: false,
        hidden: false,
        hiddenWithTrack: false,
        closed: false,
      });

      // holidays are disabled
      if (element.holiday) {
        preparedElement.disabled = true;
      } else if (allDisabled) {
        preparedElement.disabled = true;
      }

      if (userSettings.elements[element.id] && userSettings.elements[element.id].hidden) {
        preparedElement.hidden = true;

        // if the element is hidden by user settings but has a holiday/track assigned (over the complete week)
        // then we still display the element
        if (element.holiday) {
          const holiday = find(holidays, { elementId: preparedElement.id });
          if (holiday && moment(holiday.date).isSame(selectedDate, 'isoweek')) {
            preparedElement.hidden = false;
            preparedElement.hiddenWithTrack = true;
          }
        } else if (find(tracks, { elementId: preparedElement.id })) {
          preparedElement.hidden = false;
          preparedElement.hiddenWithTrack = true;
        }
      }

      if (!preparedElement.holiday && (!preparedElement.hidden || preparedElement.hiddenWithTrack)) {
        preparedElement.rowIndex = rowIndex;
        rowIndex += 1;
      }

      return preparedElement;
    }),
    showWeekend,
    showWeekendWithTrack,
  };
}

/**
 * Prepare the elements based on the column date. We close elements which either have the start date after this column date
 * or the end date before this column date. Further we assign the holidays and tracks data to the elements based on the elemntId
 * reference and the columnDate.
 *
 * @param {array}         elements              The elements to prepare
 * @param {moment-date}   columnDate            The date of the column for which to render the elements
 * @param {array}         tracks                The tracks for this week
 * @param {array}         holidays              The holidays for this week
 * @param {boolean}       showWeekendWithTrack  Whether we display weekend days due to assigned tracks / holidays
 */
export function prepareElementsRender(elements, columnDate, tracks, holidays, showWeekendWithTrack) {
  const dayOfWeek = columnDate.clone().startOf('day');

  return elements.map((element) => {
    let closed = element.get('closed');
    let disabled = element.get('disabled');
    let hiddenWithTrack = element.get('hiddenWithTrack');
    let track;

    if (element.get('holiday')) {
      track = holidays.filter((entry) =>
        moment(entry.get('date')).isSame(columnDate, 'day') && element.get('id') === entry.get('elementId')
      ).first();
    } else {
      if (moment(element.get('start')).isAfter(columnDate)) {
        // if the element's start date is after this weekdate then the element is closed for this column
        closed = true;
      } else if (element.get('end') && moment(element.get('end')).isBefore(columnDate)) {
        // if the element's end date is before this weekdate then the element is closed for this column
        closed = true;
      }
      track = tracks.filter((entry) =>
        moment(entry.get('date')).isSame(columnDate, 'day') && element.get('id') === entry.get('elementId')
      ).first();
    }

    // close if we are in the closed range time
    if (isClosedDate(dayOfWeek)) {
      closed = true;
    }

    if (showWeekendWithTrack && includes([0, 6], dayOfWeek.toDate().getDay())) {
      hiddenWithTrack = true;
    }

    if (track && track.get('closed') === true) {
      disabled = true;
    }

    return element.merge(Map({
      dayOfWeek: dayOfWeek.toDate(),
      closed,
      disabled,
      hiddenWithTrack,
      track,
    }));
  }).filter((element) => !element.get('hidden'));
}

/**
 * Calculates the new selected cell based on the selectable elements, the number of days per week, the
 * previousely selected cell, and the navigation information.
 *
 * @param {array}   elements      The raw elements from the backend server
 * @param {number}  daysPerWeek   The number of days to display
 * @param {object}  selectedCell  The preivousely selected cell
 * @param {object}  navigation    The navigation informations
 */
export function navigate(elements, daysPerWeek, selectedCell, navigation) {
  const key = navigation.shiftKey ? `Shift${navigation.key}` : navigation.key;
  const { elementId, dayOfWeek, rowIndex } = selectedCell;
  const selectableElements = elements.filter((element) => (!element.holiday && (!element.hidden || element.hiddenWithTrack)));
  const selectedElement = find(selectableElements, { id: elementId });

  let newElementId = elementId;
  let newDayOfWeek = dayOfWeek;
  let newRowIndex = rowIndex;
  let changeWeek = null;
  let newSelectedElement = null;

  function handleNavigationLeft() {
    if (dayOfWeek === 1) {
      changeWeek = 'left';
      if (daysPerWeek === 7) {
        newDayOfWeek = 0;
      } else {
        newDayOfWeek = daysPerWeek;
      }
    } else if (dayOfWeek === 0) {
      newDayOfWeek = 6;
    } else {
      newDayOfWeek = dayOfWeek - 1;
    }

    if (!selectedElement) {
      if (rowIndex >= selectableElements.length) {
        newElementId = last(selectableElements).id;
      } else {
        newElementId = find(selectableElements, { rowIndex }).id;
      }
    }
  }

  function handleNavigationRight() {
    if (dayOfWeek === 0 || dayOfWeek === daysPerWeek) {
      changeWeek = 'right';
      newDayOfWeek = 1;
    } else if (daysPerWeek === 7 && dayOfWeek === 6) {
      newDayOfWeek = 0;
    } else {
      newDayOfWeek = dayOfWeek + 1;
    }

    if (!selectedElement) {
      if (rowIndex >= selectableElements.length) {
        newElementId = last(selectableElements).id;
      } else {
        newElementId = find(selectableElements, { rowIndex }).id;
      }
    }
  }

  function handleNavigationUp() {
    const elementRowIndex = findIndex(selectableElements, { rowIndex: selectedElement.rowIndex });
    if (elementRowIndex === 0) {
      newSelectedElement = last(selectableElements);
    } else {
      newSelectedElement = find(selectableElements, { rowIndex: selectedElement.rowIndex - 1 });
    }
    newElementId = newSelectedElement.id;
    newRowIndex = newSelectedElement.rowIndex;
  }

  function handleNavigationDown() {
    const elementRowIndex = findIndex(selectableElements, { rowIndex: selectedElement.rowIndex });
    if (elementRowIndex === selectableElements.length - 1) {
      newSelectedElement = head(selectableElements);
    } else {
      newSelectedElement = find(selectableElements, { rowIndex: selectedElement.rowIndex + 1 });
    }
    newElementId = newSelectedElement.id;
    newRowIndex = newSelectedElement.rowIndex;
  }

  switch (key) {
    case 'ShiftTab':
    case 'ArrowLeft':
    case 'ShiftArrowLeft':
      handleNavigationLeft();
      break;

    case 'Tab':
    case 'ArrowRight':
    case 'ShiftArrowRight':
      handleNavigationRight();
      break;

    case 'ArrowUp':
    case 'ShiftArrowUp':
      handleNavigationUp();
      break;

    case 'Enter':
    case 'ArrowDown':
    case 'ShiftArrowDown':
      handleNavigationDown();
      break;

    default:
      break;
  }

  return { elementId: newElementId, dayOfWeek: newDayOfWeek, changeWeek, rowIndex: newRowIndex };
}

/**
 * Initializes the user settings. Default elements order is by type [static -> range -> dynamic] and label
 *
 * @param {array}   elements  The raw elements from the backend server
 */
export function initializeUserSettings(elements) {
  return {
    elements: fromPairs(sortBy(elements, (element) => {
      let order = null;
      switch (element.type) {
        case 'static':
          order = 'a';
          break;
        case 'range':
          order = 'b';
          break;
        case 'dynamic':
          order = 'c';
          break;
        default:
          order = 'd';
          break;
      }
      return `${order}-${element.id}`;
    }).map((element, index) => [element.id, { hidden: false, index, id: element.id }])),
    showWeekend: false,
  };
}
