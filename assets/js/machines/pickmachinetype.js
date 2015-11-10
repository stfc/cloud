var image_list = "";
var selected_flavour = "";
var selected_release = "";
var selected_type = "";
var selected_template = "";

$.ajax({
    type: "GET",
    url: "/api/templatelist",
    dataType:'json',
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
}).done(function(data) {
    image_list = data;
});

function draw_buttons() {
    buttons = "";
    controls = "";
    helptext = "";
    var os_flavour,release,type,image = null;

    if (selected_flavour === "") {
        for (os_flavour in image_list) {
            if (image_list.length == 1) {
                selected_flavour = os_flavour;
            }
            else {
                buttons += '<a class="btn btn-lev1" id="'+os_flavour+'" onclick="selected_flavour=\''+os_flavour+'\'; draw_buttons();">'+os_flavour+'</a>';
            }
        }
        if (image_list.length != 1) {
            helptext = 'Select an operating system flavour';
        }
    }

    else if (selected_release === "") {
        for (release in image_list[selected_flavour]) {
            if (image_list[selected_flavour].length == 1) {
                selected_release = release;
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_flavour=\'\';selected_release=\'\'; draw_buttons();">Back</a>';
            }
            else {
                buttons += '<a class="btn btn-lev2" id="'+release+'" onclick="selected_release=\''+release+'\'; draw_buttons();">'+release+'</a>';
            }
        }
        if (image_list[selected_flavour].length != 1) {
            helptext = '<span>Select a version of ' + selected_flavour + '</span>';
            controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_flavour=\'\'; draw_buttons();">Back</a>';
        }
    }

    else if (selected_type === "") {
        image_cpu = '';
        image_memory = '';
        for (type in image_list[selected_flavour][selected_release]) {
            if (image_list[selected_flavour][selected_release].length == 1) {
                selected_type = type;
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_type=\'\';selected_release=\'\'; draw_buttons();">Back</a>';
            }
            else {
                buttons += '<a class="btn btn-lev3" id="'+type+'" onclick="selected_type=\''+type+'\'; draw_buttons();">'+type+'</a>';
            }
        }
        if (image_list[selected_flavour][selected_release].length != 1) {
            helptext = 'Select a starting configuration for ' + selected_flavour + ' ' + selected_release;
            controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_release=\'\'; draw_buttons();">Back</a>';
        }
    }

    else if (selected_template === "") {
        for (var id in image_list[selected_flavour][selected_release][selected_type]) {
            image = image_list[selected_flavour][selected_release][selected_type][id];
            image_id = image.id;
            image_name = image.name;
            image_description = image.description;
            image_cpu = image.cpu;
            image_memory = image.memory;
            $("#cpu").html(image_cpu);
            $("#memory").html(image_memory);

            if (image_list[selected_flavour][selected_release][selected_type].length == 1) {
                selected_template = image_id;
                helptext = '';
                buttons = "Complete!<br> You chose " + image_name + ". " + image_description;
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_template=\'\';selected_type=\'\'; draw_buttons();">Back</a>';
            }
            else {
                helptext = 'Select a template for ' + selected_flavour + ' ' + selected_release + ' ' + selected_type;
                buttons += '<a class="btn btn-lev4" id="'+image_name+'" onclick="selected_template=\''+image_id+'\'; draw_buttons();">'+image_name+'</a>';
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_type=\'\'; draw_buttons();">Back</a>';
            }
        }
    }

    else {
        buttons = "Complete!<br> You chose " + image_name + ". " + image_description;
        controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_template=\'\'; draw_buttons();">Back</a>';
    }
    $("#buttonbox").html(buttons);
    $("#helpbox").html(helptext);
    $("#controlbox").html(controls);
}
