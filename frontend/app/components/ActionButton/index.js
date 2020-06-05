/**
*
* ActionButton
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import Create from 'material-ui/svg-icons/content/add';
import Edit from 'material-ui/svg-icons/content/create';
import Delete from 'material-ui/svg-icons/action/delete-forever';
import Cancel from 'material-ui/svg-icons/navigation/cancel';
import { fullWhite } from 'material-ui/styles/colors';

import ButtonWrapper from './ButtonWrapper';


function ActionButton(props) {
  const { label, labelPosition, primary, secondary, style, disabled } = props;
  const { handleAction } = props;

  let icon;

  switch (props.type) {
    case 'create':
      icon = <Create color={fullWhite} />;
      break;
    case 'edit':
      icon = <Edit color={fullWhite} />;
      break;
    case 'delete':
      icon = <Delete color={fullWhite} />;
      break;
    case 'cancel':
      icon = <Cancel color={fullWhite} />;
      break;
    default:
      break;
  }

  return (
    <ButtonWrapper
      onTouchTap={handleAction}
      label={label}
      labelPosition={labelPosition}
      primary={primary}
      secondary={secondary}
      style={style}
      disabled={disabled}
      icon={icon}
    />
  );
}

ActionButton.propTypes = {
  // properties
  disabled: PropTypes.bool.isRequired,
  primary: PropTypes.bool.isRequired,
  secondary: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  labelPosition: PropTypes.oneOf(['before', 'after']).isRequired,
  type: PropTypes.oneOf(['create', 'edit', 'delete', 'cancel']),
  style: PropTypes.object,
  // actions
  handleAction: PropTypes.func.isRequired,
};

ActionButton.defaultProps = {
  primary: false,
  secondary: false,
  labelPosition: 'before',
  disabled: false,
};

export default ActionButton;
