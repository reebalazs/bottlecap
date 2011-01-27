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

            el.text(o.message).width(o.width);
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