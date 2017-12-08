const vmDeleted = 1    // Used when listing VMs
const miscAction = 2

// Set DataTables
var vmlist = $('#vm-list').DataTable( {
    "columns": [                // Column numbers used for referencing column definitions
        { data: 'name'},        // Column 0
        { data: 'hostname'},    // Column 1
        { data: 'keypair'},     // Column 2
        { data: 'state'},       // Column 3
        { data: {
            _: 'stime.display', // Column 4
            sort: 'stime.timestamp'
        }},
        { data: 'type'},        // Column 5
        { data: 'flavor'},      // Column 6
        { data: 'cpu'},         // Column 7
        { data: 'memory'},      // Column 8
        { data: 'token'},       // Column 9
        { data: 'id'}           // Column 10
    ],
    "columnDefs": [
        {
            "width": "1px",
            "targets": [5, 6, 7, 8, 9]	// Collapse if they don't exist
        },
        {
            "orderable": false,
            "targets": [9, 10] // Stop 'VNC' and 'Delete' form being orderable
        },
    ],
    "dom": '<"top"f>t<"bottom"lpi><"clear">'
});

$.fn.dataTable.ext.errMode = 'throw'; // Prints DataTable errors to console

function filterTableDialog(id) {
    $('#filtertabledialog').modal('show');
}

$('.show-hide').change( 'click', function (e) {
    e.preventDefault();

    // Get the column API object
    var column = vmlist.column( $(this).attr('data-column') );

    // Toggle the visibility
    column.visible( ! column.visible() );
});

var fedid = Cookies.get('fedid');

function drawTable(action) {
    $.ajax({
        type: "GET",
        url: "/api/vm",
        data: {'action' : action},
        statusCode: {
            403: function() {
                exceptions("403");
            },
            432: function() {
                $("#errormessage").html("There's an error with selecting the project to list VMs");
                $("#error").show();
            }, 
            500: function() {
                $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                $("#error").show();
            }
        }
    }).done(function(data) {
        $('#all-vms').hide();
        vmlist.clear();
        for (row of data["data"]) {
            // State
            state = row['state'];
            disabled = (state != "ACTIVE" ? "disabled" : "");

            if (state === "SHUTOFF" || state === "UNKNOWN" || state === "DELETED" || state === "PAUSED" || state === "SHELVED" || state === "SHELVED_OFFLOADED" || state === "SOFT_DELETED" || state === "SUSPENDED") {
                state_val = 0;
            }
            else if (state === "ERROR") {
                state_val = 5;
            }
            else if (state === "PASSWORD" || state === "RESCUE" || state === "RESIZE" || state === "REVERT_RESIZE" || state === "VERIFY_RESIZE") {
                state_val = 1;
            }
            else if (state ===  "HARD_REBOOT" || state === "REBOOT" || state === "MIGRATING") {
                state_val = 2;
            }
            else if (state ===  "BUILD" || state === "REBUILD") {
                state_val = 3;
            }
            else if (state ===  "ACTIVE") {
                state_val = 4;
            }

            row['state'] = '<span class="status-label status-label-'+state_val+'">'+state+'</span><progress max="4" value="'+state_val+'"></progress>';

            // Time
            row['stime'] = {
                "timestamp" : row['stime'],
                "display" : "<span title='" + moment.unix(row['stime']).format("YYYY/MM/DD - h:mm:ss a") + "'>" + moment.unix(row['stime']).fromNow() + "</span>"
            }

            // RAM
            row['memory'] = row['memory']/1024 + "GB";

            // noVNC / Boot
            if (state === "SHUTOFF" || state === "SUSPENDED" || state === "PAUSED" || state === "SHELVED" || state === "SHELVED_OFFLOADED") {
                row['token'] = '<button type="button" class="btn btn-success btn-xs" title="Boot Machine" onclick="bootVM(\'' + row['id'] + '\')"><span class="glyphicon glyphicon-arrow-up" style="vertical-align:middle;margin-top:-2px"></span></button>';
            } else {
                row['token'] = '<button type="button" class="btn btn-blue btn-xs" title="Launch Desktop GUI" onclick="vncdialog(\'' + row['token'] + '\', \'' + row['name'] + '\', \'' + row['vncURL'] + '\')" ' + disabled + '><img src="/assets/images/icon-display.png" style="width:14px;margin-top:-2px" /></button>';
            }

            // Delete
            if (row['user'] === fedid || row['candelete'] === true) {
                row['id'] = '<button type="button" class="btn btn-danger btn-xs" title="Delete Machine" onclick="deleteVMdialog(\'' + row['id'] + '\', \'' + row['name'] + '\')"><span class="glyphicon glyphicon-remove" style="vertical-align:middle;margin-top:-2px"></span></button>';
            } else {
                row['id'] = '<button type="button" class="btn btn-default btn-xs" title="You do not own this machine" onclick=""><span class="glyphicon glyphicon-remove" style="vertical-align:middle;margin-top:-2px"></span></button>';
            }

            // Check to see what view user is on
            if ($("#my-vms").hasClass('active')) {
                if (row['user'] === fedid) {
                    vmlist.row.add(row);
                } else {
                    // Do not return row
                    $('#all-vms').show(); // Show 'All VMs' tab
                    vmlist.column( 1 ).visible( false );
                }
            } else {
                if ($("#all-vms").hasClass('active')) {
                    $('#all-vms').show();
                    vmlist.column( 1 ).visible( true );
                }
                vmlist.row.add(row);
            }
        }
        vmlist.draw(true); // 'false' saves the paging position
    });
}

// stop form submission on enter
$('.noEnterSubmit').keypress(function(e){
    if ( e.which == 13 ) e.preventDefault();
});
