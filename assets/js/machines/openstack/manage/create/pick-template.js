var image_list = '';
var selected_flavour = '';
var selected_release = '';
var selected_type = '';
var selected_template = '';
var selected_template_name = '';
var selected_template_description = '';
var aqManaged = "false";

function getTemplateList(){
    $.ajax({
        type: 'GET',
        url: '/api/templatelist',
        dataType: 'json',
        statusCode: {
            403: function() {
                exceptions("403");
            },
            500: function() {
                $('#errormessage').html('The cloud may be experiencing problems. Please try again later.');
                $('#error').show();
            }
        }
    }).done(function(data) {
        image_list = data;
        loadingCount++;
        console.log(loadingCount);
    });
}

function getFlavors(){
    $.ajax({
        type: 'GET',
        url: '/api/flavors',
        dataType: 'json',
        statusCode: {
            403: function() {
                exceptions("403");
            },
            500: function() {
                $('#errormessage').html('The cloud may be experiencing problems. Please try again later.');
                $('#error').show();
            }
        }
    }).done(function(data) {
        flavorList = data;
        loadingCount++;
        console.log(loadingCount);
    });
}

function hide_resources() {
    $('#pick-resources').hide();
}

function draw_buttons() {
    buttons = '';
    controls = '';
    helptext = '';
    var os_flavour,release,type,image = null;
    $('#aquilon-select').css('display', 'none');

    if ($.isEmptyObject(image_list)) {
        buttons = '<div class="alert alert-danger" role="alert"><p>You do not appear to have any templates available to you. Please contact <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p></div>';
        $('#create-btn').attr('onclick', '').css('cursor', 'not-allowed');
    }
    else if (selected_flavour === '') {
        selected_release = '';
        selected_type = '';
        selected_template = '';
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

    else if (selected_release === '') {
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

    else if (selected_type === '') {
        image_cpu = '';
        image_memory = '';
        var i = 0;
        for (type in image_list[selected_flavour][selected_release]) {
            if (image_list[selected_flavour][selected_release].length == 1) {
                selected_type = type;
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_type=\'\';selected_release=\'\'; draw_buttons();">Back</a>';
            }
            else {
                buttons += '<a class="btn btn-lev3" id="'+type+'" onclick="selected_type=\''+type+'\'; aqManaged=\''+image_list[selected_flavour][selected_release][type][i].aqManaged+'\'; draw_buttons();">'+type+'</a>';
            }
            i = i + 1;
        }
        if (image_list[selected_flavour][selected_release].length != 1) {
            helptext = 'Select a starting configuration for ' + selected_flavour + ' ' + selected_release;
            controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_release=\'\'; draw_buttons();">Back</a>';
        }
    }
    else if (aqManaged === "true" && selected_template !== '') {
        $('#pick-resources').show();
        pick_aquilon();
        controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_template=\'\'; selected_template_name=\'\'; selected_template_description=\'\'; aqManaged=\'false\'; draw_buttons(); hide_resources();">Back</a>';
        pick_resources(flavorList);
    }

    else if (selected_template === '') {
        for (var id in image_list[selected_flavour][selected_release][selected_type]) {
            image = image_list[selected_flavour][selected_release][selected_type][id];
            image_id = image.id;
            image_name = image.name;
            image_description = image.description;
            image_cpu = image.cpu;
            image_min_disk = image.minDisk;
            image_min_ram = image.minRAM/1024;
            image_memory = image.memory/1024;

            $('#cpu-input').val(image_cpu);
            $('#cpu-output').val(image_cpu);
            $('#memory-input').val(image_memory);
            $('#memory-output').val(image_memory);

            if (image_list[selected_flavour][selected_release][selected_type].length == 1) {
                selected_template = image_id;
                selected_template_name = image_name;
                selected_template_description = image_description;
                helptext = '';
                buttons = 'Complete!<br> You chose ' + image_name + '. ' + selected_template_description; // When occurs? Why no min. amounts?
                draw_buttons();
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_template=\'\';selected_type=\'\';selected_template_name=\''+image_name+'\'; selected_template_description=\''+image_description+'\'; aqManaged=\'\'; draw_buttons();hide_resources();">Back</a>';
            }
            else {
                helptext = 'Select a template for ' + selected_flavour + ' ' + selected_release + ' ' + selected_type;
                buttons += '<a class="btn btn-lev4" id="'+image_name+'" onclick="selected_template=\''+image_id+'\'; selected_template_name=\''+image_name+'\'; aqManaged=\''+image_list[selected_flavour][selected_release][selected_type][id].aqManaged+'\'; draw_buttons();">'+image_name+'</a>';
                controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_type=\'\'; aqManaged=\'\'; draw_buttons();">Back</a>';
            }
        }
    }

    else {
        $('#pick-resources').show();
        buttons = 'Complete!<br> You chose ' + selected_template_name + '. ' + image_description + 'This has a minimum disk requirement of ' + image_min_disk + 'GB' + ' and a minimum RAM requirement of ' + image_min_ram + 'GB';
        controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_template=\'\'; selected_template_name=\'\'; selected_template_description=\'\'; draw_buttons(); hide_resources();">Back</a>';
        pick_resources(flavorList);
    }
    $('#buttonbox').html(buttons);
    $('#helpbox').html(helptext);
    $('#controlbox').html(controls);
}
