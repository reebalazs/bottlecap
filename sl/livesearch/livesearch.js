(function($) {

$.widget("bottlecap.livesearch", {

    options: {
        url: null,
        selectMenu: null
    },

    _create: function () {
        var o = this.options,
            el = this.element,
            url = o.url,
            selectMenu = o.selectMenu;

        // store state on plugin widget itself
        this.cache = {};
        this.lastXhr = null;
        this.url = url;
        this.ajaxManager = $.manageAjax.create(
            'livesearch',
            {queue: true, cacheResponse: true}
            );

        // closure for callbacks
        // XXX consider renaming for clarity, since there are multiple selfs now
        var self = this;

        // whether we should factor stuff out to duplicate code
        //debugger;
        // The drop-down menu
        selectMenu.button({
            icons: {secondary: "ui-icon-triangle-1-s"}
        }).each(function() {
            var selectMenuButtonText = selectMenu.find('.ui-button-text');
            $(this).next().menu({
                select: function(event, ui) {
                    selectMenuButtonText.text(ui.item.text());
                    $(this).hide();
                },
                input: $(this)
            }).hide();
        }).click(function(event) {
            var menu = $(this).next();
            if (menu.is(":visible")) {
                menu.hide();
                return false;
            }
            menu.menu("deactivate").show().css({top:0, left:0}).position({
                my: "left top",
                at: "left bottom",
                of: this
            });
            $(document).one("click", function() {
                menu.hide();
            });
            return false;
        });

        this.autoCompleteWidget = el.autocomplete({
            delay: 0,
            source: jQuery.proxy(this.queryData, this),
            position: {
	        my: "right top",
	        at: "right bottom",
                of: $('.ui-ls-gobtn'),
	        collision: "none"
            },            
            select: function(event, ui) {
                // XXX this will need to change to probably use the url
                self.performSearch(ui.item.label);
            }
        });
        this.autoCompleteWidget.data('autocomplete')._renderMenu = function(ul, items) {
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
                self._renderItem(ul, item);
            });
            // Set a class on the first item, to remove a border on
            // the first row
            ul.find('li:first').addClass('ui-ls-autocomplete-first');
        };
        this.autoCompleteWidget.data('autocomplete')._renderItem = function(ul, item) {
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
        };

        // don't depend on markup?
        el.next('button').click(function() {
            self.performSearch(el.val());
            return false;
        });

        // is this the right place for the positioning code?
        // el.height(selectMenu.height()+1).focus();
        // el.position({
        //     of: selectMenu,
        //     at: "right top",
        //     my: "left top"
        // });

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

    performSearch: function(query) {
        $('<p>Search for ' + query + '</p>')
            .appendTo($(document.body));
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

})(jQuery);
