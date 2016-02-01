$(function () {
    drawHistory();
});
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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

var vmhistory = $('#vm-history').DataTable( {
    "columns": [
        { data: 'name'},
        { data: 'hostname'},
        { data: 'state'},
        { data: 'type'},
        { data: 'stime'},
        { data: 'etime'},
        { data: 'cpu'},
        { data: 'memory'},
    ]
});
$.fn.dataTable.ext.errMode = 'throw';
function drawHistory()
{
    $.ajax({
        type: "GET",
        url: "/api/vm?history=1&size=999",
        statusCode: {
            403: function() {
                Cookie.remove('session', {path : '/'});
                Cookie.remove('name', {path : '/'});
                Cookie.remove('fedid', {path : '/'});
                window.location.replace("/login");
            },
            500: function() {
                $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                $("#error").show();
            }
        }
    }).done(function(data) {
        vmhistory.clear();

        for (row of data["data"]) {
            state = row['state'];
            // var state_val;
            disabled = (state != "RUNNING" ? "disabled" : "");

            if (state === "POWERED OFF" || state === "DONE") {
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

            row['memory'] = row['memory']/1024 + "GB";

            row['state'] = '<span class="status-label status-label-'+state_val+'">'+state+'</span><progress max="4" value="'+state_val+'"></progress>';

            row['stime'] = formatDate(row['stime']);

            row['etime'] = formatDate(row['etime']);

            delete row['id'];

            delete row['token'];

            vmhistory.row.add(row);
        }
        vmhistory.draw(false); // 'false' saves the paging position
    });
}
