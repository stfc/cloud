// Set DataTables
var vmlist = $('#vm-list').DataTable( {
    "columns": [
        { data: 'name'},
        { data: 'user'},
        { data: 'group'},
        { data: 'hostname'},
        { data: 'state'},
        { data: {
            _: 'stime.display',
            sort: 'stime.timestamp'
        }},
        { data: 'type'},
        { data: 'cpu'},
        { data: 'memory'},
        { data: 'token'},
        { data: 'id'}
    ],
    "columnDefs": [
        {
            "width": "1px",
            "targets": [7, 8, 9, 10]
        },
        {
            "orderable": false,
            "targets": [9, 10] // Stop 'VNC' and 'Delete' form being orderable
        },
        {
            "visible": false,
            "targets": [1, 2] // Hide 'Project' column by default
        }
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
$('#all-vms').hide();

function drawTable() {
    $.ajax({
        type: "GET",
        url: "/api/vm",
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
        $('#all-vms').hide();
        vmlist.clear();
        for (row of data["data"]) {
            // State
            state = row['state'];
            disabled = (state != "RUNNING" ? "disabled" : "");

            if (state === "POWERED OFF") {
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

            row['state'] = '<span class="status-label status-label-'+state_val+'">'+state+'</span><progress max="4" value="'+state_val+'"></progress>';

            // Time
            row['stime'] = {
                "timestamp" : row['stime'],
                "display" : "<span title='" + moment.unix(row['stime']).format("YYYY/MM/DD - h:mm:ss a") + "'>" + moment.unix(row['stime']).fromNow() + "</span>"
            }

            // RAM
            row['memory'] = row['memory']/1024 + "GB";

            // noVNC / Boot
            if (state === "POWERED OFF") {
                row['token'] = '<button type="button" class="btn btn-success btn-xs" title="Boot Machine" onclick="bootVM(' + row['id'] + ')"><span class="glyphicon glyphicon-arrow-up" style="vertical-align:middle;margin-top:-2px"></span></button>';
            } else {
                row['token'] = '<button type="button" class="btn btn-blue btn-xs" title="Launch Desktop GUI" onclick="vncdialog(\'' + row['token'] + '\', \'' + row['name'] + '\')" ' + disabled + '><img src="/assets/images/icon-display.png" style="width:14px;margin-top:-2px" /></button>';
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
        vmlist.draw(false); // 'false' saves the paging position
    });
}

// stop form submission on enter
$('.noEnterSubmit').keypress(function(e){
    if ( e.which == 13 ) e.preventDefault();
});
