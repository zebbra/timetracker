/**
*
* AppInfo
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from './Wrapper';


function AppInfo(props) {
  const { appInfo } = props;
  const { hideAppInfo } = props;

  const hasInfo = !(Object.keys(appInfo).length === 0 && appInfo.constructor === Object);

  return appInfo.message ?
    <Wrapper
      open={hasInfo}
      autoHideDuration={3000}
      message={appInfo.message}
      onRequestClose={hideAppInfo}
    /> : null;
}

AppInfo.propTypes = {
  // properties
  appInfo: PropTypes.object.isRequired,
  // actions
  hideAppInfo: PropTypes.func.isRequired,
};

export default AppInfo;
