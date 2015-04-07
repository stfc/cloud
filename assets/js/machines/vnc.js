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
    rfb.connect(WSHOSTNAME, WSPORT, null, "websockify?token=" + token);

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
    cad = $D('sendCtrlAltDelButton');
    switch (state) {
        case 'failed':       level = "error";  break;
        case 'fatal':        level = "error";  break;
        case 'normal':       level = "normal"; break;
        case 'disconnected': level = "normal"; break;
        case 'loaded':       level = "normal"; break;
        default:             level = "warn";   break;
    }

    if (state === "normal") {
        cad.disabled = false;
    } else {
        cad.disabled = true;
        xvpInit(0);
    }

    if (typeof(msg) !== 'undefined') {
        sb.setAttribute("class", "noVNC_status_" + level);
        s.innerHTML = msg;
    }
}