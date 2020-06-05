
export const normalizeDays = (value, previousValue) => {
  const blacklist = /[^0-9.]/g;
  const forwarder = /^[0.]$/;
  const deleteForwarder = /^0.$/;
  const doubles = /([.]\D)/g;
  const replaceDoubls = /([.])(\D)/g;
  const targetPlus = /^(1|0\.[0-9]).+$/;

  if (blacklist.test(value)) {
    return value.replace(blacklist, '');                                      // only allow numbers and dot
  } else if (doubles.test(value)) {
    return value.replace(replaceDoubls, '$1');                                // remove any .. patterns
  } else if (forwarder.test(value)) {                                         // add leading zero if starting with a dot or dot if starting with a zero
    if (deleteForwarder.test(previousValue)) {                                // allow remove dot
      return '';
    }
    return '0.';
  } else if (targetPlus.test(value)) {                                        // stop on final form
    return previousValue;
  }

  return value;
};

export const normalizeLessions = (value, previousValue) => {
  const blacklist = /[^0-9.]/g;
  const forwarder = /^\d{2}$|^\.$/;
  const deleteForwarder = /^\d{2}\.$/;
  const doubles = /([.]\D)/g;
  const replaceDoubls = /([.])(\D)/g;
  const targetPlus = /^\d{2}(?:\.\d*)+\.+$/;

  if (blacklist.test(value)) {
    return value.replace(blacklist, '');                                      // only allow numbers and dot
  } else if (doubles.test(value)) {
    return value.replace(replaceDoubls, '$1');                                // remove any .. patterns
  } else if (forwarder.test(value)) {
    if (deleteForwarder.test(previousValue)) {
      return value;
    }
    if (value === '.') {
      return '0.';
    }
    return `${value}.`;
  } else if (targetPlus.test(value)) {
    return previousValue;
  }

  return value;
};

export const normalizeHours = normalizeLessions;

export const normalizeRange = (value, previousValue) => {
  const target = /^(2[0-3]|[01][0-9])(.*)(:)([0-5][0-9])(.*)(-)(2[0-3]|[01][0-9])(.*)(:)([0-5][0-9])(.*)$/;

  if (/[^0-9:-]/g.test(value)) {
    return value.replace(/[^0-9:-]/g, '');                                     // only allow 0-9 and : and -
  } else if (/([:-]\D)/g.test(value)) {
    return value.replace(/([:-])(\D)/g, '$1');                                 // remove any :- :: -: -- patterns
  } else if (/^[:-]$/.test(value)) {
    return '00:';                                                              // add leading zeros if starting with : or -
  } else if (/^[0-9][:-]$/.test(value)) {
    return `0${value.charAt(0)}:`;                                             // add leading zero if starting with {9:-}
  } else if (/^2[^0-3]$/.test(value)) {
    return previousValue;                                                      // do not allow hours > 23:59
  } else if (/^[3-9][^:-]$/.test(value)) {
    return value.slice(0, -1);                                                 // do not allow hours > 23:59
  } else if (/^\d{2}$/.test(value)) {
    if (/^\d{2}:$/.test(previousValue)) {
      return value.slice(0, -1);
    }
    return `${value}:`;                                                        // add : for case {99}
  } else if (/^\d{2}:[6-9]$/.test(value)) {
    return previousValue;
  } else if (/^\d{2}:[0-5][:-]$/.test(value)) {
    return `${value.slice(0, -1)}0-`;                                          // add 0- for case {99:9} and key - or :
  } else if (/^\d{2}:[0-5][0-9]$/.test(value)) {
    if (/^\d{2}:[0-5][0-9]-$/.test(previousValue)) {
      return value.slice(0, -1);
    }                                                                          // add - for case {99:99}
    return `${value}-`;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-[3-9]$/.test(value)) {
    return previousValue;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9])$/.test(value)) {
    if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):$/.test(previousValue)) {
      return value.slice(0, -1);
    }
    return `${value}:`;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-[^0-3]$/.test(value)) {
    return previousValue;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-[2][^0-3]$/.test(value)) {
    return previousValue;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):[^0-5]$/.test(value)) {
    return previousValue;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):[0-5][^0-9]$/.test(value)) {
    return previousValue;
  } else if (/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):[0-5][0-9].+/.test(value)) {
    return previousValue;
  }

  return value.replace(target, '$1$3$4$6$7$9$10');
};

export const normalizeNumber = (value, previousValue) => {
  if (value === '-') {
    return value;
  } else if (isNaN(value)) {
    return previousValue;
  }

  return value;
};

export const defaultNormalizer = (value) => value;

export const normalize = (type) => {
  switch (type) {
    case 'd': return normalizeDays;
    case 'h': return normalizeHours;
    case 'l': return normalizeLessions;
    case 'r': return normalizeRange;
    case 'n': return normalizeNumber;
    default: return defaultNormalizer;
  }
};

export default normalize;
