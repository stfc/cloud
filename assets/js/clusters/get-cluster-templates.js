/**
 * Retrieves data for all available cluster templates.
 * Populates the template dropdown menu in the Create Cluster modal.
 * Removes the loading message when complete.
 */
function addClusterTemplates(){
    ajaxGetRequests.clusterTemplates = $.ajax({
        type: "GET",
        url: "/api/clustertemplate"
    }).done(function(json_returned) {
        var select = $('#cluster-template-select');
        var selectElement = select[0];
        
        for (ct of json_returned["cluster_template_list"]){
            selectElement.add(new Option(ct['name'], ct['uuid']))
        }

        $('#loading-cluster-templates').hide();
    });
}