import devConfig from './development';
import prodConfig from './production';

let config = devConfig; // eslint-disable-line import/no-mutable-exports
if (process.env.NODE_ENV === 'production') {
  config = prodConfig;
}

export default config;
