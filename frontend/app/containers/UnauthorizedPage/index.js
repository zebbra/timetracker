/**
 * UnauthorizedPage
 *
 * This is the page we show when the user visits a url that he is not allowed to see
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { Flex } from 'grid-styled';
import { Card, CardText } from 'material-ui/Card';

import CardHeader from 'components/CardHeader';
import Link from 'components/Link';
import { deleteSession } from 'hocs/Session/routines';

import Wrapper from './Wrapper';


function UnauthorizedPage(props) {
  return (
    <Wrapper>
      <Flex
        wrap
        is="section"
        px={['16px', '150px', '200px', '300px', '400px']}
        mt={['16px', '16px', '50px']}
      >
        <Card>
          <CardHeader title="Unautorisiert" />
          <CardText>
            403 Deine Berechtigung reicht für diese Seite nicht aus. Eventuell ist deine Session abgelaufen und du must dich erneut
            <Link onClick={props.deleteSession}>anmelden</Link>
          </CardText>
        </Card>
      </Flex>
    </Wrapper>
  );
}


UnauthorizedPage.propTypes = {
  // routines
  deleteSession: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindRoutineCreators({ deleteSession }, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UnauthorizedPage);
