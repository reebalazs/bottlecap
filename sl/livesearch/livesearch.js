(function($) {

$.widget("bottlecap.livesearch", {

    options: {
        // function to call for ajax url request
        // scope is set to this widget
        urlfn: null,
        // function to call to render items from ajax request
        renderCompletions: null,
        // to transform the query before the ajax call
        queryTransformFn: null,
        cookieName: 'bottlecap.livesearch.searchType'
    },

    _create: function () {
        var el = this.element,
             o = this.options;

        // store state on plugin widget itself
        this.urlfn = o.urlfn;
        this.transformQuery = (o.queryTransformFn ||
                               function(query) { return query; });
        this.ajaxManager = $.manageAjax.create(
            'livesearch',
            {queue: true, cacheResponse: true}
        );
        this.cookieName = o.cookieName;
        this.cookieValue = $.cookie(o.cookieName);

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
            delay: 300,
            minLength: 3,
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
        if (typeof o.renderCompletions === 'function') {
            this.autoCompleteWidget._renderMenu = o.renderCompletions;
        }

        // search handlers
        // this one is if somebody clicks on the search icon
        this.searchButton.click($.proxy(this.searchButtonClicked, this));
        // this one is if somebody hits the enter key on the keyboard
        el.bind('keydown.autocomplete', $.proxy(this.keyPressed, this));

        // if the cookie exists, we need to select the appropriate
        // category in the context menu
        if (this.cookieValue) {
            var searchType = this.cookieValue;
            var liNodes = this.selectList.find('li');
            var liArray = $.makeArray(liNodes);
            for (var i = 0; i < liArray.length; i++) {
                var li = $(liArray[i]);
                if (li.text() === searchType) {
                    var dontSaveCookie = true;
                    this.menuSelected(0, {item: li}, dontSaveCookie);
                    break;
                }
            }
        }

    },

    // called when a particular category menu item is selected from the ul
    menuSelected: function(event, ui, dontSaveCookie) {
        var item = ui.item,
            text = item.text();

        this.selectButtonText.text(text);

        // store the selection in the cookie this function is also
        // called initially to populate the right selection so we
        // don't want to resave the cookie at that point
        if (!dontSaveCookie) {
            this.cookieValue = text;
            $.cookie(this.cookieName, this.cookieValue);
        }

        this._trigger('menu', 0, {
            item: item,
            text: text
        });

        // when the menu changes, we should also trigger a search
        var searchText = this.element.val();
        if (searchText) {
            // this should trigger the entire search, beginning with
            // the ajax query
            this.autoCompleteWidget.search();
            // focus the element to rely on the widget's blur handler
            // to fix menus and interaction properly
            this.element.focus();
        }
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
        var item = ui.item;
        if (this._trigger('complete', 0, {item: item}) !== false) {
            this.performSearch(item.label);
        }
    },

    // add a * for globbing to the query where the cursor is
    globQueryTransform: function(query) {
        var caretPosition = this.element.caret().start,
            length = query.length;

        // go to the end of the current word
        for (var pos = caretPosition; pos < length; pos++) {
            if (query.charAt(pos) === " ") {
                break;
            }
        }
        // but also make sure that we are not right after some whitespace
        while (pos >= 0) {
            if (query.charAt(pos-1) !== " ") {
                break;
            }
            pos--;
        }
        query = query.substring(0, pos) + "*" + query.substring(pos);
        // trim and normalize spaces
        query = $.trim(query);
        query = query.replace(/\s+/, ' ');
        return query;
    },

    queryData: function(request, response) {
        var term = request.term,
            query = this.transformQuery(term),
            url = this.urlfn.call(this, query),
            contextmenu = this.selectList;

        $.manageAjax.add(
            'livesearch',
            {url: url,
             dataType: 'json',
             maxRequests: 1,
             queue: 'clear',
             abortOld: true,
             success: function(data) {
                 // ensure that the context menu isn't displayed when
                 // showing completion results
                 contextmenu.hide();
                 response(data);
             },
             error: function (xhr, status, exc) {
                 if (console && console.log) {
                     console.log(status);
                 }
             }
        });
    },

    searchButtonClicked: function() {
        var val = this.transformQuery(this.element.val());
        this.performSearch(val);
        return false;
    },

    keyPressed: function(e) {
        // In the case when an element is highlighted in the
        // suggestion dropdown and enter is pressed, this event gets
        // fired as well, but after the auto complete handler. If that
        // handler is called, it prevents the default action, in which
        // case we want to ignore our search handler.
        if (!e.isDefaultPrevented() &&
            (e.keyCode === $.ui.keyCode.ENTER ||
             e.keyCode === $.ui.keyCode.NUMPAD_ENTER)) {
            // close the selections first if necessary
            this.autoCompleteWidget.close();

            var val = this.transformQuery(this.element.val());
            this.performSearch(val);
            return false;
        }
        return true;
    },

    performSearch: function(query) {
        this._trigger('search', 0, {query: query});
    },

    _setOption: function(key, value) {
        if (key === 'urlfn') {
            this.urlfn = value;
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
