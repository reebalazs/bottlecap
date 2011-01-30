

(function($, undefined) {

    function log() {
        if (window.console && console.log) {
            console.log(Array.prototype.slice.call(arguments));
        }
    }

    function comparer(a, b) {
        var x = a[sortcol], y = b[sortcol];
        return (x == y ? 0 : (x > y ? 1 : -1));
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
            this.update_resource_path('');

            this._create_dialogs();
            this._create_columns();
            this._create_grid();
            this._create_buttons();
            this._create_forms();

        },

        _create_dialogs: function() {
            var self = this;
        
            this.dialogAddFolder =
                $("#bc-grid-addfolderdialog").dialog({
                    autoOpen: false
                });
            this.dialogAddFile =
                $("#bc-grid-addfiledialog").dialog({
                    autoOpen: false
                });

        },

        _create_columns: function() {
            var self = this;
        
            // Setup the columns
            this.checkboxSelector = new Slick.CheckboxSelectColumn({
                cssClass: "slick-cell-checkboxsel"
            });
            this.checkboxColumn = this.checkboxSelector.getColumnDefinition();
            this.checkboxColumn['unselectable'] = false;

            this.columns = [
                this.checkboxColumn,
                {id:"type", name:"Type", field:"type", width:40, minWidth:40,
                    formatter:this.TypeFormatter,
                    sortable:true},
                {id:"title", name:"Title", field:"title", width:320, cssClass:"cell-title",
                    sortable:true, formatter:this.TitleFormatter, editor:TextCellEditor,
                    validator: this.titleValidator},
                {id:"modified", name:"Modified", field:"modified", sortable:true},
                {id:"author", name:"Author", field:"author", visible: false, sortable: true}
            ];

        },

        _create_grid: function() {
            var self = this;

            this.dataView = new Slick.Data.DataView();
            this.grid = new Slick.Grid(".bc-grid-contents", self.dataView, this.columns, this.options);
            this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
            this.grid.registerPlugin(this.checkboxSelector);
            this.columnpicker = new Slick.Controls.ColumnPicker(this.columns, self.grid, this.options);

            this.grid.onSort.subscribe(function(e, args) {
                sortdir = args.sortAsc ? 1 : -1;
                sortcol = args.sortCol.field;

                self.dataView.sort(comparer, args.sortAsc);
            });

            // wire up model events to drive the grid
            this.dataView.onRowCountChanged.subscribe(function(e, args) {
                self.grid.updateRowCount();
                self.grid.render();
            });

            this.dataView.onRowsChanged.subscribe(function(e, args) {
                self.grid.invalidateRows(args.rows);
                self.grid.render();
            });

            // Handle the grid's anchors in the title column
            $(this.element).delegate(
                    ".bc-grid-titlecell", "click",
                                    function(evt) {
                                        evt.preventDefault();
                                        // Update title in header
                                        var tgt = $(evt.target);
                                        $('#bc-grid-currenttitle').text(tgt.text());

                                        var href = tgt.attr('href');
                                        self.load_resource(href);
                                    })

            /// XXX We do not load the grid content here.
            /// reload_grid has to be called once, after binding the widget.

        },

        _create_buttons: function() {
            var self = this;

            this.buttonGotoParent =
                $("#bc-grid-gotoparent").button({
                    icons: {
                        primary: "ui-icon-arrowthick-1-nw"
                    },
                    text: true
                })
                .click(function () {
                    // Set current title, remove last hop in current
                    // URL, and load parent
                    // TODO fix the protocol to send back the current title
                    // in the data.  Until then, this won't work.
                    var p = self.resource_path.split('/');
                    var href = p.slice(0, p.length - 1).join('/');
                    self.load_resource(href)
                });

            this.buttonsetAddables = $("#bc-grid-addables").buttonset();
            this.buttonAddFolder =
                $('#bc-grid-addfolder').button({
                    icons: {
                        primary: "ui-icon-plus"
                    },
                    text: true
                })
                .click(function () {
                    self.add_folder()
                });
            this.buttonAddFile =
                $('#bc-grid-addfile').button({
                    icons: {
                        primary: "ui-icon-plus"
                    },
                    text: true
                })
                .click(function () {
                    self.add_file();
                });

            this.buttonsetActions = $("#bc-grid-actions").buttonset();
            this.buttonDelete = 
                $('#bc-grid-delete').button({
                    icons: {
                        primary: "ui-icon-trash"
                    },
                    text: false
                })
                .click(function () {
                    self.delete_items()
                });
            this.buttonMoveTo =
                $('#bc-grid-moveto').button({
                    icons: {
                        primary: "ui-icon-circle-arrow-e"
                    },
                    text: false
                })
                .click(function () {
                    self.moveto_items()
                });
            this.buttonReload =
                $('#bc-grid-reload').button({
                    icons: {
                        primary: "ui-icon-arrowrefresh-1-w",
                        text: false
                    }
                })
                .click(function () {
                    self.reload_grid()
                });

        },

        _create_forms: function() {
            var self = this;
        
            // XXX ajaxForm is unable to update its url option. So,
            // we have to rebind it again and again and again
            // from update_resource_path.

            // Bind any ajax forms
            //this.ajaxForm =
            //    $('.bc-grid-ajaxform').ajaxForm({
            //        // url will be set dynamically
            //        'success': function (responseText, statusText, xhr, form) {
            //            if (responseText == 'ok') {
            //                self.dialogAddFile.dialog('close');
            //                self.reload_grid();
            //            } else {
            //                form.empty().html(responseText);
            //            }
            //        }
            //    });

        },

        update_resource_path: function(url) {
            var self = this;
        
            // XXX ajaxForm is unable to update its url option. So,
            // we have to rebind it again and again and again
            //
            // this.ajaxForm('option', 'url', this.resource_path + '/add_file');

            this.resource_path = url;

            // Bind any ajax forms
            this.ajaxForm =
                $('.bc-grid-ajaxform').ajaxForm({
                    // url will be set dynamically
                    url:  this.resource_path + '/add_file',
                    'success': function (responseText, statusText, xhr, form) {
                        if (responseText == 'ok') {
                            self.dialogAddFile.dialog('close');
                            self.reload_grid();
                        } else {
                            form.empty().html(responseText);
                        }
                    }
                });

        },


        load_resource: function (href) {
            // When you click on a hyperlink in the title column, load the
            // contents for that resource and display it

            // Isf the href has a slash at the end, remove it.  We need
            // some kind of normalization system.
            if (href[href.length - 1] == '/') {
                href = href.slice(0, href.length - 1);
            }
            this.update_resource_path(href);
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
                    log('ERROR in reload_grid', status);
                }
            });
        },

        close_all_dialogs: function () {
            $('.bc-dialog').dialog('close');
        },

        add_file: function () {
            var self = this;

            this.close_all_dialogs();
            var ab = this.buttonAddFile;
            var p_left = ab.position().left;
            var p_top = ab.position().top + ab.height();
            this.dialogAddFile
                .dialog('option', 'position', [p_left, p_top])
                .dialog('open');

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
                data: {
                    'target_ids': row_ids
                },
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
                data: {
                    resource_id: 'id001',
                    value: value
                },
                url: "change_title",
                async: false,
                success: function (data) {
                    //
                },
                error: function () {
                    return {
                        valid: false,
                        msg: "Server failed"
                    };
                }
            })
            return {
                valid: true,
                msg: null
            };
        },

        _setOption: function (key, value) {
            // Handle post-init setting of an option via
            // $(sel).grid("option", "key", "value)

            var el = this.element;
            if (key == 'message') {
                el.text(value);
            } else if (key == 'width') {
                el.width(value);
            }
            
            $.Widget.prototype._setOption.call( this, key, value );
        }

    });

})(jQuery);
