/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import React from 'react';
import { Flex } from 'grid-styled';
import { Card, CardText } from 'material-ui/Card';

import CardHeader from 'components/CardHeader';

import Wrapper from './Wrapper';


function NotFound() {
  return (
    <Wrapper>
      <Flex
        wrap
        is="section"
        px={['16px', '150px', '200px', '300px', '400px']}
        mt={['16px', '16px', '50px']}
      >
        <Card>
          <CardHeader title="Seite nicht gefunden" />
          <CardText>
            404 Diese Seite existiert nicht
          </CardText>
        </Card>
      </Flex>
    </Wrapper>
  );
}

export default NotFound;
