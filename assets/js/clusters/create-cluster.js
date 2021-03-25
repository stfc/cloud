/**
 * Hides the response div.
 * (Re-)enables the create button.
 * Displays the Create Cluster modal.
 */
function createClusterDialog() {
    $('#cluster-create-response').hide()
    $('#create-cluster-btn').prop('disabled', false); 
    $('#create-cluster-dialog').modal('show');
}

/**
 * Disables the create button
 * Displays a loading message.
 */
function showLoading(){ // TODO: 
    $('#create-cluster-btn').prop('disabled', true); 
    var responseDiv = $('#cluster-create-response');
    responseDiv.html('<span>Working on it <div class="loader"></div></span>')
    responseDiv.css("color", "black")
    responseDiv.show()
}

/**
 * Displays an error message
 * Re-enables the create button.
 */
function showError(){
    var responseDiv = $('#cluster-create-response');
    responseDiv.html("The backend didn't like that.. ")
    responseDiv.css("color", "red")
    responseDiv.show()

    $('#create-cluster-btn').prop('disabled', false); 
}

/**
 * Displays a loading message.
 * Extracts the form data.
 * Removes any whitespace from the name field.
 * Requests API to create a cluster based on the form data.
 * Closes the modal and requests a table re-draw when complete.
 */
function submitClusterForm(){
    showLoading()

    var formData = {
        'name' : $("#cluster-name").val().trim(),
        'cluster_template_id' : $("#cluster-template-select").val(),
        'master_count' : $("#master-count").val(),
        'node_count' : $("#node-count").val(),
        'master_flavor_id': $("#master-flavor-select").val(),
        'flavor_id': $("#node-flavor-select").val()
    }

    $.ajax({
        type: "POST",
        url: "/api/cluster",
        data: formData,
        statusCode: {
            400: function() {
                showError()
            },
            500: function() {
                showError()
            }
        }
    }).done(function(){
        $('#create-cluster-dialog').modal('hide');
        drawClusterTable()
    })

}