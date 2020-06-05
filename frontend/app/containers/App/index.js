/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { createStructuredSelector } from 'reselect';
import { push } from 'react-router-redux';
import { ThemeProvider } from 'styled-components';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import loadTheme from 'utils/theme';
import { ImmutableLoadingBar as LoadingBar } from 'react-redux-loading-bar';

import Header from 'components/Header';
import SidebarLeft from 'components/SidebarLeft';
import Navigation from 'components/Navigation';
import SidebarRight from 'components/SidebarRight';
import AppError from 'components/AppError';
import AppInfo from 'components/AppInfo';
import Alert from 'components/Alert';
import { breakpoints } from 'utils/variables';
import { deleteSession } from 'hocs/Session/routines';
import { makeSelectToken } from 'hocs/Session/selectors';
import currentUser from 'hocs/CurrentUser';

import { toggleSidebarLeft, toggleSidebarRight, hideAppError, hideAppInfo, reloadAndUpdateVersion } from './actions';
import {
  makeSelectShowSidebarLeft,
  makeSelectSidebarRight,
  makeSelectAppError,
  makeSelectAppInfo,
  makeSelectPrinting,
  makeSelectCurrentVersion,
  makeSelectLatestVersion,
} from './selectors';
import { Container, AppWrapper, MainContentWrapper } from './Wrappers';

const muiTheme = getMuiTheme(loadTheme('medi'));
const gridStyledTheme = {
  breakpoints,
};


@currentUser
export class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      current: true,
    };
  }

  componentWillUpdate() {
    const { version, latestVersion } = this.props;

    if (version && this.state.current) {
      const shouldForceRefresh = semverGreaterThan(latestVersion, version);
      if (shouldForceRefresh) {
        this.setState({ current: false });
      }
    }
  }

  componentDidUpdate(prev) {
    if (prev.version !== this.props.version && this.props.version === this.props.latestVersion) {
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
      window.location.reload(true);
    }
  }

  render() {
    const isLoggedIn = !!this.props.token;

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <ThemeProvider theme={gridStyledTheme}>
          <section>
            <LoadingBar style={{ backgroundColor: muiTheme.palette.accent1Color }} />
            <Container>
              <AppWrapper className="app-wrapper">
                { isLoggedIn && <Header
                  toggleSidebarLeft={this.props.toggleSidebarLeft}
                  changeRoute={this.props.changeRoute}
                  currentPath={this.props.location.pathname}
                  deleteSession={this.props.deleteSession.trigger}
                  printing={this.props.printing}
                  isAdmin={this.props.isAdmin}
                  isSuperAdmin={this.props.isSuperAdmin}
                  isTeamleader={this.props.isTeamleader}
                  location={this.props.location}
                  username={this.props.username}
                  reloadAndUpdateVersion={this.props.reloadAndUpdateVersion}
                  version={this.props.version}
                /> }
                <main>
                  { this.props.showSidebarLeft &&
                    <SidebarLeft toggleSidebarLeft={this.props.toggleSidebarLeft}>
                      <Navigation
                        changeRoute={this.props.changeRoute}
                        currentPath={this.props.location.pathname}
                        isAdmin={this.props.isAdmin}
                        isMobile
                      />
                    </SidebarLeft>
                  }
                  <MainContentWrapper className="mainContent">{React.Children.toArray(this.props.children)}</MainContentWrapper>
                  { !this.state.current && this.props.token &&
                    <Alert
                      msg="Die Applikation wird in 5 Sekunden aktualisiert"
                      time={5000}
                      type={'info'}
                      onClose={this.props.reloadAndUpdateVersion}
                    />
                  }
                  { this.props.sidebarRight.show &&
                    <SidebarRight
                      toggleSidebarRight={this.props.toggleSidebarRight}
                      name={this.props.sidebarRight.name}
                    />
                  }
                </main>
                <AppError
                  appError={this.props.appError}
                  hideAppError={this.props.hideAppError}
                />
                <AppInfo
                  appInfo={this.props.appInfo}
                  hideAppInfo={this.props.hideAppInfo}
                />
              </AppWrapper>
            </Container>
          </section>
        </ThemeProvider>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  // properties
  children: PropTypes.node,
  isTeamleader: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  username: PropTypes.string,
  token: PropTypes.string,
  location: PropTypes.object.isRequired,
  showSidebarLeft: PropTypes.bool.isRequired,
  sidebarRight: PropTypes.object.isRequired,
  appError: PropTypes.object,
  appInfo: PropTypes.object,
  printing: PropTypes.bool.isRequired,
  version: PropTypes.string.isRequired,
  latestVersion: PropTypes.string,
  // actions
  changeRoute: PropTypes.func.isRequired,
  toggleSidebarLeft: PropTypes.func.isRequired,
  toggleSidebarRight: PropTypes.func.isRequired,
  hideAppError: PropTypes.func.isRequired,
  hideAppInfo: PropTypes.func.isRequired,
  reloadAndUpdateVersion: PropTypes.func.isRequired,
  // routines
  deleteSession: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  showSidebarLeft: makeSelectShowSidebarLeft(),
  sidebarRight: makeSelectSidebarRight(),
  appError: makeSelectAppError(),
  appInfo: makeSelectAppInfo(),
  printing: makeSelectPrinting(),
  token: makeSelectToken(),
  version: makeSelectCurrentVersion(),
  latestVersion: makeSelectLatestVersion(),
});

function mapDispatchToProps(dispatch) {
  return {
    changeRoute: (url) => dispatch(push(url)),
    toggleSidebarLeft: bindActionCreators(toggleSidebarLeft, dispatch),
    toggleSidebarRight: bindActionCreators(toggleSidebarRight, dispatch),
    reloadAndUpdateVersion: bindActionCreators(reloadAndUpdateVersion, dispatch),
    hideAppError: bindActionCreators(hideAppError, dispatch),
    hideAppInfo: bindActionCreators(hideAppInfo, dispatch),
    ...bindRoutineCreators({ deleteSession }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

// version from response - first param, local version second param
const semverGreaterThan = (versionA, versionB) => {
  if (!versionA || !versionB) {
    return true;
  }

  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};
