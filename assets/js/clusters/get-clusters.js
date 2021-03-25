var clusterTable = $('#cluster-list').DataTable({   // Initialises a DataTable to display the clusters
    "columns": [
        { data: 'name', title: 'Name'},
        { data: 'status', title: 'Status' },
        { data: 'uuid', title: 'ID' },
        { data: 'health_status', title: 'Health' },
        { data: 'keypair', title: 'Key Pair' },
        { data: 'master_count', title: 'Masters' },
        { data: 'node_count', title: 'Nodes' },
        { data: 'config' },
        { data: 'delete' },
    ],
    "dom": '<"top"f>t<"bottom"lpi><"clear">'    // Puts the 'show x entries' dropdown below the table
});

/**
 * Returns the HTML for a button which displays the Delete Cluster modal
 * for the given cluster.
 * @param {string} uuid - The UUID of the cluster
 * @param {string} name - The name of the cluster
 * @returns {string} HTML for a delete button
 */
function makeDeleteBtn(uuid, name){
    return '<button\
                title="Delete Cluster"\
                onclick="deleteClusterDialog(\''+uuid+'\',\''+name+'\')"\
                class="btn btn-danger btn-xs"\
            >\
                <span\
                    class="glyphicon glyphicon-trash"\
                    style="vertical-align:middle;margin-top:-2px"\
                />\
            </button>'
} 

// Classes and styles for both buttons taken from Machines page

/**
 * Returns the HTML for a button which displays the Cluster Config modal
 * for the given cluster.
 * @param {string} uuid - The UUID of the cluster
 * @param {string} name - The name of the cluster
 * @returns {string} HTML for a config button
 */
function makeConfigBtn(uuid, name){
    return '<button\
                title="Get Cluster Config"\
                onclick="clusterConfigDialog(\''+uuid+'\',\''+name+'\')"\
                class="btn btn-blue btn-xs"\
            >\
                <span\
                    class="glyphicon glyphicon-save-file"\
                    style="vertical-align:middle;margin-top:-2px"\
                />\
            </button>'
} 

/**
 * Retrieves data for all available clusters.
 * Removes existing data in 'clusterTable'.
 * Populates 'clusterTable' with the data for each cluster retrieved.
 * For each row (cluster) creates a delete and config button for the given cluster.
 * Removes the loading clusters message (if present) when complete.
 */
function drawClusterTable() {
    ajaxGetRequests.clusters = $.ajax({
        type: "GET",
        url: "/api/cluster"
    }).done(function(json_returned) {
        clusterTable.clear();
        for (c of json_returned["cluster_list"]){

            c['delete'] = makeDeleteBtn(c['uuid'], c['name'])
            c['config'] = makeConfigBtn(c['uuid'], c['name'])
            clusterTable.row.add(c).draw(false);
        }

        $('#loading-clusters').hide();
    });

}

