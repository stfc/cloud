/*jshint sub:true*/
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
if (Cookies.get("showall") == "true") {
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

var vmlist = $('#vm-list').DataTable( {
    "columns": [
        { data: 'name'},
        { data: 'hostname'},
        { data: 'state'},
        { data: 'stime'},
        { data: 'cpu'},
        { data: 'memory'},
        { data: 'type'},
        { data: 'token'},
        { data: 'id'},
    ],
    "columnDefs": [
            {
                "orderable": false,
                "targets": [7, 8]
            }
        ]
});
$.fn.dataTable.ext.errMode = 'throw';
function drawTable()
{
    var show = $('#show-all').prop('checked');
    Cookies.get("showall", show, {path : '/'});
    $.ajax({
        type: "GET",
        url: "/api/vm",
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
        vmlist.clear();

        for (row of data["data"]) {
            state = row['state'];
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
                row['id'] = '<button type="button" class="btn btn-success btn-xs" title="Boot Machine" onclick="bootVM(' + row['id'] + ')"><span class="glyphicon glyphicon-arrow-up" style="vertical-align:middle;margin-top:-2px"></span></button>';
            } else {
                row['id'] = '<button type="button" class="btn btn-danger btn-xs" title="Delete Machine" onclick="deleteVMdialog(' + row['id'] + ')"><span class="glyphicon glyphicon-remove" style="vertical-align:middle;margin-top:-2px"></span></button>';
            }

            row['token'] = '<button type="button" class="btn btn-blue btn-xs" title="Launch Desktop GUI" onclick="vncdialog(\'' + row['token'] + '\', \'' + row['name'] + '\')" ' + disabled + '><img src="/assets/images/icon-display.png" style="width:14px;margin-top:-2px" /></button>';

            row['memory'] = row['memory']/1024 + "GB";

            row['state'] = '<span class="status-label status-label-'+state_val+'">'+state+'</span><progress max="4" value="'+state_val+'"></progress>';

            row['stime'] = formatDate(row['stime']);

            row['etime'] = row['etime'];

            delete row['etime'];
            vmlist.row.add(row);
        }
        vmlist.draw(false); // 'false' saves the paging position
    });
}

// stop form submission on enter
$('.noEnterSubmit').keypress(function(e){
    if ( e.which == 13 ) e.preventDefault();
});
