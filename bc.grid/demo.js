var dataView;
var grid;
var data = [];
var columns = [];
var columnpicker;

var options = {
    editable: true
};

var sortcol = "title";
var sortdir = 1;

function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
}


$(function() {


    $("#bc-grid-addfolderdialog").dialog({autoOpen: false});
    $("#bc-grid-addfiledialog").dialog({autoOpen: false});

    // prepare the data
    for (var i = 0; i < 100; i++) {
        var d = (data[i] = {});

        d["id"] = "id_" + i;
        d["type"] = '';
        d["title"] = "Task " + i;
        d["modified"] = '01/01/2011';
        d["author"] = "repaul";
        d["href"] = "http://www.google.com";
    }

    // Setup the columns
    var checkboxSelector = new Slick.CheckboxSelectColumn({
        cssClass: "slick-cell-checkboxsel"
    });
    var checkboxColumn = checkboxSelector.getColumnDefinition();
    checkboxColumn['unselectable'] = false;

    function TitleFormatter(row, cell, value, columnDef, dataContext) {
        var href = dataContext['href'];
        return '<a href="' + href + '">' + value + '</a>';
    }

    columns = [
        checkboxColumn,
        {id:"type", name:"Type", field:"type", width:40, minWidth:40, cssClass:"cell-type", sortable:true},
        {id:"title", name:"Title", field:"title", width:320, cssClass:"cell-title",
            sortable:true, formatter:TitleFormatter, editor:TextCellEditor},
        {id:"modified", name:"Modified", field:"modified", sortable:true},
        {id:"author", name:"Author", field:"author", visible: false, sortable: true}
    ];


    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#myGrid", dataView, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
    grid.registerPlugin(checkboxSelector);
    columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

    grid.onSort.subscribe(function(e, args) {
        sortdir = args.sortAsc ? 1 : -1;
        sortcol = args.sortCol.field;

        dataView.sort(comparer, args.sortAsc);
    });

    // wire up model events to drive the grid
    dataView.onRowCountChanged.subscribe(function(e, args) {
        grid.updateRowCount();
        grid.render();
    });

    dataView.onRowsChanged.subscribe(function(e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
    });

    // initialize the model after all the events have been hooked up
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();

    // Custom
    function add_folder() {
        var ab = $('#bc-grid-addfolder');
        var left = ab.position().left;
        var top = ab.position().top + ab.height();
        $("#bc-grid-addfolderdialog").dialog({position: [left, top]});
        $("#bc-grid-addfolderdialog").dialog("open");
        console.log('add_folder');
    }
    function add_file() {
        var ab = $('#bc-grid-addfile');
        var left = ab.position().left;
        var top = ab.position().top + ab.height();
        $("#bc-grid-addfiledialog").dialog({position: [left, top]});
        $("#bc-grid-addfiledialog").dialog("open");
        console.log('add_file');
    }

    function delete_items() {
        dataView.beginUpdate();
        var rows = grid.getSelectedRows();
        for (var i = 0, l = rows.length; i < l; i++) {
            var item = dataView.getItem(rows[i]);
            if (item) dataView.deleteItem(item.id);
        }
        grid.setSelectedRows([]);
        dataView.endUpdate();
    }

    function moveto_items() {
        console.log("moveto");
    }

    $("#bc-grid-addables").buttonset();
    $('#bc-grid-addfolder')
            .button(
        {icons: {
        primary: "ui-icon-plus"
    },
            text: true}
            )
            .bind('click', add_folder);
    $('#bc-grid-addfile')
            .button(
        {icons: {
        primary: "ui-icon-plus"
    },
            text: true}
            )
            .bind('click', add_file);
    $("#bc-grid-actions").buttonset();
    $('#bc-grid-delete')
            .button(
        {icons: {
        primary: "ui-icon-trash"
    },
            text: false}
            )
            .bind('click', delete_items);
    $('#bc-grid-moveto')
            .button(
        {icons: {
        primary: "ui-icon-circle-arrow-e"
    },
            text: false}
            )
            .bind('click', moveto_items);
});