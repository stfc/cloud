$(function() {
    createVMlist();
});

var offset = 0;
var numvms = 0;
var pagesize = 5;

var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(timestamp)
{
    if (timestamp === 0) {
        return "-";
    }

    var date = new Date(timestamp*1000);
    var datestring = "";
    datestring += date.getUTCDate() + " ";
    datestring += MONTHS[date.getUTCMonth()] + " ";
    datestring += date.getUTCFullYear() + " ";
    datestring += ("0" + date.getUTCHours()).slice (-2) + ":";
    datestring += ("0" + date.getUTCMinutes()).slice (-2) + ":";
    datestring += ("0" + date.getUTCSeconds()).slice (-2);
    return datestring;
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
            state = vm['state'];
            disabled = (state != "RUNNING" ? "disabled" : "");

            if (state === "POWERED OFF") {
                state_val = 0;
            }
            else if (state ===  "PENDING" || state === "DELETING") {
                state_val = 1;
            }
            else if (state ===  "TRANSFER") {
                state_val = 2;
            }
            else if (state ===  "BUILDING" || state === "EPILOG") {
                state_val = 3;
            }
            else if (state ===  "RUNNING") {
                state_val = 4;
            }
            else {
                state_val = 0;
            }
            html += '<tr>';
            html += '<td>' + vm['name'] + '</td>';
            html += '<td>' + vm['hostname'] + '</td>';
            html += '<td><progress max="4" value="'+state_val+'"></progress><span class="status-label">'+state+'</span></td>';
            html += '<td>' + vm['type'] + '</td>';
            html += '<td>' + formatDate(vm['stime']) + '</td>';
            html += '<td>' + formatDate(vm['etime']) + '</td>';
            html += '<td>' + vm['cpu'] + '</td>';
            html += '<td>' + (vm['memory']/1024) + "GB" + '</td>';
            html += '</tr>';
        });
        if (html !== "") {
            $("#vms").empty();
            $("#vms").append(html);
        }
        $("#error").hide();
    });
}
