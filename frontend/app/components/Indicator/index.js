/**
*
* Indicator
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import VacationIcon from 'material-ui/svg-icons/action/flight-takeoff';
import ArmyIcon from 'material-ui/svg-icons/action/android';
import LoyaltyIcon from 'material-ui/svg-icons/action/loyalty';
import DefaultIcon from 'material-ui/svg-icons/action/info-outline';
import RunIcon from 'material-ui/svg-icons/maps/directions-run';
import SchoolIcon from 'material-ui/svg-icons/social/school';
import TotalIcon from 'material-ui/svg-icons/content/select-all';
import IllnessIcon from 'material-ui/svg-icons/maps/local-hotel';
import ReactTooltip from 'react-tooltip';

import FlexWrapper, { IconWrapper, ContentWrapper, Saldo, Target } from './Wrapper';

const UNIT_LOOKUP = {
  s: 's',
  m: 'm',
  h: 'h',
  d: 'T',
  n: 'h',
  w: 'W',
};

const ICON_LOOKUP = {
  Ferien: <VacationIcon />,
  Treueprämien: <LoyaltyIcon />,
  Total: <TotalIcon />,
  'Bew. Nachqual.': <SchoolIcon />,
  'Militär / Diverses': <ArmyIcon />,
  'Besondere Abwesenheiten': <RunIcon />,
  Krankheit: <IllnessIcon />,
};


function Indicator(props) {
  const { id, label, unit, actual, target, saldo } = props;
  const icon = ICON_LOOKUP[label] || <DefaultIcon />;
  const prettyUnit = UNIT_LOOKUP[unit] || unit;

  const classNames = [];
  if (saldo === 0) {
    classNames.push('blue');
  } else if (saldo < 0) {
    classNames.push('red');
  } else {
    classNames.push('green');
  }

  const tooltipId = `indictor-tooltip-${id}`;
  const tooltip = `${label} (Saldo, Ist / Soll)`;

  return (
    <FlexWrapper wrap is="section" align="center" justify="space-around" className={classNames.join(' ')}>
      <ContentWrapper width={1}>
        {label}
      </ContentWrapper>
      <IconWrapper width={1 / 3} data-tip={tooltip} data-for={tooltipId}>
        {icon}
      </IconWrapper>
      <ContentWrapper width={2 / 3}>
        <Saldo>{saldo} {prettyUnit}</Saldo>
        <Target>{actual} / {target}</Target>
      </ContentWrapper>
      <ReactTooltip id={tooltipId} />
    </FlexWrapper>
  );
}

Indicator.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  actual: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
  saldo: PropTypes.number.isRequired,
};

export default Indicator;
