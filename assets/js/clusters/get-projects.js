/**
 * Retrieves data for all available projects.
 * Populates the projects dropdown menu on the Clusters page.
 * If a 'projectID' cookie is found, and this ID matches a project in the dropdown, this project is selected.
 * Refreshes the data on the Clusters page.
 */
function addProjects(){
    $.ajax({
        type: "GET",
        url: "/api/projects"
    }).done(function(json_returned){
        var select = $('#project-select');
        var selectElement = select[0];
        var currentProj = Cookies.get("projectID");
        
        for (p of json_returned["data"]){
            selectElement.add(new Option(p['name'], p['id']))
            if (p['id'] === currentProj){   // Checks projectID exists in dropdown before setting as selected
                select.val(currentProj) 
            }
        }
        refreshSelectedProject();
    });
}

/**
 * Aborts all ajax requests for retrieving project data.
 * Removes project data from the Clusters page.
 * Creates a 'projectID' cookie with the project selected from the projects dropdown menu.
 * Requests project data with updated project.
 * (note: 'project data' here refers to clusters, cluster templates, and flavours)
 */
function refreshSelectedProject(){
    abortAjaxGetRequests()

    clusterTable.clear().draw(false);
    $('#cluster-template-select').empty();
    $('#master-flavor-select').empty();
    $('#node-flavor-select').empty();

    $('#loading-clusters').show();
    $('#loading-cluster-templates').show();
    $('#loading-master-flavors').show();
    $('#loading-node-flavors').show();

    var date = new Date();
    date.setTime(date.getTime() + (86400 * 1000));    // Cookie will expire 24 hours after creating
    
    var projectSelection = $('#project-select').val();
    // 'projectID' cookie shared with Machines tab (changing the project on one page will be reflected in both)
    Cookies.set("projectID", projectSelection, {expires : date, path : '/'});

    drawClusterTable();
    addClusterTemplates();
    addFlavors();
}

var ajaxGetRequests = { // Ajax-requests for the given keys are stored here
    clusters: $.ajax({}),
    clusterTemplates: $.ajax({}),
    flavors: $.ajax({})
}

/**
 * Aborts all ajax requests for retrieving project data.
 */
function abortAjaxGetRequests(){
    for (r in ajaxGetRequests){
        ajaxGetRequests[r].abort();
    }
}