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
        var projectList = data;
        var select = document.getElementById("projectChoice");
        for (i = 0; i < projectList['data'].length; i++){
              select.options[select.options.length] = new Option(projectList['data'][i]['name'], projectList['data'][i]['id']);
        }
        makeAjaxCalls();
    });
}

function makeAjaxCalls() {
    var date = new Date();
    date.setTime(date.getTime() + (86400 * 1000));    // Cookie will expire 24 hours after creating
    Cookies.set("projectID", document.getElementById("projectChoice").value, {expires : date, path : '/'});
    getTemplateList();
    getFlavors();
    quota.update();
    drawTable(miscAction);
}

