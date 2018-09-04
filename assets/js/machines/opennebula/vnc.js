"use strict";

function vncdialog(token, name)
{
    vncconnect(token);
    $("#vnc-title").html(name);
    $('#vncdialog').modal('show');
}

$('#vncdialog').on('hide.bs.modal', function (e) {
    vncdisconnect();
});

var rfb;

Util.load_scripts(["webutil.js", "base64.js", "websock.js", "des.js",
                   "keysymdef.js", "keyboard.js", "input.js", "display.js",
                   "jsunzip.js", "rfb.js", "keysym.js"]);


function vncconnect(token)
{
    rfb = new RFB({'target': $D('noVNC_canvas'),
                   'encrypt': true,
                   'repeaterID': '',
                   'true_color': true,
                   'local_cursor': true,
                   'shared': true,
                   'view_only': false,
                   'onUpdateState': updateState,
                   'onXvpInit' : xvpInit});
    // opennebula file in use by openstack deployment
    //rfb.connect(WSHOSTNAME, WSPORT, null, "websockify?token=" + token);
    rfb.connect(WSHOSTNAME, WSPORT, null, "vnc_auto.html?token=" + token);

    // hide local cursor when in VNC canvas
    $('#noVNC_canvas').css('cursor', 'none');
}

function vncdisconnect()
{
    rfb.disconnect();
}


function xvpInit(ver) {}

function updateState(rfb, state, oldstate, msg) {
    var s, sb, cad, level;
    s = $D('noVNC_status');
    sb = $D('noVNC_status_bar');
    switch (state) {
        case 'failed':       level = "error";  break;
        case 'fatal':        level = "error";  break;
        case 'normal':       level = "normal"; break;
        case 'disconnected': level = "normal"; break;
        case 'loaded':       level = "normal"; break;
        default:             level = "warn";   break;
    }

    if (typeof(msg) !== 'undefined') {
        sb.setAttribute("class", "noVNC_status_" + level);
        s.innerHTML = msg;
    }
}
