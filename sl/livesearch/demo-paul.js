(function($) {

$(function() {

    var cache = {}, lastXhr;
    var ajm = $.manageAjax.create('livesearch',
                                  { queue: true, cacheResponse: true }
                                 );
    
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
                item.data_value = item.value;
                item.value = self.term;
                
                if (item.category !== currentCategory) {
                    var li = $('<li class="ui-autocomplete-category"></li>');
                    li.append(
                        $('<span>')
                            .text(item.category)
                        .css('display', 'inline-block')
                        .width(300)
                        );
                    li.append(
                        $('<span class="ls-more"></span>')
                            .css('color', 'silver')
                            .attr('href', '/search/more')
                            .text('more')
                        .bind('click', function (evt, ui) {
                            alert('clicked');
                        })
                    );
                    ul.append(li);
                    currentCategory = item.category;
                }
                self._renderItem(ul, item);
            });
        },

	_renderItem: function( ul, item) {

            var li = $('<li>');
            var entry, div;

            // Render different items in different ways
            switch (item.type) {
                case 'profile': {
                    entry = $('<a class="ls-profile"></a>');
                    entry.append($('<img>').attr('src', item.icon));
                    div = entry.append($('<div>'));
                    div.append(
                        $('<span>')
                            .text(item.label)
                            .css('display', 'inline-block')
                            .width(250));
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
        
    });
    $(".ui-ls-autocomplete").catcomplete({
        delay: 0,
        position: {
	    my: "right top",
	    at: "right bottom",
            of: $('.ui-ls-gobtn'),
	    collision: "none"
        },            
        source: function (request, response) {
            var url = 'demo-paul-data.json';
            var term = request.term;

            $.manageAjax.add(
                'livesearch',
                {
                    url: url,
                    maxRequests: 1,
                    queue: 'clear',
                    abortOld: true,
                    success: function(data) {
                        response(data);
                    },
                    error: function (xhr, status, exc) {
                        console.log(status);
                    }
                });            
            
            return;
            
            if ( term in cache ) {
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
    

    // The magnifying glass button on the right
    $(".ui-ls-gobtn").button({
        text: false,
	icons: {
	    primary: "ui-icon-search"
        }
    });

    // Dynamically set some positioning
    $('.ui-ls-autocomplete')
        .css('border', 'solid 1px lightgray')
        .height($('.ui-ls-menu').height()+1)
        .focus();
    $('.ui-ls-autocomplete').position({
        of: $('.ui-ls-menu'),
        at: "right top",
        my: "left top"
    });
});


})(jQuery);
