import './style.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import * as agGrid from 'ag-grid-community';

import CustomPinnedRowRenderer from './customPinnedRowRenderer';
import GenderCellRenderer from './genderCellRenderer';

var columnDefs = [
  { field: 'athlete' },
  {
    field: 'gender',
    cellRenderer: 'genderCellRenderer',
    cellEditor: 'agRichSelectCellEditor',

    cellEditorParams: {
      values: ['Male', 'Female'],
      cellRenderer: 'genderCellRenderer',
    },
  },
  { field: 'date', cellEditor: 'datePicker' },
  { field: 'age' },
];

function isEmptyPinnedCell(params) {
  return params.node.rowPinned === 'top' && params.value == null;
}

function createPinnedCellPlaceholder(params) {
  return (
    params.colDef.field[0].toUpperCase() + params.colDef.field.slice(1) + '...'
  );
}

function isPinnedRowDataCompleted() {
  let keys = columnDefs.map((columnDef) => columnDef.field);
  for (let key of keys) {
    if (pinnedTopRowData[key] == null) {
      return false;
    }
  }
  return true;
}

var pinnedTopRowData = {};

var gridOptions = {
  pinnedTopRowData: [pinnedTopRowData],
  components: {

    genderCellRenderer: GenderCellRenderer,
    datePicker: getDatePicker(),
  },

  onCellEditingStopped: (params) => {
    if (params.rowPinned === 'top') {
      if (isPinnedRowDataCompleted()) {
        let currentRowData = [];
        gridOptions.api.forEachNode(({ data }) => currentRowData.push(data));
        let newRowData = [...currentRowData, pinnedTopRowData];
        gridOptions.api.setRowData(newRowData);

        pinnedTopRowData = {};
        gridOptions.api.setPinnedTopRowData([pinnedTopRowData]);
      }
    }
  },

  defaultColDef: {
    flex: 1,
    width: 200,
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
    valueFormatter: (params) => {
      if (isEmptyPinnedCell(params)) {
        return createPinnedCellPlaceholder(params);
      }
    },
  },
  columnDefs: columnDefs,
  rowData: null,
  getRowStyle: function (params) {
    if (params.node.rowPinned) {
      return { 'font-weight': 'bold', 'font-style': 'italic' };
    }
  },
};

function getDatePicker() {
  // function to act as a class
  function Datepicker() {}

  // gets called once before the renderer is used
  Datepicker.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;
    this.eInput.classList.add('ag-input');
    this.eInput.style.height = '100%';

    // https://jqueryui.com/datepicker/
    $(this.eInput).datepicker({
      dateFormat: 'dd/mm/yy',
    });
  };

  // gets called once when grid ready to insert the element
  Datepicker.prototype.getGui = function () {
    return this.eInput;
  };

  // focus and select can be done after the gui is attached
  Datepicker.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
  };

  // returns the new value after editing
  Datepicker.prototype.getValue = function () {
    return this.eInput.value;
  };

  // any cleanup we need to be done here
  Datepicker.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could
    // even leave this method out as it's optional
  };

  // if true, then this editor will appear in a popup
  Datepicker.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
  };

  return Datepicker;
}
const gridDiv = document.querySelector('#myGrid');
new agGrid.Grid(gridDiv, gridOptions);

agGrid
  .simpleHttpRequest({
    url: 'https://www.ag-grid.com/example-assets/olympic-winners.json',
  })
  .then(function (data) {
    gridOptions.api.setRowData(
      data.slice(0, 3).map((row) => ({
        ...row,
        gender: Math.floor(Math.random() * 3) < 1 ? 'Male' : 'Female',
      }))
    );
  });
