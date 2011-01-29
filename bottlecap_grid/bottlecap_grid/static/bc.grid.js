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
            width: 300,
            editable: true
        },

        // The constructor for our widget
        _create: function () {
            var o = this.options;
            var self = this;

            // The resource path is something like '' (empty string for root) or
            // 'subfolder1' or 'subfolder1/anotherfolder2'.  We add '/list_items'
            // onto it when asking for grid contents.  We store this as state
            // so the reload button knows where we are.
            this.resource_path = '';


            $("#bc-grid-addfolderdialog").dialog({autoOpen: false});
            $("#bc-grid-addfiledialog").dialog({autoOpen: false});

            // Setup the columns
            var checkboxSelector = new Slick.CheckboxSelectColumn({
                cssClass: "slick-cell-checkboxsel"
            });
            var checkboxColumn = checkboxSelector.getColumnDefinition();
            checkboxColumn['unselectable'] = false;

            this.columns = [
                checkboxColumn,
                {id:"type", name:"Type", field:"type", width:40, minWidth:40,
                    formatter:this.TypeFormatter,
                    sortable:true},
                {id:"title", name:"Title", field:"title", width:320, cssClass:"cell-title",
                    sortable:true, formatter:this.TitleFormatter, editor:TextCellEditor,
                    validator: this.titleValidator},
                {id:"modified", name:"Modified", field:"modified", sortable:true},
                {id:"author", name:"Author", field:"author", visible: false, sortable: true}
            ];


            self.dataView = new Slick.Data.DataView();
            self.grid = new Slick.Grid(".bc-grid-contents", self.dataView, this.columns, this.options);
            self.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
            self.grid.registerPlugin(checkboxSelector);
            this.columnpicker = new Slick.Controls.ColumnPicker(this.columns, self.grid, this.options);

            self.grid.onSort.subscribe(function(e, args) {
                sortdir = args.sortAsc ? 1 : -1;
                sortcol = args.sortCol.field;

                self.dataView.sort(comparer, args.sortAsc);
            });

            // wire up model events to drive the grid
            self.dataView.onRowCountChanged.subscribe(function(e, args) {
                self.grid.updateRowCount();
                self.grid.render();
            });

            self.dataView.onRowsChanged.subscribe(function(e, args) {
                self.grid.invalidateRows(args.rows);
                self.grid.render();
            });

            this.reload_grid();

            $("#bc-grid-addables").buttonset();
            $('#bc-grid-addfolder')
                    .button(
                {icons: {
                primary: "ui-icon-plus"
            },
                    text: true}
                    )
                    .click(function () {
                self.add_folder()
            });
            $('#bc-grid-addfile')
                    .button(
                {icons: {
                primary: "ui-icon-plus"
            },
                    text: true}
                    )
                    .click(function () {
                self.add_file();
            });
            $("#bc-grid-actions").buttonset();
            $('#bc-grid-delete')
                    .button(
                {icons: {
                primary: "ui-icon-trash"
            },
                    text: false}
                    )
                    .click(function () {
                self.delete_items()
            });
            $('#bc-grid-moveto')
                    .button(
                {icons: {
                primary: "ui-icon-circle-arrow-e"
            },
                    text: false}
                    )
                    .click(function () {
                self.moveto_items()
            });
            $('#bc-grid-reload').button({
                icons: {primary: "ui-icon-arrowrefresh-1-w", text: false}
            }).bind('click', function () {self.reload_grid()});

            // Bind any ajax forms
            $('.bc-grid-ajaxform').ajaxForm(function() {
                alert('Done');
            });

            // Handle the grid's anchors in the title column
            $(this.element).delegate(
                    ".bc-grid-titlecell", "click",
                                    function(evt) {
                                        evt.preventDefault();
                                        var href = $(evt.target).attr('href');
                                        self.load_resource(href);
                                    })

        },

        load_resource: function (href) {
            // When you click on a hyperlink in the title column, load the
            // contents for that resource and display it
            this.resource_path = href;
            this.reload_grid();
        },

        reload_grid: function () {
            // Fetch data via ajax

            var self = this;

            $.ajax({
                type: "GET",
                dataType: "json",
                url: self.resource_path + '/list_items',
                success: function (data) {
                    // initialize the model after all the events have been hooked up
                    self.dataView.beginUpdate();
                    self.dataView.setItems(data);
                    self.dataView.endUpdate();
                    self.grid.invalidate();
                },
                error: function (xhr, status, error) {
                    log(status);
                }
            });
        },

        close_all_dialogs: function () {
            $('.bc-dialog').each(function (index, value) {
                $(value).dialog('close');
            })
        },


        add_file: function () {
            // XXX Is there a better way to get to the widget instance
            // than stashing it as data on the event?
            var el = this.el;
            var self = this;

            self.close_all_dialogs();
            var ab = $('#bc-grid-addfile');
            var left = ab.position().left;
            var top = ab.position().top + ab.height();
            $("#bc-grid-addfiledialog").dialog({position: [left, top]});
            $("#bc-grid-addfiledialog").dialog("open");

            // Bind any ajax forms. TODO does this only need to be done once?
            $('.bc-grid-ajaxform').ajaxForm({
                'url': self.resource_path + '/add_file',
                'success': function (responseText, statusText, xhr, form) {
                    if (responseText == 'ok') {
                        $("#bc-grid-addfiledialog").dialog("close");
                        self.reload_grid();
                    } else {
                        form.empty().html(responseText);
                    }
                }
            });

        },

        delete_items: function () {
            var self = this;

            var row_ids = [];
            var rows = self.grid.getSelectedRows();

            // First accummulate the ids to be deleted and contact server
            for (var i = 0, l = rows.length; i < l; i++) {
                var item = self.dataView.getItem(rows[i]);
                row_ids.push(item.id);
            }
            $.ajax({
                type: "POST",
                dataType: "json",
                data: {'target_ids': row_ids},
                url: "delete_items",
                success: function (data) {
                    self.dataView.beginUpdate();
                    for (var i = 0, l = rows.length; i < l; i++) {
                        var item = self.dataView.getItem(rows[i]);
                        if (item) self.dataView.deleteItem(item.id);
                    }
                    self.grid.setSelectedRows([]);
                    self.dataView.endUpdate();
                },
                error: function (xhr, status, error) {
                    console.log(status);
                }
            });
        },

        add_folder: function () {
            this.close_all_dialogs();
            return; // For now, skip it until we figure out more
        },

        moveto_items: function () {
            log("moveto");
        },

        // Formatters and validators

        TitleFormatter: function (row, cell, value, columnDef, dataContext) {
            var href = dataContext['href'];
            return '<a class="bc-grid-titlecell" href="' + href + '">' + value + '</a>';
        },


        TypeFormatter: function (row, cell, value, columnDef, dataContext) {
            var type = dataContext['type'];
            var src = '/bccore/images/files_folder_small.png';
            return '<img src="' + src + '" height="16" width="16" alt="icon" />';
        },

        titleValidator: function (value) {
            if (value == null || value == undefined || !value.length)
                return {valid:false, msg:"This is a required field"};
            // Ping the server synchronously to change the title
            // XXX this is all wrong.  I have the resource_id hardwired.  We
            // need access to that actually-edited dataView row.  Abusing a
            // validator is the wrong approach.
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