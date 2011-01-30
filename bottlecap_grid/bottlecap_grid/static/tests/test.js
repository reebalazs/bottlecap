
(function($, undefined){

function log() {
    if (window.console && console.log) {
        console.log(Array.prototype.slice.call(arguments));
    }
}

module("bc.grid", {

    setup: function() {

        // Create a mock server for testing ajax.
        this.server = new MoreMockHttpServer(this.handle_ajax);

        // Start the server
        this.server.start();

    },

    teardown: function() {

        // Stop the server
        this.server.stop();
        
        // make sure to kill a stale popup / overlay
        // this is needed because the test separation
        // only resets inside #main, by default
        var killfromhere = function(me) {
            if (me.length > 0) {
                var next = me.next();
                me.remove();
                killfromhere(next);
            }
        };
        killfromhere($('#main').next())

    },

    _create_grid: function() {
        var grid = $('.bc-grid-frame')
            .grid({
	        message: 'Howdy World',
	        width: 100
	    });
        return grid;
    },


    //
    // Mock http response can be produced here.
    //
    handle_ajax: function(request, server_state) {
        if (server_state == 'ERROR') {
            // simulate an error
            request.receive(500, 'Error');
        } else if (request.urlParts.file == 'list_items') {
            request.setResponseHeader("Content-Type", "application/json; charset=UTF-8");
            if (server_state == 0) {
                // Example 1
                var data = [];
                for (var i=0; i<40; i++) {
                    data.push({
                        "author": "repaul",
                        "title": "foo" + i,
                        "modified": "2011-01-28",
                        "href": "http://127.0.0.1:6543/foo" + i + "/",
                        "type": "folder",
                        "id": "foo" + i
                    });
                }
                request.receive(200, JSON.stringify(data));
            }
        } else {
            request.receive(404, 'Not Found in Mock Server');
        }
    }

});


test("Create", function() {

    var grid = $('.bc-grid-frame')
        .grid({
	    message: 'Howdy World',
                width: 100
	});

});

test("Initial loading", function() {

    var grid = this._create_grid();

    equals(grid.data('grid').dataView.getLength(), 0);

    grid.grid('reload_grid');
    
    equals(grid.data('grid').dataView.getLength(), 40);

    // reload again, should be no difference
    grid.grid('reload_grid');

    equals(grid.data('grid').dataView.getLength(), 40);

}),

test("File dialog open", function() {

    var grid = this._create_grid();

    equals($('#bc-grid-addfiledialog').is(':visible'), false);

    // click on the file button
    $('button#bc-grid-addfile').simulate('click');

    equals($('#bc-grid-addfiledialog').is(':visible'), true);

    // click on the cancel dialog button
    $('#ui-dialog-title-bc-grid-addfiledialog').parent().find('.ui-dialog-titlebar-close').simulate('click');

    equals($('#bc-grid-addfiledialog').is(':visible'), false);

    // bring it up again, and click without closing
    $('button#bc-grid-addfile').simulate('click');

    equals($('#bc-grid-addfiledialog').is(':visible'), true);

    $('button#bc-grid-addfile').simulate('click');

    equals($('#bc-grid-addfiledialog').is(':visible'), true);
    // XXX we should check for positioning, and also that all other dialogs are closed.

});

})(jQuery);
