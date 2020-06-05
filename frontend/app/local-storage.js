import { browserHistory } from 'react-router';

// TODO: perhaps use PersisJS to support older browsers? https://github.com/jeremydurham/persist-js
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  const serializedState = JSON.stringify(state);
  localStorage.setItem('state', serializedState);

  return null;
};

export const clear = () => {
  saveState({});

  const ifr = document.createElement('iframe');
  ifr.name = ifr.id = `ifr_${Date.now()}`;
  document.body.appendChild(ifr);
  const form = document.createElement('form');
  form.method = 'POST';
  form.target = ifr.name;
  form.action = '/thing/stuck/in/cache';
  document.body.appendChild(form);
  form.submit();

  try {
    if (caches) {
      // Service worker cache should be cleared with caches.delete()
      caches.keys().then((names) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const name of names) caches.delete(name);
      });
    }
  } catch (error) {
    // probably ie bugs here
    // eslint-disable-next-line no-console
    console.log(error);
  }

  browserHistory.push('/');
  window.location.reload(true);
};
