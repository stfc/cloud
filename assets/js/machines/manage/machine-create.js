/*jshint sub:true*/

function createVMdialog()
{
    if (vmavailable === 0 || cpuavailable === 0 || memavailable === 0 || sysavailable === 0 ) {
        $("#resources").addClass('hide');
        $("#no-resources").removeClass('hide');
        $("#create-btn").attr('onclick', "").css('cursor', 'not-allowed');
    } else {
        $("#resources").removeClass('hide');
        $("#no-resources").addClass('hide');
        $("#create-btn").attr('onclick', "createVM(selected_template)").css('cursor', 'pointer');
    }

    $("#name").val("");
    $('#cpu-input').val("1");
    $('#cpu-output').val("1");
    $('#memory-input').val("0.5");
    $('#memory-output').val("0.5");
    $('#createvmdialog').modal('show');
    draw_buttons();
}

function createVM(selected_template)
{
    cpu = $("#cpu-input").val()/2;
    memory = $("#memory-input").val()*1024;
    var data = {
        "name" : $("#name").val().replace(/[^a-zA-Z 0-9-]+/g, ''),
        "template_id": selected_template,
        "archetype": $("#archetype_options").val(),
        "personality": $("#personality_options").val(),
        "sandbox": $("#sandbox_options").val(),
        "vcpu": $("#cpu-input").val(),
        "cpu": '' + cpu,
        "memory": '' + memory,
    };
    console.log(data);
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
                Cookie.remove('session', {path : '/'});
                Cookie.remove('name', {path : '/'});
                Cookie.remove('fedid', {path : '/'});
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
