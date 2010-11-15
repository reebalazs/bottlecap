$(function() {

    var data = [
        { label: "anders", category: "" },
        { label: "andreas", category: "" },
        { label: "antal", category: "" },
        { label: "annhhx10", category: "Products" },
        { label: "annk K12", category: "Products" },
        { label: "annttop C13", category: "Products" },
        { label: "anders andersson", category: "People" },
        { label: "andreas andersson", category: "People" },
        { label: "andreas johnson", category: "People" }
    ];

    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function(ul, items) {
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
        }
    });


    $("#search").catcomplete({
        delay: 0,
        source: data
    });


    $('select#speedD').selectmenu({
        style: 'dropdown',
        menuWidth: 400,
        format: addressFormatting
    });

});

//a custom format option callback
var addressFormatting = function(text) {
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
};
