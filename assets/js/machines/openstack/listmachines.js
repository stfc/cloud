const vmDeleted = 1    // Used when listing VMs
const miscAction = 2

// Creating a dictionary for VM states that are associated with state values
var stateDictionary = {};
keys = ["SHUTOFF", "PAUSED", "SHELVED", "SHELVED_OFFLOADED", "SOFT_DELETED", "SUSPENDED", "PASSWORD", "RESCUE", "RESIZE", "REVERT_RESIZE", "VERIFY_RESIZE", "HARD_REBOOT", "REBOOT", "MIGRATING", "BUILD", "REBUILD", "ACTIVE", "ERROR", "UNKNOWN", "DELETED"];
values = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 5, 5];

for(var i = 0; i < keys.length; i++){
    stateDictionary[keys[i]] = values[i];
}

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
        { data: 'aquilon'},     // Column 6
        { data: 'flavor'},      // Column 7
        { data: 'cpu'},         // Column 8
        { data: 'memory'},      // Column 9
        { data: 'token'},       // Column 10
        { data: 'id'}           // Column 11
    ],
    "order": [
        [4, "desc"]
    ],
    "columnDefs": [
        {
            "width": "1px",
            "targets": [5, 6, 7, 8, 9, 10] // Collapse if they don't exist
        },
        {
            "orderable": false,
            "targets": [10, 11] // Stop 'VNC' and 'Delete' from being orderable
        },
        {
            "visible": false,
            "targets": [6] // Hide Aquilon column by default, since this field will be empty for most VMs
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


// Get VNC URLs
var vncList = {};
function getVNC() {

    getVNCRequest = $.ajax({
       type: 'GET',
       url: '/api/vnc',
       statusCode: {
           400: function(data) {
               $("#errormessage").html(data.statusText);
               $("#error").show();
           },
           403: function() {
               exceptions("403");
           },
           500: function(data) {
               $("#errormessage").html(data.statusText);
               $("#error").show();
           }
       }
    }).done(function(data) {
          vncList = data;
          addVNC();

          loadedProject['vnc'] = true;
          loadingWheels();
    })
};

// Add VNC URLs to buttons
function addVNC() {
    if (typeof vncList !== undefined) {
        for (vm of vncList["data"]) {
             x = "#vnc-" + vm['id'];
             if (vm['vncURL'] == undefined || vm['vncURL'] == "" || vm['vncURL'] == null) {
                 $(x).attr("disabled", "");
             } else {
                 y = 'window.open("' + vm["vncURL"] + '","_blank")'

//                  Uncomment to use GUI popup
//                  y = 'vncdialog(\'' + row['token'] + '\', \'' + name + '\', \'' + row['vncURL'] + '\')'

                 $(x).removeAttr("onclick");
                 $(x).attr("onclick", y);
                 $(x).removeAttr("disabled");
             }
        }
    }
}

var fedid = Cookies.get('fedid');

function drawTable(action) {

    drawTableRequest = $.ajax({
        type: "GET",
        url: "/api/vm",
        data: {'action' : action},
        statusCode: {
            400: function(data) {
                $("#errormessage").html(data.statusText);
                $("#error").show();
            },
            403: function() {
                exceptions("403");
            },
            500: function() {
                exceptions("500", "getting VMs list.");
            }
        }
    }).done(function(data) {

        $('#all-vms').hide();
        vmlist.clear();

        for (row of data["data"]) {
            //Rename
            name = row['name']
            row['name'] = '<button style="margin-left:5px;float:right;" type="button" class="btn btn-default btn-xs hide-until-hover" title="Rename Machine" onclick="renameDialog(\'' + row['id'] + '\',\'' + name + '\')"><span class="glyphicon glyphicon-pencil" style="vertical-align:middle;margin-top:-2px"></span></button>' + name;

            // State
            state = row['state'];
            disabled = (state != "ACTIVE" ? "disabled" : "");
            row['state'] = '<span class="status-label status-label-'+ stateDictionary[state] +'">'+ state +'</span><progress max="4" value="'+ stateDictionary[state] +'"></progress>';

            // Time
            row['stime'] = {
                "timestamp" : row['stime'],
                "display" : "<span title='" + moment.unix(row['stime']).format("YYYY/MM/DD - h:mm:ss a") + "'>" + moment.unix(row['stime']).fromNow() + "</span>"
            }

            // RAM
            row['memory'] = row['memory']/1024 + "GB";

            // noVNC / Boot
            if (stateDictionary[state] === 0) {
                row['token'] = '<button type="button" class="btn btn-success btn-xs" title="Boot Machine" onclick="bootVM(\'' + row['id'] + '\')"><span class="glyphicon glyphicon-arrow-up" style="vertical-align:middle;margin-top:-2px"></span></button>';
            } else {
                // noVNC                
                x = "vnc-" + row['id']
                y = ""
                if ($('#'+x).attr("onclick") == undefined) {
		   y = 'disabled=""'
                } else {
                   y = 'onclick="' + toString($('#'+x).attr("onclick")) + '"'
                }

		row['token'] = '<button id="' + x + '" type="button" class="btn btn-blue btn-xs" title="Launch GUI in new tab" ' + y + '><img src="/assets/images/icon-display.png" style="width:14px;"/></button>';
                
            }

            // Delete
            if (row['user'] === fedid || row['candelete'] === true) {
                row['id'] = '<button type="button" class="btn btn-danger btn-xs" title="Delete Machine" onclick="deleteVMdialog(\'' + row['id'] + '\', \'' + name + '\')"><span class="glyphicon glyphicon-remove" style="vertical-align:middle;margin-top:-2px"></span></button>';
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
        // 'false' saves the paging position
        vmlist.draw(false);
        loadedProject['vms'] = true;
        loadingWheels();
    });
}

// stop form submission on enter
$('.noEnterSubmit').keypress(function(e){
    if ( e.which == 13 ) e.preventDefault();
});

