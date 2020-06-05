/**
*
* EditableList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import IconButton from 'material-ui/IconButton';
import AddBox from 'material-ui/svg-icons/content/add-box';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import InfoIcon from 'material-ui/svg-icons/action/info';
import Truncate from 'react-truncate';
import ReactTooltip from 'react-tooltip';

import InlineInputField from 'components/InlineInputField';
import { MediTheme } from 'utils/theme';

import BoxWrapper, {
  Label,
  Value,
  FlexWrapper,
  SectionWrapper,
  IconButtonWrapper,
} from './Wrapper';


class EditableList extends React.PureComponent {

  constructor(props) {
    super(props);

    this.renderBox = this.renderBox.bind(this);
    this.renderInput = this.renderInput.bind(this);
  }

  renderBox(key, width, label, value, align, disableTruncate) {
    return (
      <BoxWrapper key={key} width={width}>
        { label &&
          <Label width={1} style={{ textAlign: align }}>
            {label}
          </Label>
        }
        <Value width={1} style={{ textAlign: align }}>
          { disableTruncate ? value : <Truncate lines={1} ellipsis={<span>...</span>}>{value}</Truncate> }
        </Value>
      </BoxWrapper>
    );
  }

  renderInput(key, { width, name, label, value, align }, record) {
    return (
      <BoxWrapper key={key} width={width}>
        <InlineInputField
          name={name}
          label={label}
          value={value}
          handleOnBlur={(submittedValue) => this.props.handleSubmit(submittedValue, record, name)}
          validate={this.props.validate[name]}
          align={align}
        />
      </BoxWrapper>
    );
  }

  render() {
    const items = [];

    if (this.props.records.length === 0) {
      items.push(
        <FlexWrapper key="record-empty" wrap is="section" align="center" justify="space-around" py="10px" className="first last">
          {`Es konnten keine Einträge für ${this.props.header} gefunden werden.`}
        </FlexWrapper>
      );
    } else {
      this.props.records.forEach((record, index) => {
        const classNames = [];
        if (index === 0) {
          classNames.push('first');
        }
        if (index === this.props.records.length - 1) {
          classNames.push('last');
        }

        const boxes = [];
        record.boxes.forEach((box, boxIndex) => {
          if (this.props.isClosed === false && box.isClosed !== true && box.name) {
            boxes.push(this.renderInput(`record-${record.key}-box-${boxIndex}`, box, record));
          } else {
            boxes.push(this.renderBox(`record-${record.key}-box-${boxIndex}`, box.width, box.label, box.value, box.align, box.disableTruncate || false));
          }
        });

        const editTooltipId = `editable-list-edit-tooltip-for-${record.key}`;
        const deleteTooltipId = `editable-list-delete-tooltip-for-${record.key}`;

        items.push(
          <FlexWrapper key={`record-${record.key}`} wrap is="section" align="center" justify="space-around" py="10px" className={classNames.join(' ')}>
            { boxes }
            { this.props.hasActionButtons &&
              this.renderBox(`record-${record.key}-box-actions`, 1 / 4, false, (
                <section>
                  <IconButtonWrapper
                    touch
                    disabled={record.closed}
                    data-tip={`${this.props.header} bearbeiten`}
                    data-for={editTooltipId}
                    onTouchTap={() => this.props.handleEdit(record)}
                  >
                    <EditIcon color={MediTheme.palette.accent3Color} />
                  </IconButtonWrapper>
                  <ReactTooltip id={editTooltipId} />
                  <IconButtonWrapper
                    touch
                    disabled={record.closed}
                    data-tip={`${this.props.header} löschen`}
                    data-for={deleteTooltipId}
                    onTouchTap={() => this.props.handleDelete(record)}
                  >
                    <DeleteIcon color={MediTheme.palette.primary1Color} />
                  </IconButtonWrapper>
                  <ReactTooltip id={deleteTooltipId} />
                </section>
              ), 'right', true)
            }
          </FlexWrapper>
        );
      });
    }

    return (
      <SectionWrapper>
        <Flex wrap is="section" align="center">
          <Box>
            <h2>{this.props.header}</h2>
          </Box>
          { this.props.informations &&
            <Box ml="5px">
              <InfoIcon data-tip={this.props.informations} data-for="editable-list-info-tooltip" />
              <ReactTooltip id="editable-list-info-tooltip" />
            </Box>
          }
          { this.props.hasActionButtons &&
            <Box>
              <IconButton
                touch
                data-tip={`${this.props.header} hinzufügen`}
                data-for="editable-list-add-endtry-tooltip"
                onTouchTap={this.props.handleCreate}
              >
                <AddBox />
              </IconButton>
              <ReactTooltip id="editable-list-add-endtry-tooltip" />
            </Box>
          }
        </Flex>
        {items}
      </SectionWrapper>
    );
  }
}

EditableList.propTypes = {
  // properties
  header: PropTypes.string.isRequired,
  records: PropTypes.array.isRequired,
  isClosed: PropTypes.bool.isRequired,
  hasActionButtons: PropTypes.bool.isRequired,
  informations: PropTypes.string,
  // functions
  validate: PropTypes.object.isRequired,
  // actions
  handleCreate: PropTypes.func,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  handleSubmit: PropTypes.func,
};

EditableList.defaultProps = {
  records: [],
  isClosed: false,
  hasActionButtons: false,
};

export default EditableList;
