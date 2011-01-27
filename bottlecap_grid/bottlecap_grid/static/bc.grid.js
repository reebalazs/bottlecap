var dataView;
var grid;
var data = [];
var columns = [];
var columnpicker;
var resource_id = 'root';

var options = {
    editable: true
};

var sortcol = "title";
var sortdir = 1;

function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
}

(function($, undefined) {

    function log() {
        if (window.console && console.log) {
            console.log(Array.prototype.slice.call(arguments));
        }
    }

    // Register a "namespaced" widget with the widget factory
    $.widget("bc.grid", {

        // Configuration knobs on our widget
        options: {
            message: 'Hello, World!',
            width: 300
        },

        // The constructor for our widget
        _create: function () {
            // Note that "this" is a different "this"!!  In jQuery,
            // "this" is a wrapped jQuery object.  Inside jQuery
            // UI methods, "this" is the widget instance.
            var o = this.options;
            var el = this.element;    // Grabs the jQuery object


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

            function TypeFormatter(row, cell, value, columnDef, dataContext) {
                var type = dataContext['type'];
                var src = '/bcgstatic/images/files_folder_small.png';
                return '<img src="' + src + '" height="16" width="16" alt="icon" />';
            }

            function titleValidator(value) {
                if (value == null || value == undefined || !value.length)
                    return {valid:false, msg:"This is a required field"};
                // Ping the server synchronously to change the title
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    data: {resource_id: 'id001', value: value},
                    url: "change_title",
                    async: false,
                    success: function (data) {
                        //
                    },
                    error: function () {
                        return {valid:false, msg:"Server failed"};
                    }
                })
                return {valid:true, msg:null};
            }

            columns = [
                checkboxColumn,
                {id:"type", name:"Type", field:"type", width:40, minWidth:40, formatter:TypeFormatter,
                    sortable:true},
                {id:"title", name:"Title", field:"title", width:320, cssClass:"cell-title",
                    sortable:true, formatter:TitleFormatter, editor:TextCellEditor,
                    validator: titleValidator},
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

            function reload_grid() {
                // Fetch data via ajax
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: "list_items?resource_id=" + resource_id,
                    success: function (data) {
                        // initialize the model after all the events have been hooked up
                        dataView.beginUpdate();
                        dataView.setItems(data);
                        dataView.endUpdate();
                        grid.invalidate();
                        //console.log(data);
                    },
                    error: function (xhr, status, error) {
                        console.log(status);
                    }
                });
            }

            reload_grid();

            // Custom
            function close_all_dialogs() {
                $('.bc-dialog').each(function (index, value) {
                    $(value).dialog('close');
                })
            }

            function add_folder() {
                close_all_dialogs();
                var ab = $('#bc-grid-addfolder');
                var left = ab.position().left;
                var top = ab.position().top + ab.height();
                $("#bc-grid-addfolderdialog").dialog({position: [left, top]});
                $("#bc-grid-addfolderdialog").dialog("open");
                $("#modalIframeId").attr("src", "/static/bc.grid/form1.html");
                return false;
            }

            function add_file() {
                close_all_dialogs();
                var ab = $('#bc-grid-addfile');
                var left = ab.position().left;
                var top = ab.position().top + ab.height();
                $("#bc-grid-addfiledialog").dialog({position: [left, top]});
                $("#bc-grid-addfiledialog").dialog("open");

                // Bind any ajax forms. TODO does this only need to be done once?
                $('.bc-grid-ajaxform').ajaxForm({
                    'success': function (responseText, statusText, xhr, form) {
                        if (responseText == 'ok') {
                            $("#bc-grid-addfiledialog").dialog("close");
                            reload_grid();
                        } else {
                            form.empty().html(responseText);
                        }
                    }
                });

            }

            function delete_items() {
                var row_ids = [];
                var rows = grid.getSelectedRows();

                // First accummulate the ids to be deleted and contact server
                for (var i = 0, l = rows.length; i < l; i++) {
                    var item = dataView.getItem(rows[i]);
                    row_ids.push(item.id);
                }
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    data: {'target_ids': row_ids},
                    url: "delete_items?resource_id=" + resource_id,
                    success: function (data) {
                        dataView.beginUpdate();
                        for (var i = 0, l = rows.length; i < l; i++) {
                            var item = dataView.getItem(rows[i]);
                            if (item) dataView.deleteItem(item.id);
                        }
                        grid.setSelectedRows([]);
                        dataView.endUpdate();
                    },
                    error: function (xhr, status, error) {
                        console.log(status);
                    }
                });
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
            $('#bc-grid-reload').button({
                icons: {primary: "ui-icon-arrowrefresh-1-w", text: false}
            }).bind('click', reload_grid)

            // Bind any ajax forms
            $('.bc-grid-ajaxform').ajaxForm(function() {
                alert('Done');
            });





        },

        _setOption: function (key, value) {
            // Handle post-init setting of an option via
            // $(sel).helloworld("option", "key", "value)

            var el = this.element;
            if (key == 'message') {
                el.text(value);
            } else if (key == 'width') {
                el.width(value);
            }

        }

    });

})(jQuery);