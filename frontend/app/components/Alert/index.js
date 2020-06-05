/**
*
* Alert
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import AlertContainer from 'react-alert';

const genericAlertOptions = {
  offset: 14,
  position: 'top right',
  theme: 'dark',
  time: 5000,
  transition: 'scale',
};


class Alert extends React.PureComponent {

  constructor(props) {
    super(props);

    this.showAlert = this.showAlert.bind(this);
  }

  componentDidMount() {
    this.showAlert();
  }

  showAlert() {
    this.alert.show(this.props.msg, {
      time: this.props.time,
      type: this.props.type,
      onClose: this.props.onClose,
    });
  }

  render() {
    return (
      <div>
        <AlertContainer ref={(a) => { this.alert = a; }} {...genericAlertOptions} />
      </div>
    );
  }
}

Alert.propTypes = {
  // properties
  msg: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  // functions
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  time: 2000,
  type: 'success',
};

export default Alert;
