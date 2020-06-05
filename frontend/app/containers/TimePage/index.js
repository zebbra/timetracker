/*
 * TimePage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import Loader from 'react-loader-advanced';

import Alert from 'components/Alert';
import RowHeader from 'components/RowHeader';
import Spinner from 'components/Spinner';
import { toggleSidebarRight, togglePrinting } from 'containers/App/actions';
import { makeSelectOnboarded, makeSelectPrinting } from 'containers/App/selectors';
import { makeSelectLoading } from 'containers/Calendar/selectors';
import Calendar from 'containers/Calendar';
import { userContext } from 'hocs';
import { asPdfWrapper } from 'utils/generic-helpers';

import makeSelectTimePage from './selectors';

const IconLookup = {
  Ferien: 'vacation',
  Treueprämien: 'loyalty',
  'Bew. Nachqual.': 'school',
  'Militär / Diverses': 'army',
  'Besondere Abwesenheiten': 'run',
  Krankheit: 'illness',
};

const UNIT_LOOKUP = {
  s: 's',
  m: 'm',
  h: 'h',
  d: 'T',
  n: 'h',
  w: 'W',
};


@userContext
export class TimePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    if (this.props.printing) {
      this.props.togglePrinting();
    }
  }

  render() {
    const isImpersonated = this.props.isImpersonated === undefined ? false : this.props.isImpersonated;
    const indicators = this.props.TimePage.reporting.map((reporting) => (
      {
        label: reporting.label,
        saldo: reporting.saldo,
        unit: UNIT_LOOKUP[reporting.unit] || reporting.unit,
        icon: IconLookup[reporting.label] || 'default',
      }
    ));

    return (
      <Loader
        show={this.props.loading}
        message={<Spinner />}
        contentBlur={0.5}
        backgroundStyle={{ backgroundColor: 'rgab(255,255,255,0.4)' }}
      >
        { !this.props.onboarded &&
          <Alert
            msg="Bitte hinterlege ein Arbeitspensum in deinen Einstellungen"
            type="info"
            time={0}
          />
        }
        { <RowHeader
          title="Zeiterfassung"
          iconRight={isImpersonated ? undefined : <SettingsIcon />}
          onIconRightClick={isImpersonated ? undefined : () => this.props.toggleSidebarRight('CalendarSettings')}
          tooltip="Kalender-Einstellungen"
          indicators={indicators}
          hasDownloadIcon
          downloadFormats={['pdf']}
          onDownloadIconClick={() => asPdfWrapper(this.props.togglePrinting, `Zeiterfassung ${this.props.firstName} ${this.props.lastName}`)}
        /> }
        <div>
          <Calendar
            isImpersonated={isImpersonated}
            firstName={this.props.firstName}
            lastName={this.props.lastName}
          />
        </div>
      </Loader>
    );
  }
}

TimePage.propTypes = {
  // properties
  TimePage: PropTypes.shape({
    reporting: PropTypes.array.isRequired,
  }).isRequired,
  isImpersonated: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  printing: PropTypes.bool.isRequired,
  onboarded: PropTypes.bool,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  // actions
  toggleSidebarRight: PropTypes.func.isRequired,
  togglePrinting: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  TimePage: makeSelectTimePage(),
  onboarded: makeSelectOnboarded(),
  printing: makeSelectPrinting(),
  loading: makeSelectLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    toggleSidebarRight: bindActionCreators(toggleSidebarRight, dispatch),
    togglePrinting: bindActionCreators(togglePrinting, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TimePage);
