$(function() {
    createVMlist();
});

var offset = 0;
var numvms = 0;
var pagesize = 5;

var VM_STATES = ["INIT", "PENDING", "HOLD", "ACTIVE", "STOPPED", "SUSPENDED", "DONE", "FAILED", "POWER OFF", "STOPPING"]
var STATE_STYLE = ["primary", "primary", "info", "success", "warning", "warning", "default", "danger", "warning", "warning"]
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(timestamp)
{
    if (timestamp == 0) {
        return "-"
    }

    var date = new Date(timestamp*1000);
    var datestring = "";
    datestring += date.getUTCDate() + " ";
    datestring += MONTHS[date.getUTCMonth()] + " ";
    datestring += date.getUTCFullYear() + " ";
    datestring += ("0" + date.getUTCHours()).slice (-2) + ":";
    datestring += ("0" + date.getUTCMinutes()).slice (-2) + ":";
    datestring += ("0" + date.getUTCSeconds()).slice (-2);
    return datestring
}

function createVMlist()
{
    $.ajax({
        type: "GET",
        url: "/api/vm?history=1&size=999",
        statusCode: {
            403: function() {
                $.removeCookie('session', {path : '/'});
                $.removeCookie('name', {path : '/'});
                $.removeCookie('fedid', {path : '/'});
                window.location.replace("/login");
            },
            500: function() {
                $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                $("#error").show();
            }
        }
    }).done(function(json) {
        var html = "";
        $.each(json, function(index, vm) {
            html += '<tr>';
            html += '<td>' + vm['name'] + '</td>';
            html += '<td>' + vm['hostname'] + '</td>';
            html += '<td><span class="label label-' + STATE_STYLE[vm['state']] + '" style="display:inline-block;width:100%">' + VM_STATES[vm['state']] + '</span></td>';
            html += '<td>' + vm['type'] + '</td>';
            html += '<td>' + formatDate(vm['stime']) + '</td>';
            html += '<td>' + formatDate(vm['etime']) + '</td>';
            html += '<td>' + vm['cpu'] + '</td>';
            html += '<td>' + (vm['memory']/1024) + "GB" + '</td>';
            html += '</tr>';
        });
        $("#vms").empty();
        $("#vms").append(html);
    });
}