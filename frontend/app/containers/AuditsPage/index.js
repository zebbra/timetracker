import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { createStructuredSelector } from 'reselect';
import Loader from 'react-loader-advanced';
import { Flex } from 'grid-styled';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import ReactJson from 'react-json-view';

import Spinner from 'components/Spinner';
import Table from 'components/Table';

import { superAdminContext } from 'hocs';

import { setSelectedYear, setRenderComponent } from './actions';
import { fetchAuditLogs } from './routines';
import makeSelectAuditsPage, { makeSelectAudits, makeSelectAudit } from './selectors';
import { data } from './dataFormat';
import Wrapper from './Wrapper';

@superAdminContext
export class AuditsPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderShow = this.renderShow.bind(this);
  }

  componentWillMount() {
    this.props.fetchAuditLogs.trigger(this.props.username);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.AuditsPage.get('selectedYear') !== this.props.AuditsPage.get('selectedYear')) {
      this.props.fetchAuditLogs.trigger(this.props.username);
    }
  }

  handleBackButtonClick() {
    this.props.setRenderComponent('table', {});
  }

  renderTable() {
    return (
      <Flex wrap is="section" px={['0px', '16px', '16px', '100px']} py={['0px', '16px']}>
        <Card>
          <Table
            title="Änderungsprotokoll"
            ressource="Änderung"
            data={this.props.audits}
            columns={data}
            yearSelect
            onYearSelect={this.props.setSelectedYear}
            selectedYear={this.props.AuditsPage.get('selectedYear')}
            show={(audit) => this.props.setRenderComponent('show', audit)}
          />
        </Card>
      </Flex>
    );
  }

  renderShow() {
    const audit = this.props.AuditsPage.get('audit');
    return (
      <Flex wrap is="section">
        <Card>
          <CardHeader
            title={`${audit.get('subEventName')}: ${audit.get('eventName')}`}
            subtitle={`${audit.get('username') || 'N/A'}`}
          />
          <CardText>
            <ReactJson
              src={audit.toJS()}
              theme="monokai"
              displayDataTypes={false}
              collapsed={2}
            />
          </CardText>
          <CardActions>
            <RaisedButton label="Zurück" secondary onClick={() => this.handleBackButtonClick()} />
          </CardActions>
        </Card>
      </Flex>
    );
  }

  render() {
    return (
      <Loader
        show={this.props.AuditsPage.get('loading')}
        message={<Spinner />}
        contentBlur={0.5}
        backgroundStyle={{ backgroundColor: 'rgab(255,255,255,0.4)' }}
      >
        <Wrapper>
          { this.props.AuditsPage.get('renderComponent') === 'table' ? this.renderTable() : this.renderShow() }
        </Wrapper>
      </Loader>
    );
  }
}

AuditsPage.propTypes = {
  // properties
  AuditsPage: ImmutablePropTypes.contains({
    loading: PropTypes.bool.isRequired,
    selectedYear: PropTypes.number.isRequired,
    renderComponent: PropTypes.oneOf(['table', 'show']),
    audit: PropTypes.object,
  }).isRequired,
  audits: PropTypes.array,
  username: PropTypes.string,
  // actions
  setSelectedYear: PropTypes.func.isRequired,
  setRenderComponent: PropTypes.func.isRequired,
  // routines
  fetchAuditLogs: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  AuditsPage: makeSelectAuditsPage(),
  audits: makeSelectAudits(),
  audit: makeSelectAudit(),
});

function mapDispatchToProps(dispatch) {
  return {
    setRenderComponent: bindActionCreators(setRenderComponent, dispatch),
    setSelectedYear: bindActionCreators(setSelectedYear, dispatch),
    ...bindRoutineCreators({ fetchAuditLogs }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuditsPage);
