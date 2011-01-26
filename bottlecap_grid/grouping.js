var dataView;
var grid;
var data = [];

var columns = [
    {id:"sel", name:"#", field:"num", cssClass:"cell-selection", width:40, resizable:false, unselectable:true },
    {id:"title", name:"Title", field:"title", width:120, minWidth:120, cssClass:"cell-title", sortable:true},
    {id:"duration", name:"Duration", field:"duration", sortable:true},
    {id:"%", name:"% Complete", field:"percentComplete", width:80, formatter:GraphicalPercentCompleteCellFormatter, sortable:true, groupTotalsFormatter:avgTotalsFormatter},
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

function avgTotalsFormatter(totals, columnDef) {
    return "avg: " + Math.round(totals.avg[columnDef.field]) + "%";
}

function myFilter(item) {
    if (item["percentComplete"] < percentCompleteThreshold)
        return false;

    if (searchString != "" && item["title"].indexOf(searchString) == -1)
        return false;

    return true;
}

function percentCompleteSort(a, b) {
    return a["percentComplete"] - b["percentComplete"];
}

function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
}

function collapseAllGroups() {
    dataView.beginUpdate();
    for (var i = 0; i < dataView.getGroups().length; i++) {
        dataView.collapseGroup(dataView.getGroups()[i].value);
    }
    dataView.endUpdate();
}

function expandAllGroups() {
    dataView.beginUpdate();
    for (var i = 0; i < dataView.getGroups().length; i++) {
        dataView.expandGroup(dataView.getGroups()[i].value);
    }
    dataView.endUpdate();
}

function clearGrouping() {
    dataView.groupBy(null);
}

function groupByDuration() {
    dataView.groupBy(
            "duration",
                    function (g) {
                        return "Duration:  " + g.value + "  <span style='color:green'>(" + g.count + " items)</span>";
                    },
                    function (a, b) {
                        return a.value - b.value;
                    }
            );
    dataView.setAggregators([
        new Slick.Data.Aggregators.Avg("percentComplete")
    ], false);
}

function groupByDurationOrderByCount() {
    dataView.groupBy(
            "duration",
                    function (g) {
                        return "Duration:  " + g.value + "  <span style='color:green'>(" + g.count + " items)</span>";
                    },
                    function (a, b) {
                        return a.count - b.count;
                    }
            );
    dataView.setAggregators([
        new Slick.Data.Aggregators.Avg("percentComplete")
    ], false);
}

function groupByDurationOrderByCountGroupCollapsed() {
    dataView.groupBy(
            "duration",
                    function (g) {
                        return "Duration:  " + g.value + "  <span style='color:green'>(" + g.count + " items)</span>";
                    },
                    function (a, b) {
                        return a.count - b.count;
                    }
            );
    dataView.setAggregators([
        new Slick.Data.Aggregators.Avg("percentComplete")
    ], true);
}

$(".grid-header .ui-icon")
        .addClass("ui-state-default ui-corner-all")
        .mouseover(function(e) {
    $(e.target).addClass("ui-state-hover")
})
        .mouseout(function(e) {
    $(e.target).removeClass("ui-state-hover")
});

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

    grid.onClick.subscribe(function(e, args) {
        var item = this.getDataItem(args.row);
        if (item && item instanceof Slick.Group && $(e.target).hasClass("slick-group-toggle")) {
            if (item.collapsed) {
                this.getData().expandGroup(item.value);
            }
            else {
                this.getData().collapseGroup(item.value);
            }

            e.stopImmediatePropagation();
            e.preventDefault();
        }
    });

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


    var h_runfilters = null;

    // wire up the slider to apply the filter to the model
    $("#pcSlider,#pcSlider2").slider({
        "range":    "min",
        "slide":    function(event, ui) {
            Slick.GlobalEditorLock.cancelCurrentEdit();

            if (percentCompleteThreshold != ui.value) {
                window.clearTimeout(h_runfilters);
                h_runfilters = window.setTimeout(dataView.refresh, 10);
                percentCompleteThreshold = ui.value;
            }
        }
    });


    // wire up the search textbox to apply the filter to the model
    $("#txtSearch,#txtSearch2").keyup(function(e) {
        Slick.GlobalEditorLock.cancelCurrentEdit();

        // clear on Esc
        if (e.which == 27)
            this.value = "";

        searchString = this.value;
        dataView.refresh();
    });


    // initialize the model after all the events have been hooked up
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.setFilter(myFilter);
    dataView.groupBy(
            "duration",
                    function (g) {
                        return "Duration:  " + g.value + "  <span style='color:green'>(" + g.count + " items)</span>";
                    },
                    function (a, b) {
                        return a.value - b.value;
                    }
            );
    dataView.setAggregators([
        new Slick.Data.Aggregators.Avg("percentComplete")
    ], false);
    dataView.collapseGroup(0);
    dataView.endUpdate();

    $("#gridContainer").resizable();
})