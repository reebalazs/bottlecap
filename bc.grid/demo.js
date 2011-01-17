var dataView;
var grid;
var data = [];

var columns = [
    {id:"sel", name:"#", field:"num", cssClass:"cell-selection", width:40, resizable:false, unselectable:true },
    {id:"title", name:"Title", field:"title", width:120, minWidth:120, cssClass:"cell-title", sortable:true},
    {id:"duration", name:"Duration", field:"duration", sortable:true},
    {id:"%", name:"% Complete", field:"percentComplete", width:80, sortable:true},
    {id:"start", name:"Start", field:"start", minWidth:60, sortable:true},
    {id:"finish", name:"Finish", field:"finish", minWidth:60, sortable:true}
];

var options = {
    enableCellNavigation: true
};

var sortcol = "title";
var sortdir = 1;
var percentCompleteThreshold = 0;
var searchString = "";

function percentCompleteSort(a, b) {
    return a["percentComplete"] - b["percentComplete"];
}

function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
}


$(function() {
    // prepare the data
    for (var i = 0; i < 10000; i++) {
        var d = (data[i] = {});

        d["id"] = "id_" + i;
        d["num"] = i;
        d["title"] = "Task " + i;
        d["duration"] = Math.round(Math.random() * 14);
        d["percentComplete"] = Math.round(Math.random() * 100);
        d["start"] = "01/01/2009";
        d["finish"] = "01/05/2009";
    }


    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#myGrid", dataView, columns, options);

    var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
    var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

    grid.onSort.subscribe(function(e, args) {
        sortdir = args.sortAsc ? 1 : -1;
        sortcol = args.sortCol.field;

        if ($.browser.msie && $.browser.version <= 8) {
            // using temporary Object.prototype.toString override
            // more limited and does lexicographic sort only by default, but can be much faster

            var percentCompleteValueFn = function() {
                var val = this["percentComplete"];
                if (val < 10)
                    return "00" + val;
                else if (val < 100)
                    return "0" + val;
                else
                    return val;
            };

            // use numeric sort of % and lexicographic for everything else
            dataView.fastSort((sortcol == "percentComplete") ? percentCompleteValueFn : sortcol, args.sortAsc);
        }
        else {
            // using native sort with comparer
            // preferred method but can be very slow in IE with huge datasets
            dataView.sort(comparer, args.sortAsc);
        }
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

    $("#gridContainer").resizable();
})