/*
 * Select whether to show the login or logout menu item
 * depending on if the session cookie is set.
 */
$(function() {
    if (Cookies.get('session') === undefined || Cookies.get('session') === "") {
        $(".logintoolbar").show();
        $(".logouttoolbar").hide();
    } else {
        $("#user").html(Cookies.get('name'));
        $(".logouttoolbar").show();
        $(".logintoolbar").hide();
    }

    $('#logout').click(function() {
        Cookies.remove('session', {path : '/'});
        Cookies.remove('name', {path : '/'});
        Cookies.remove('fedid', {path : '/'});
        window.location.replace("/");
    });
});
