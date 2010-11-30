(function($) {

$(function() {

    $('.ui-ls-autocomplete').livesearch({
        url: 'demo-paul-data.json',
        selectMenu: $('.ui-ls-menu')
    });

    // The magnifying glass button on the right
    $(".ui-ls-gobtn").button({
        text: false,
        icons: {primary: "ui-icon-search"}
    });

    // XXX should this be in the livesearch widget itself?
    // Dynamically set some positioning
    $('.ui-ls-autocomplete')
        .height($('.ui-ls-menu').height()+1)
        .focus();
    $('.ui-ls-autocomplete').position({
        of: $('.ui-ls-menu'),
        at: "right top",
        my: "left top"
    });
});

})(jQuery);
