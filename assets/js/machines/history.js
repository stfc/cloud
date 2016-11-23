$(function () {
    drawHistory();
});

var vmhistory = $('#vm-history').DataTable( {
    "columns": [
        { data: 'name'},
        { data: 'user'},
        { data: 'group'},
        { data: 'hostname'},
        { data: 'state'},
        { data: 'stime'},
        { data: 'etime'},
        { data: 'type'},
        { data: 'cpu'},
        { data: 'memory'},
    ],
    "columnDefs": [
        {
            "width": "1px",
            "targets": [8, 9]
        },
        {
            "visible": false,
            //"targets": [1, 2] // Hide 'Project' column by default
        }
    ],
    "dom": '<"top"f>t<"bottom"lpi><"clear">'
});

$.fn.dataTable.ext.errMode = 'throw';

function filterTableDialog(id) {
    $('#filtertabledialog').modal('show');
}

$('.show-hide').change( 'click', function (e) {
    e.preventDefault();

    // Get the column API object
    var column = vmhistory.column( $(this).attr('data-column') );

    // Toggle the visibility
    column.visible( ! column.visible() );
});

var fedid = Cookies.get('fedid');
$('#all-vms-history').hide();

function drawHistory()
{
    $.ajax({
        type: "GET",
        url: "/api/vm?history=1&size=999",
        statusCode: {
            403: function() {
                exceptions("403");
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
            else if (state === "FAILED") {
                state_val = 5;
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

            row['stime'] = moment.unix(row['stime']).format("YYYY/MM/DD - h:mm:ss a");

            if (row['etime'] == 0) {

                row['etime'] = "";
            } else {
                row['etime'] = moment.unix(row['etime']).format("YYYY/MM/DD - h:mm:ss a");
            }

            delete row['id'];

            delete row['token'];

            // Check to see what view user is on
            if ($("#my-vms-history").hasClass('active')) {
                if (row['user'] === fedid) {
                    vmhistory.row.add(row);
                } else {
                    // Do not return row
                    $('#all-vms-history').show(); // Show 'All VMs' tab
                    vmhistory.column( 1 ).visible( false );
                }
            } else {
                if ($("#all-vms-history").hasClass('active')) {
                    $('#all-vms-history').show();
                    vmhistory.column( 1 ).visible( true );
                }
                vmhistory.row.add(row);
            }
        }
        vmhistory.draw(false); // 'false' saves the paging position
    });
}
