(function($) {

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


    $(".demo button").button({
	icons: {
	    primary: "ui-icon-home",
	    secondary: "ui-icon-triangle-1-s"
	}
    }).each(function() {
	$(this).next().menu({
	    select: function(event, ui) {
		$(this).hide();
		$("#log").append("<div>Selected " + ui.item.text() + "</div>");
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

    
});


})(jQuery);
