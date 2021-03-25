/**
 * Retrieves data for all available flavors.
 * Populates the master and node flavour dropdown menus in the Create Cluster modal.
 * Removes the loading message when complete.
 */
function addFlavors(){
    ajaxGetRequests.flavors = $.ajax({
        type: "GET",
        url: "/api/flavors"
    }).done(function(json_returned) {
        var masterSelectElement = $('#master-flavor-select')[0];
        var nodeSelectElement = $('#node-flavor-select')[0];
        
        masterSelectElement.add(new Option("Template Default", ""))
        nodeSelectElement.add(new Option("Template Default", ""))

        for (f of json_returned["data"]){
            masterSelectElement.add(new Option(f['name'], f['name']))   // Flavour names act as ids
            nodeSelectElement.add(new Option(f['name'], f['name']))
        }

        $('#loading-master-flavors').hide();
        $('#loading-node-flavors').hide();
    });
}