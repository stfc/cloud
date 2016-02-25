$("#name-error").hide();

function createVMdialog() {
    if (vmavailable === 0 || cpuavailable === 0 || memavailable === 0 || sysavailable === 0 ) {
        $("#resources").addClass('hide');
        $("#no-resources").removeClass('hide');
        $("#create-btn").attr('onclick', "").css('cursor', 'not-allowed');
    } else {
        $("#resources").removeClass('hide');
        $("#no-resources").addClass('hide');
        $("#create-btn").attr('onclick', "fetch_values(selected_template)").css('cursor', 'pointer');
    }

    $("#name").val("");
    $('#cpu-input').val("1");
    $('#cpu-output').val("1");
    $('#memory-input').val("0.5");
    $('#memory-output').val("0.5");
    $('#createvmdialog').modal('show');
    draw_buttons();
}

function randomname() {
    $.get("/machines/random", function(data) {
        $("#name").val(data);
    });
}

function fetch_values(selected_template) {
    $("#name-error").hide();
    $("#vm-error").hide();

    cpu = $("#cpu-input").val()/2;
    memory = $("#memory-input").val()*1024;
    var data = {
        "template_id": selected_template,
        "archetype": $("#archetype_options").val(),
        "personality": $("#personality_options").val(),
        "sandbox": $("#sandbox_options").val(),
        "vcpu": $("#cpu-input").val(),
        "cpu": '' + cpu,
        "memory": '' + memory,
    };
    check_name(data);
}

function check_name(data) {
    badwords_url = 'https://raw.githubusercontent.com/' +
    'shutterstock/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en';
    vmname = $("#name").val().replace(/[^a-z A-Z 0-9 .@_-]+/g, ' ');
    test = vmname.toLowerCase();
    $.get(badwords_url, function(words) {
        data['name'] = '';
        // Remove new lines and replace with | then cut off the last |
        badwords = words.replace(/\r?\n|\r/g, '|').slice("|", -1);
        regexp = new RegExp("(" + badwords + ")", "g");
        if (test.match(regexp)) {
            $("#name-errormessage").html("Please try a different name. '<b>"+ vmname +"</b>' contains blocked words.");
            $("#name-error").show();
            data['name'] = '';
        } else {
            data['name'] = vmname;
        }
        create_VM(data);
    });
}

function create_VM(data) {
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
