import { find } from 'lodash';

export function merge({ elements, setpoints, reporting }) {
  return elements.map((element) => Object.assign(element,
    { setpoint: find(setpoints, { elementId: element.id }) },
    { actual: find(reporting, { id: element.id }).actualFixed },
  ));
}

export function update(elements, setpoint) {
  return elements.map((element) => {
    if (element.id === setpoint.elementId) {
      Object.assign(element, { setpoint });
    }
    return element;
  });
}

export function remove(elements, id) {
  return elements.map((element) => {
    if (element.setpoint && element.setpoint.id === id) {
      Object.assign(element, { setpoint: undefined });
    }
    return element;
  });
}
