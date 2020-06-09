/**
*
* Table
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import Edit from 'material-ui/svg-icons/editor/mode-edit';
import Dialog from 'material-ui/Dialog';
import ReactTooltip from 'react-tooltip';
import InfoIcon from 'material-ui/svg-icons/action/info';
import EyeIcon from 'material-ui/svg-icons/image/remove-red-eye';
import moment from 'moment-timezone';
import 'react-table/react-table.css';

import ActionButton from 'components/ActionButton';
import * as formatters from 'utils/generic-formatters';
import { MediTheme } from 'utils/theme';

import TableHeader from './TableHeader';
import TableWrapper, { ActionButtons } from './Wrapper';

const ICON_LOOKUP = {
  delete: <Delete />,
  edit: <Edit />,
  info: <InfoIcon />,
  eye: <EyeIcon />,
};


class Table extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.toggleDialog = this.toggleDialog.bind(this);
  }

  toggleDialog(record, remove) {
    if (remove) {
      this.setState({ open: !this.state.open });
      this.props.delete(this.state.record);
    } else {
      this.setState({
        open: !this.state.open,
        record,
      });
    }
  }

  render() {
    const columns = this.props.columns.map((entry) => {
      const column = {
        Header: entry.label,
        accessor: entry.name,
        style: {
          alignSelf: 'center',
          textAlign: entry.textAlign,
        },
      };

      if (entry.format && formatters[entry.format]) {
        column.id = entry.name;
        column.accessor = (d) => formatters[entry.format](d[entry.name]);
      } else if (entry.format === 'asTooltip') {
        column.id = entry.name;
        column.accessor = (d) => (
          <IconButton
            touch
            style={{ padding: 0, width: 20, height: 20 }}
            iconStyle={{ padding: 0, width: 20, height: 20 }}
          >
            <InfoIcon data-tip={d[entry.name]} data-for={`table-tooltip-${d.id}`} />
            <ReactTooltip html id={`table-tooltip-${d.id}`} />
          </IconButton>
        );
      } else if (entry.format === 'asCustomTooltip') {
        column.id = entry.name;
        column.accessor = (d) => (
          <section>
            <span data-tip={d[entry.accessor] || d[entry.name]} data-for={`table-custom-tooltip-${d.id}`}>{entry.head ? d[entry.name][0] : d[entry.name]}</span>
            <ReactTooltip html id={`table-custom-tooltip-${d.id}`} />
          </section>
        );
      } else if (entry.format === 'asIconButton') {
        column.id = entry.name;
        column.accessor = (d) => (
          <IconButton
            touch
            style={{ padding: 0, width: 20, height: 20 }}
            iconStyle={{ padding: 0, width: 20, height: 20 }}
            onTouchTap={() => this.props[entry.action] && this.props[entry.action](d)}
          >
            {ICON_LOOKUP[entry.icon] || ICON_LOOKUP.info}
          </IconButton>
        );
      }

      return column;
    });

    if (this.props.show || this.props.edit || this.props.delete) {
      columns.push({
        Header: <strong>Mehr</strong>,
        width: 65,
        Cell: (row) => <ActionButtons>
          { this.props.show &&
            <IconButton onTouchTap={() => this.props.show(row.original)} disabled={row.original.closed}>
              <EyeIcon color={MediTheme.palette.accentColor1} hoverColor={MediTheme.palette.primary2Color} data-tip="Anzeigen" data-for="table-action-entry-tooltip" />
            </IconButton>
          }
          { this.props.edit &&
            <IconButton onTouchTap={() => this.props.edit(row.original)} disabled={row.original.closed}>
              <Edit color={MediTheme.palette.accentColor1} hoverColor={MediTheme.palette.primary2Color} data-tip="Bearbeiten" data-for="table-action-entry-tooltip" />
            </IconButton>
          }
          { this.props.delete &&
            <IconButton onTouchTap={() => this.toggleDialog(row.original, false)} disabled={row.original.deletable === false || row.original.closed}>
              <Delete color={MediTheme.palette.primary1Color} hoverColor={MediTheme.palette.primary2Color} data-tip="Löschen" data-for="table-action-entry-tooltip" />
            </IconButton>
          }
        </ActionButtons>,
      });
    }

    const defaultFilterMethod = (filter, row) => {
      const id = filter.pivotId || filter.id;

      if (row[id] !== undefined) {
        if (row._original[id] !== undefined && Array.isArray(row._original[id])) {
          let contains = false;
          row._original[id].forEach((entry) => {
            if (String(entry).toLowerCase().startsWith(filter.value.toLowerCase())) {
              contains = true;
              return false;
            }
            return true;
          });
          return contains;
        }
        return String(row[id]).toLowerCase().startsWith(filter.value.toLowerCase());
      }
      return true;
    };

    const defaultSortMethod = (a, b) => {
      // force null and undefined to the bottom
      let _a = (a === null || a === undefined) ? -Infinity : a;
      let _b = (b === null || b === undefined) ? -Infinity : b;
      // force any string values to lowercase
      _a = typeof _a === 'string' ? _a.toLowerCase() : _a;
      _b = typeof _b === 'string' ? _b.toLowerCase() : _b;
      // parse as moment date if its a valid date
      _a = moment(_a, 'DD.MM.YYYY').isValid() ? moment(_a, 'DD.MM.YYYY').valueOf() : _a;
      _b = moment(_b, 'DD.MM.YYYY').isValid() ? moment(_b, 'DD.MM.YYYY').valueOf() : _b;
      // Return either 1 or -1 to indicate a sort priority
      if (_a > _b) {
        return 1;
      }
      if (_a < _b) {
        return -1;
      }
      // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
      return 0;
    };

    return (
      <TableWrapper>
        <TableHeader
          title={this.props.title}
          ressource={this.props.ressource}
          addAction={this.props.create}
          yearSelect={this.props.yearSelect}
          onYearSelect={this.props.onYearSelect}
          selectedYear={this.props.selectedYear}
          disabledAddButton={this.props.disabledAddButton}
        />
        <ReactTable
          columns={columns}
          data={this.props.data}
          defaultPageSize={20}
          className="-striped -highlight"
          filterable
          defaultFilterMethod={defaultFilterMethod}
          defaultSortMethod={defaultSortMethod}

          // Text
          previousText="<"
          nextText=">"
          loadingText="Lädt..."
          noDataText="Keine Einträge gefunden!"
          pageText="Seite"
          ofText="von"
          rowsText="Zeilen"
        />
        <Dialog
          actions={[
            <ActionButton
              handleAction={() => this.toggleDialog(null, true)}
              label="Löschen"
              primary
            />,
            <ActionButton
              handleAction={() => this.toggleDialog(null, false)}
              label="Abbrechen"
              secondary
              style={{ marginLeft: '5px' }}
            />,
          ]}
          open={this.state.open}
        >
          {this.props.ressource} wirklich löschen?
        </Dialog>
        <ReactTooltip id="table-action-entry-tooltip" />
      </TableWrapper>
    );
  }
}

Table.propTypes = {
  // properties
  title: PropTypes.string.isRequired,
  ressource: PropTypes.string.isRequired,
  yearSelect: PropTypes.bool,
  selectedYear: PropTypes.number,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  disabledAddButton: PropTypes.bool,
  // actions
  show: PropTypes.func,
  create: PropTypes.func,
  edit: PropTypes.func,
  delete: PropTypes.func,
  onYearSelect: PropTypes.func,
};

export default Table;
