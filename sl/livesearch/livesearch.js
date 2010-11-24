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

        el.autocomplete({
            delay: 0,
            source: o.data
        });

        selectMenu.selectmenu({
            style: 'dropdown',
            menuWidth: 400,
            format: addressFormatting
        });

        // isn't being called now
        /*
        el._renderMenu = function(ul, items) {
            var self = this,
                currentCategory = "";
            $.each(items, function(index, item) {
                if (item.category !== currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>"
                              + item.category
                              + "</li>");
                    currentCategory = item.category;
                }
                self._renderItem(ul, item);
            });
        }
        */
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

    // leave out rounded corners for now
    // $('.ui-selectmenu-status').corner();
}

})(jQuery);
