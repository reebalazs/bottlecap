(function($) {

$.widget("bottlecap.livesearch", {

    options: {
        // url for ajax request
        url: null,
        // function to call to render items from ajax request
        renderCompletions: defaultRenderCompletions
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
            select: jQuery.proxy(this.menuSelected, this),
            input: this.selectList
        }).hide();
        this.selectButton.click(jQuery.proxy(this.selectButtonClicked, this));
        this.selectList.click(jQuery.proxy(this.selectButtonClicked, this));

        // set up auto complete behavior
        this.autoCompleteWidget = el.autocomplete({
            delay: 0,
            source: jQuery.proxy(this.queryData, this),
            position: {
                my: "right top",
                at: "right bottom",
                of: this.searchButton,
                collision: "none"
            },
            select: jQuery.proxy(this.completionSelected, this)
        });

        // plug in rendering function when results come in
        this.autoCompleteWidget.data('autocomplete')._renderMenu = this.options.renderCompletions;

        this.searchButton.click(jQuery.proxy(this.searchButtonClicked, this));
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
             error: function (xhr, status, exc) { console.log(status); },
        });
    },

    searchButtonClicked: function() {
        this.performSearch(this.element.val());
        return false;
    },

    performSearch: function(query) {
        this._trigger('search', 0, {query: query});
    }
});

function addressFormatting(text) {
    var newText = text;
    //array of find replaces
    var findreps = [
        {find:/^([^\-]+) \- /g, rep: '<span class="ui-selectmenu-item-header">$1</span>'},
        {find:/([^\|><]+) \| /g, rep: '<span class="ui-selectmenu-item-content">$1</span>'},
        {find:/([^\|><\(\)]+) (\()/g, rep: '<span class="ui-selectmenu-item-content">$1</span>$2'},
        {find:/([^\|><\(\)]+)$/g, rep: '<span class="ui-selectmenu-item-content">$1</span>'},
        {find:/(\([^\|><]+\))$/g, rep: '<span class="ui-selectmenu-item-footer">$1</span>'}
    ];

    for (var i in findreps) {
        newText = newText.replace(findreps[i].find, findreps[i].rep);
    }
    return newText;
}

function defaultRenderCompletions(ul, items) {
    var self = this,
        currentCategory = "";
    $.each(items, function(index, item) {
        // Change autocomplete behavior which overrides the
        // searchterm
        item.data_value = item.value;
        item.value = self.term;
         if (item.category !== currentCategory) {
            var li = $('<li class="ui-autocomplete-category"></li>');
            li.append(
                $('<span class="ui-ls-category-text"></span>')
                    .text(item.category)
            );
            li.append(
                $('<span class="ui-ls-more"></span>')
                    .attr('href', '/search/more')
                    .text('more')
                    .click((function(category) {
                        return function() {
                            $('<p>More link clicked for '
                              + category + '</p>')
                                .appendTo($(document.body));
                            return false;
                        };
                    })(item.category))
            );
            ul.append(li);
            currentCategory = item.category;
        }
        defaultRenderItem(ul, item);
    });
    // Set a class on the first item, to remove a border on
    // the first row
    ul.find('li:first').addClass('ui-ls-autocomplete-first');
}

function defaultRenderItem(ul, item) {
    var li = $('<li>');
    var entry, div;
     // Render different items in different ways
    switch (item.type) {
        case 'profile': {
            entry = $('<a class="ui-ls-profile"></a>');
            entry.append($('<img>').attr('src', item.icon));
            div = entry.append($('<div>'));
            div.append(
                $('<span class="ui-ls-profilelabel"></span>')
                    .text(item.label)
            );
            div.append($('<span>')
                       .text(item.extension));
            entry.append($('<div>').text(item.department));
            break;
        };
         default: {
            entry = $( "<a></a>" ).text( item.label );
        };
    };
    return $( "<li></li>" )
        .data( "item.autocomplete", item )
        .append( entry )
        .appendTo( ul );
}

})(jQuery);
