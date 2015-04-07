/*
 * Select whether to show the login or logout menu item
 * depending on if the session cookie is set.
 */
$(function() {
    if ($.cookie('session') == undefined || $.cookie('session') == "") {
        $("#logintoolbar").show();
        $("#logouttoolbar").hide();
    } else {
        $("#user").html($.cookie('name'));
        $("#logouttoolbar").show();
        $("#logintoolbar").hide();
    }

    $('#logout').click(function() {
        $.removeCookie('session', {path : '/'});
        $.removeCookie('name', {path : '/'});
        $.removeCookie('fedid', {path : '/'});
        window.location.replace("/");
    });
});