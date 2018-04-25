function getProjects() {
    $.ajax({
        type: "GET",
        url: "/api/projects",
        statusCode: {
            500: function() {
                   $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                   $("#error").show();
            }
        }
    }).done(function(data) {
        if (!(data['data'].length >= 1)) {
              $("#errormessage").html("You do not have access to any projects");
              $("#error").show();
        } else {

              var projectList = data;
              var select = document.getElementById("projectChoice");
              for (i = 0; i < projectList['data'].length; i++){
                  select.options[select.options.length] = new Option(projectList['data'][i]['name'], projectList['data'][i]['id']);
              }
        
              var selItem = sessionStorage.getItem("selItem");
              for (i = 0; i < Object.values(data.data).length; i++){
                  if (Object.values(data.data[i]).includes(selItem)) {
	              $('#projectChoice').val(selItem);
	          }
              }

              makeAjaxCalls();
        }
    });
}

function makeAjaxCalls() {
    var selValue = $('#projectChoice').val();
    sessionStorage.setItem("selItem", selValue);

    var loadingStatusText = ""
    $("#loadingStatus").html(loadingStatusText + "<div id=\"loadingStatusWheel\" class=\"loader\"></div>");
    loadingCount = 0;
    $('#newMachine').attr('disabled', '');
    var date = new Date();
    date.setTime(date.getTime() + (86400 * 1000));    // Cookie will expire 24 hours after creating
    Cookies.set("projectID", document.getElementById("projectChoice").value, {expires : date, path : '/'});
    getTemplateList();
    getFlavors();
    quota.update();
    drawTable(miscAction);

}

function incrementLoadingCount() {
    loadingCount++;
    if (loadingCount >= 4) {
        var loadingStatusFinished = ""
        $("#loadingStatus").html(loadingStatusFinished);
        $('#loadingStatusWheel').hide();
        $('#newMachine').removeAttr('disabled');
    }
}
