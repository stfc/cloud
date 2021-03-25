/**
 * Hides the response div.
 * Displays the Cluster Config modal for the given cluster.
 * @param {string} uuid - The UUID of the cluster
 * @param {string} name - The name of the cluster (to display to the user)
 */
function clusterConfigDialog(uuid, name) {
    $('#cluster-config-response').hide()
    createDownload(name, uuid);
    $('#cluster-config-dialog').modal('show');
}

/**
 * Creates and displays a download link for the given cluster's config file.
 * @param {string} uuid - The UUID of the cluster 
 * @param {string} name - The name of the cluster (to display to the user)
 */
function createDownload(name, uuid){
    var download_link = $('#config-download');
    download_link.attr("href", "/api/clusterconfig?id='"+uuid+"'"); // The UUID need to be within quotes
    download_link.html("Download config file for <strong>"+name+"</strong>");
    download_link.attr("onclick", "showRetrieving('"+name+"')");
    
    download_link.show()
}

/**
 * Displays feedback to the user to indicate their download has begun.
 * Hides the download link.
 * @param {string} name - The name of the cluster (to display to the user)
 */
function showRetrieving(name){
    $('#config-download').hide()

    var responseDiv = $('#cluster-config-response');
    responseDiv.html('Your download of the <strong>'+name+'</strong> config file should begin shortly...')
    responseDiv.show()
}