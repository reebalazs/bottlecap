var dataView;
var grid;
var data = [];
var columns = [];

var options = {
    enableCellNavigation: true
};

var sortcol = "title";
var sortdir = 1;

function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
}


$(function() {
    // prepare the data
    for (var i = 0; i < 100; i++) {
        var d = (data[i] = {});

        d["id"] = "id_" + i;
        d["type"] = '';
        d["title"] = "Task " + i;
        d["modified"] = '01/01/2011';
    }

    // Setup the columns
    var checkboxSelector = new Slick.CheckboxSelectColumn({
        cssClass: "slick-cell-checkboxsel"
    });

    var columns = [
        checkboxSelector.getColumnDefinition(),
//        {id:"sel", name:"#", field:"num", cssClass:"cell-selection", width:40, resizable:false, unselectable:true },
        {id:"type", name:"Type", field:"type", width:40, minWidth:40, cssClass:"cell-type", sortable:true},
        {id:"title", name:"Title", field:"title", width:320, minWidth:320, cssClass:"cell-title", sortable:true},
        {id:"modified", name:"Modified", field:"modified", sortable:true}
    ];



    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#myGrid", dataView, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
    grid.registerPlugin(checkboxSelector);

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

})