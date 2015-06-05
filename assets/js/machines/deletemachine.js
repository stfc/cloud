function deleteVMdialog(id)
{
    $("#confirmdelete").data("vmid", id)
    $('#deletevmdialog').modal('show');
}

function deleteVM()
{
    var id = $("#confirmdelete").data("vmid");

    $.ajax({
        type: "DELETE",
        url: "/api/vm?" + $.param({"id": id}),
        statusCode: {
            403: function() {
                $.removeCookie('session', {path : '/'});
                $.removeCookie('name', {path : '/'});
                $.removeCookie('fedid', {path : '/'});
                window.location.replace("/login");
            },
            500: function(data) {
                alert(JSON.stringify(data));
                $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                $("#error").show();
            }
        }
    }).done(function(json) {
        drawTable();
        quota.update();
    }).always(function(json) {
        $('#deletevmdialog').modal('hide');
    });
}