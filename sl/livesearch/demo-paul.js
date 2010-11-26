(function($) {

$(function() {

    var cache = {}, lastXhr;
    
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


    // The drop-deown menu
    $(".ui-ls-menu").button({
	icons: {
	    secondary: "ui-icon-triangle-1-s"
	}
    }).each(function() {
        var btn_text = $(this).find('.ui-button-text');
	$(this).next().menu({
	    select: function(event, ui) {
                btn_text.text(ui.item.text());
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

    
    // The autocomplete widget
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function(ul, items) {
            var self = this,
                currentCategory = "";            
            $.each(items, function (index, item) {
                // Change autocomplete behavior which overrides the
                // searchterm
                item.value = self.term;
                if (item.category !== currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>"
                              + item.category
                              + "</li>");
                    currentCategory = item.category;
                }
                self._renderItem(ul, item);
            });
        },

	_renderItem: function( ul, item) {
		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append( $( "<a></a>" ).text( item.label ) )
			.appendTo( ul );
	}
        
    });
    $(".ui-ls-autocomplete").catcomplete({
        delay: 0,
        source: function (request, response) {
            var url = 'demo-paul-data.json';
            var term = request.term;

            if ( term in cache ) {
                console.log('cache hit');
		response( cache[ term ] );
		return;
	    }

	    lastXhr = $.getJSON( url, request, function( data, status, xhr ) {
		cache[ term ] = data;
		if ( xhr === lastXhr ) {
		    response( data );
		}
            });
            
        }

    });
    $(".ui-ls-autocomplete").bind('autocompleteselect', function (evt, ui) {
            console.log(9393);
    });

    // The magnifying glass button on the right
    $(".ui-ls-gobtn").button({
        text: false,
	icons: {
	    primary: "ui-icon-search"
        }
    });

    // Dynamically set some positioning
    $('.ui-ls-autocomplete').height($('.ui-ls-menu').height()-2);
    $('.ui-ls-autocomplete').position({
        of: $('.ui-ls-menu'),
        at: "left top",
        my: "right top"
    });
});


})(jQuery);
