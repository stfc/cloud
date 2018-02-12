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
        exceptions("403");
    });
});

// Messages
function notes() {
    $('#site-messages').load('/assets/dynamic/messages.html');
}
notes();

function close_alert(id) {
    Cookies.set(id + '-msg', 'hidden', {expires : 1, path : '/'});
}
function note_all(id, type, title, body) {
    if (!Cookies.get(id + '-msg')) {
        output = '<div id="' + id + '" class="alert alert-' + type + ' alert-dismissible global-alert" role="alert">';
        output += '<h4>' + title;
        output += '<button onClick="close_alert(' + id + ')" type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span><span class="text"> Dismiss</span></button></h4>';
        output += '<p>' + body + '</p><span class="signature">~ The Cloud Team</span><br>';
        output += '</div></div>';
        $('#site-messages').append(output);
    }
}
function note_members(id, type, title, body) {
    if (Cookies.get('name') && !Cookies.get(id + '-msg')) {
        output = '<div id="' + id + '" class="alert alert-' + type + ' alert-dismissible global-alert" role="alert">';
        output += '<h4>' + title;
        output += '<button onClick="close_alert(' + id + ')" type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span><span class="text"> Dismiss</span></button></h4>';
        output += '<p>' + body + '</p><span class="signature">~ The Cloud Team</span><br>';
        output += '</div></div>';
        $('#site-messages').append(output);
    }
}

function exceptions(error_number) {
    if (error_number == "403") {
        Cookies.remove('session', {path : '/'});
        Cookies.remove('name', {path : '/'});
        Cookies.remove('fedid', {path : '/'});
        window.location.replace("/login");
    }
}
