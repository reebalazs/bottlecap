(function($) {

$.widget("bottlecap.livesearch", {

    options: {
        // url for ajax request
        url: null,
        // function to call to render items from ajax request
        renderCompletions: null
    },

    _create: function () {
        var el = this.element,
            url = this.options.url;

        // store state on plugin widget itself
        this.cache = {};
        this.lastXhr = null;
        this.url = url;
        this.ajaxManager = $.manageAjax.create(
            'livesearch',
            {queue: true, cacheResponse: true}
        );

        // store references to elements
        this.selectList = el.prev('ul');
        this.selectButton = this.selectList.prev('button');
        this.searchButton = el.next('button.ui-ls-gobtn');

        // set up select button behavior
        this.selectButton.button({
            icons: {secondary: "ui-icon-triangle-1-s"}
        });
        this.selectButtonText = this.selectButton.find('.ui-button-text');
        this.selectList.menu({
            select: $.proxy(this.menuSelected, this),
            input: this.selectList
        }).hide();
        this.selectButton.click($.proxy(this.selectButtonClicked, this));
        this.selectList.click($.proxy(this.selectButtonClicked, this));

        // set up auto complete behavior
        el.autocomplete({
            delay: 0,
            source: $.proxy(this.queryData, this),
            position: {
                my: "right top",
                at: "right bottom",
                of: this.searchButton,
                collision: "none"
            },
            select: $.proxy(this.completionSelected, this)
        });
        this.autoCompleteWidget = el.data('autocomplete');

        // plug in rendering function when results come in
        // first save the default
        this._defaultRenderCompletions = this.autoCompleteWidget._renderMenu;
        if (typeof this.options.renderCompletions === 'function') {
            this.autoCompleteWidget._renderMenu = this.options.renderCompletions;
        }

        this.searchButton.click($.proxy(this.searchButtonClicked, this));
    },

    // called when a particular category menu item is selected from the ul
    menuSelected: function(event, ui) {
        var item = ui.item,
            text = item.text();
        this.selectButtonText.text(text);
        this._trigger('menu', 0, {
            item: item,
            text: text
        });
    },

    selectButtonClicked: function() {
        var menu = this.selectList;
        if (menu.is(":visible")) {
            menu.hide();
            return false;
        }
        menu.menu("deactivate").show().css({top:0, left:0}).position({
            my: "left top",
            at: "left bottom",
            of: this.selectButton
        });
        $(document).one("click", function() {
            menu.hide();
        });
        return false;
    },

    completionSelected: function(event, ui) {
        // XXX this will need to change to probably use the url
        var item = ui.item;
        if (this._trigger('complete', 0, {item: item}) !== false) {
            this.performSearch(item.label);
        }
    },

    queryData: function(request, response) {
        var term = request.term;

        // using the ajax manager reference doesn't work :(
//        this.ajaxManager.add(
        $.manageAjax.add(
            'livesearch',
            {url: this.url,
             dataType: 'json',
             maxRequests: 1,
             queue: 'clear',
             abortOld: true,
             success: function(data) { response(data); },
             error: function (xhr, status, exc) { console.log(status); }
        });
    },

    searchButtonClicked: function() {
        this.performSearch(this.element.val());
        return false;
    },

    performSearch: function(query) {
        this._trigger('search', 0, {query: query});
    },

    _setOption: function(key, value) {
        if (key === 'url') {
            this.url = value;
        } else if (key === 'renderCompletions') {
            if (typeof value === 'function') {
                this.autoCompleteWidget._renderMenu = value;
            } else if (value === 'default') {
                this.autoCompleteWidget._renderMenu = this._defaultRenderCompletions;
            }
        }
    }

});

})(jQuery);
