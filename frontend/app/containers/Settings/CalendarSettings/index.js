/*
 *
 * CalendarSettings
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindRoutineCreators } from 'redux-saga-routines';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { ListItem } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { sortBy, values, fromPairs } from 'lodash';
import { Map, fromJS } from 'immutable';

import { editUserSettings, deleteUserSettings } from 'containers/Calendar/routines';
import { makeSelectElements, makeSelectUserSettings } from 'containers/Calendar/selectors';
import { move } from 'utils/generic-helpers';

import ListWrapper from './Wrapper';


export class CalendarSettings extends React.PureComponent {

  constructor(props) {
    super(props);

    this.toggleWeekendVisibility = this.toggleWeekendVisibility.bind(this);
    this.toggleElementsVisibility = this.toggleElementsVisibility.bind(this);
    this.toggleElementVisibility = this.toggleElementVisibility.bind(this);
    this.sortElements = this.sortElements.bind(this);
    this.renderList = this.renderList.bind(this);
  }

  toggleWeekendVisibility(showWeekend) {
    this.props.editUserSettings.trigger(this.props.userSettings.set('showWeekend', showWeekend));
  }

  toggleElementsVisibility(event, hidden, elements) {
    let userSettings = this.props.userSettings;

    elements.forEach((element) => {
      if (userSettings.hasIn(['elements', element.get('id')])) {
        userSettings = userSettings.setIn(['elements', element.get('id'), 'hidden'], hidden);
      } else {
        userSettings = userSettings.setIn(['elements', element.get('id')], Map({ hidden }));
      }
    });
    this.props.editUserSettings.trigger(userSettings);
  }

  toggleElementVisibility(id, hidden) {
    const userSettings = this.props.userSettings;

    if (userSettings.hasIn(['elements', id])) {
      this.props.editUserSettings.trigger(userSettings.setIn(['elements', id, 'hidden'], hidden));
    } else {
      this.props.editUserSettings.trigger(userSettings.setIn(['elements', id], Map({ hidden })));
    }
  }

  sortElements({ oldIndex, newIndex, collection }) {
    // first we need to split by region type
    const userSettings = this.props.userSettings;
    const targetElements = this.props.elements.filter((entry) => entry.get('type') === collection);
    const oldElement = targetElements.get(oldIndex);
    const targetElement = targetElements.get(newIndex);
    const userSettingElementsMap = userSettings.get('elements').toJS();
    const userSettingElementsArray = sortBy(values(userSettingElementsMap), 'index');

    // if the oldElement is a new element which was never seen before, then we add it to the end of the list
    if (!userSettingElementsMap[oldElement.get('id')]) {
      userSettingElementsMap[oldElement.get('id')] = {
        id: oldElement.get('id'),
        hidden: false,
        index: userSettingElementsArray.length,
      };
      userSettingElementsArray.push(userSettingElementsMap[oldElement.get('id')]);
    }

    // same thing for targetElement
    if (!userSettingElementsMap[targetElement.get('id')]) {
      userSettingElementsMap[targetElement.get('id')] = {
        id: targetElement.get('id'),
        hidden: false,
        index: userSettingElementsArray.length,
      };
      userSettingElementsArray.push(userSettingElementsMap[targetElement.get('id')]);
    }

    // now we move the oldElement to the targetElements position
    const newUserSettingElementsArray = move(userSettingElementsArray, userSettingElementsMap[oldElement.get('id')].index, userSettingElementsMap[targetElement.get('id')].index);
    this.props.editUserSettings.trigger(userSettings.set('elements', fromJS(fromPairs(newUserSettingElementsArray.map((entry, index) => [entry.id, { id: entry.id, hidden: entry.hidden, index }])))));
  }

  renderList(entries, sortable) {
    function escapeLabel(label) {
      if (label.startsWith('Bemerkungen')) {
        return 'Bemerkungen';
      }

      return label;
    }

    const SortableItem = SortableElement(({ element }) => (
      <section style={{ zIndex: 2 }}>
        <ListItem
          primaryText={escapeLabel(element.get('label'))}
          style={{ cursor: 'move' }}
          leftCheckbox={
            <Checkbox
              checked={!element.get('hidden') && !element.get('hiddenWithTrack')}
              onCheck={() => this.toggleElementVisibility(element.get('id'), element.get('hiddenWithTrack') ? !element.get('hiddenWithTrack') : !element.get('hidden'))}
            />
          }
        />
      </section>
    ));

    const SortableList = SortableContainer(({ elements }) => (
      <ListWrapper>
        { elements.map((element, index) => (
          <SortableItem
            key={`sortable-elment-${index}`}
            index={index}
            element={element}
            collection={element.get('type')}
          />
        ))}
      </ListWrapper>
    ));

    if (sortable) {
      return (
        <SortableList
          useWindowAsScrollContainer
          lockAxis="y"
          pressDelay={200}
          onSortEnd={this.sortElements}
          elements={entries}
          toggle={this.toggleRow}
        />
      );
    }

    return (
      <ListWrapper>
        { entries.map((element, index) => (
          <ListItem
            key={`non-sortable-elment-${index}`}
            primaryText={escapeLabel(element.get('label'))}
            leftCheckbox={
              <Checkbox
                checked={!element.get('hidden') && !element.get('hiddenWithTrack')}
                onCheck={() => this.toggleElementVisibility(element.get('id'), element.get('hiddenWithTrack') ? !element.get('hiddenWithTrack') : !element.get('hidden'))}
              />
            }
          />
        ))}
      </ListWrapper>
    );
  }

  render() {
    const staticElements = this.props.elements.filter((element) => element.get('type') === 'static');
    const displayedStaticElements = staticElements.filter((element) => element.get('hiddenWithTrack') ? !element.get('hiddenWithTrack') : !element.get('hidden'));
    const dynamicElements = this.props.elements.filter((element) => element.get('type') === 'dynamic');
    const displayedDynamicElements = dynamicElements.filter((element) => element.get('hiddenWithTrack') ? !element.get('hiddenWithTrack') : !element.get('hidden'));

    return (
      <section>
        <Subheader>Generische Einstellungen</Subheader>
        <ListWrapper>
          <ListItem
            primaryText="Wochenende"
            leftCheckbox={
              <Checkbox
                checked={this.props.userSettings.get('showWeekend')}
                onCheck={() => this.toggleWeekendVisibility(!this.props.userSettings.get('showWeekend'))}
              />
            }
          />
          { this.props.userSettings.get('id') && <ListItem
            primaryText="Einstellungen zurücksetzen"
            rightToggle={
              <Toggle
                toggled={false}
                onToggle={() => this.props.deleteUserSettings.trigger(this.props.userSettings)}
              />
            }
          />}
        </ListWrapper>
        <Divider />
        <Subheader>Leistungselemente</Subheader>
        <ListItem
          primaryText={`Alle ${displayedDynamicElements.size === 0 ? 'einblenden' : 'ausblenden'}`}
          rightToggle={
            <Toggle
              toggled={displayedDynamicElements.size === 0}
              onToggle={(event, isInputChecked) => this.toggleElementsVisibility(event, isInputChecked, dynamicElements)}
            />
          }
        />
        {this.renderList(dynamicElements, true)}
        <Subheader>Statische Elemente</Subheader>
        <ListItem
          primaryText={`Alle ${displayedStaticElements.size === 0 ? 'einblenden' : 'ausblenden'}`}
          rightToggle={
            <Toggle
              toggled={displayedStaticElements.size === 0}
              onToggle={(event, isInputChecked) => this.toggleElementsVisibility(event, isInputChecked, staticElements)}
            />
          }
        />
        {this.renderList(staticElements, true)}
        <Divider />
      </section>
    );
  }
}

CalendarSettings.propTypes = {
  // properties
  elements: PropTypes.object.isRequired,
  userSettings: PropTypes.object.isRequired,
  // routines
  editUserSettings: PropTypes.func.isRequired,
  deleteUserSettings: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  elements: makeSelectElements(),
  userSettings: makeSelectUserSettings(),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindRoutineCreators({ editUserSettings }, dispatch),
    ...bindRoutineCreators({ deleteUserSettings }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CalendarSettings);
