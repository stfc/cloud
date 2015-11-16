/*jshint sub:true*/

function createVMdialog()
{
    if (quota.used == quota.available && quota.available !== 0) {
        $("#errormessage").html('You have hit your quota of VMs. Please delete uneeded ones or contact us and request a quota increase.');
        $("#error").show();
        return;
    }

    $("#name").val("");
    $('#createvmdialog').modal('show');
    draw_buttons();
}

function createVM(selected_template)
{
    var data = {
        "name" : $("#name").val().replace(/[^a-zA-Z 0-9-]+/g, ''),
        "template_id": selected_template,
        "archetype": $("#archetype").val(),
        "personality": $("#personality").val(),
        "sandbox": $("#sandbox").val(),
    };

    $.ajax({
        type: "PUT",
        url: "/api/vm",
        contentType: "application/json",
        data: JSON.stringify(data),
        statusCode: {
            400: function() {
                $("#vm-errormessage").html("Make sure you have given your VM a name and selected an template.");
                $("#vm-error").show();
            },
            403: function() {
                $.removeCookie('session', {path : '/'});
                $.removeCookie('name', {path : '/'});
                $.removeCookie('fedid', {path : '/'});
                window.location.replace("/login");
            },
            500: function() {
                $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                $("#error").show();
            }
        }
    }).done(function(json) {
        drawTable();
        quota.update();
        $('#createvmdialog').modal('hide');
        selected_flavour = "";
        selected_release = "";
        selected_type = "";
        selected_template = "";
    });
}

function randomname()
{
    $.get("/machines/random", function(data) {
        $("#name").val(data);
    });
}
