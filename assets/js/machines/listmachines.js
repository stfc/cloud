/*jshint sub:true*/
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
if ($.cookie("showall") == "true") {
    $('#show-all').prop('checked', true);
}

function formatDate(timestamp)
{
    var date = new Date(timestamp*1000);
    var datestring = "";
    datestring += ("0" + date.getUTCDate()).slice(-2) + " ";
    datestring += MONTHS[date.getUTCMonth()] + " ";
    datestring += date.getUTCFullYear() + " ";
    datestring += ("0" + date.getUTCHours()).slice(-2) + ":";
    datestring += ("0" + date.getUTCMinutes()).slice(-2) + ":";
    datestring += ("0" + date.getUTCSeconds()).slice(-2);
    return datestring;
}

function drawTable()
{
    var show = $('#show-all').prop('checked');
    $.cookie("showall", show, {path : '/'});
    $.ajax({
        type: "GET",
        url: "/api/vm?size=" + pagesize + "&offset=" + offset,
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
            if (state === "POWERED OFF") {
                button = '<td><button type="button" class="btn btn-success btn-xs" title="Boot Machine" onclick="bootVM(' + vm['id'] + ')"><span class="glyphicon glyphicon-arrow-up" style="vertical-align:middle;margin-top:-2px"></span></button></td>';
            } else {
                button = '<td><button type="button" class="btn btn-danger btn-xs" title="Delete Machine" onclick="deleteVMdialog(' + vm['id'] + ')"><span class="glyphicon glyphicon-remove" style="vertical-align:middle;margin-top:-2px"></span></button></td>';
            }

            html += '<tr>';
            html += '<td>' + vm['name'] + '</td>';
            html += '<td>' + vm['hostname'] + '</td>';
            html += '<td><progress max="4" value="'+state_val+'"></progress><span class="status-label">'+state+'</span></td>';
            html += '<td>' + vm['type'] + '</td>';
            html += '<td>' + formatDate(vm['stime']) + '</td>';   // move date formattion into own function
            html += '<td style="text-align:center">' + vm['cpu'] + '</td>';
            html += '<td style="text-align:center">' + (vm['memory']/1024) + "GB" + '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-blue btn-xs" title="Launch Desktop GUI" onclick="vncdialog(\'' + vm['token'] + '\', \'' + vm['name'] + '\')" ' + disabled + '>';
            html += '<img src="/assets/images/icon-display.png" style="width:14px;margin-top:-2px" />';
            html += '</button>';
            html += '</td>';
            html += button;
            html += '</tr>';
        });

        if (html !== "") {
            $("#vms").empty();
            $("#vms").append(html);
        }

        $("#error").hide();
    });
}

// stop form submission on enter
$('.noEnterSubmit').keypress(function(e){
    if ( e.which == 13 ) e.preventDefault();
});
