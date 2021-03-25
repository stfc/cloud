/**
 * Stores the name and uuid of the given cluster in the html.
 * Displays the Delete Cluster modal for the given cluster.
 * @param {string} uuid - The UUID of the cluster
 * @param {string} name - The name of the cluster
 */
function deleteClusterDialog(uuid, name) {
    $('#cluster-to-delete').html(name)
    $('#cluster-to-delete').data('uuid', uuid)
    $('#delete-cluster-dialog').modal('show');
}

/**
 * Requests API to delete the given cluster.
 * Closes the modal and requests a table re-draw.
 */
function deleteCluster(){
    var uuid = $('#cluster-to-delete').data('uuid')

    $.ajax({
        type: "DELETE",
        url: "/api/cluster?id=" + uuid
    }).done(function() {
        $('#delete-cluster-dialog').modal('hide');
        // NOTE: It may take Magnum up to ~1min to update the Status to DELETE_IN_PROGRESS
        drawClusterTable()
    });
}