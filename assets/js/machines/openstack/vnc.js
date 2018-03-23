"use strict";

function vncdialog(token, name, vncURL)
{
    $("#vnc-title").html(name);
      
    $('#vncdialog').modal('show');

    $('#noVNC-newtab').attr("onclick", "window.open(\'" + vncURL + "\',\'_blank\')");
    $('#noVNC-newtab').show();

    var iframeText = "<iframe id=\"noVNC_iframe\" style=\"width:100%; height:80vh; cursor:none; border:none; border-radius:4px;\" src=\"" + vncURL + "\"></iframe>";
    $('#vmConsole').html(iframeText);
}
