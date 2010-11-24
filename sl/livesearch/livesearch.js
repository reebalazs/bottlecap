(function($) {

$.widget("bottlecap.livesearch", {

    options: {
        data: [],
        selectMenu: null
    },

    _create: function () {
        var o = this.options,
            el = this.element,
            data = o.data,
            selectMenu = o.selectMenu;

        // The drop-down menu
        selectMenu.button({
            icons: {secondary: "ui-icon-triangle-1-s"}
        }).each(function() {
            $(this).next().menu({
                select: function(event, ui) {
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

        el.autocomplete({
            delay: 0,
            source: data
        }).data('autocomplete')._renderMenu = function(ul, items) {
            var self = this,
                currentCategory = "";
            $.each(items, function (index, item) {
                if (item.category !== currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>"
                              + item.category
                              + "</li>");
                    currentCategory = item.category;
                }
                self._renderItem(ul, item);
            });
        };

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
