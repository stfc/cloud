var template_list = null;

function createVMdialog()
{
    if (quota.used == quota.available && quota.available != 0) {
        $("#errormessage").html('You have hit your quota of VMs. Please delete uneeded ones or contact us and request a quota increase.');
        $("#error").show();
        return;
    }

    $("#name").val("");
    $("#template").empty();

    $.ajax({
        type: "GET",
        url: "/api/template",
        statusCode: {
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
        template_list = json;

        var html = '';
        $.each(template_list, function(index, template) {
            html += '<option value="' + template['id'] + '">';
            html += template['name'];
            html += '</option>';
        });
        $("#template").append(html);
        $("#description").html(template_list[0]['description']);
        $("#cpu").html(template_list[0]['cpu']);
        $("#memory").html((template_list[0]['memory']/1024) + "GB");
    
        $('select.selectpicker').on('change', function(){
            var template_id = $('.selectpicker option:selected').val();
            $.each(template_list, function(index, template) {
                if (template['id'] == template_id) {
                    description = template['description'];
                    cpu = template['cpu'];
                    memory = (template['memory']/1024) + "GB";
                }
            });
            $("#description").html(description);
            $("#cpu").html(cpu);
            $("#memory").html(memory);
        });
    
        $('.selectpicker').selectpicker('refresh');
        $('#createvmdialog').modal('show');
    });
}

function createVM()
{
    var data = {
        "name" : $("#name").val().replace(/[^a-zA-Z 0-9-]+/g, ''),
        "template_id": $('.selectpicker option:selected').val()
    };

    $.ajax({
        type: "PUT",
        url: "/api/vm",
        contentType: "application/json",
        data: JSON.stringify(data),
        statusCode: {
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
        drawPagination(-1);
    }).always(function() {
        $('#createvmdialog').modal('hide');
    });
}

function randomname()
{
    $.get("/machines/random", function(data) {
        $("#name").val(data);
    });
}