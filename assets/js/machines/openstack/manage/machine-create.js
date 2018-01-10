// Error handler
function creation_error(id, text) {
    icon = '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ';
    body = '<span>' + text + '</span><br>';
    $('#' + id).append(icon + body).show();
}

// Set defaults when modal opened
function createVMdialog() {
    $('.creation-error').hide(); // Hide all errors
    $('#create-btn').attr('onclick', 'fetch_values(selected_template)').css('cursor', 'pointer');

    // Set name and all template options to empty
    $('#name').val('');
    selected_flavour = '';
    selected_release = '';
    selected_type = '';
    selected_template = '';
    draw_buttons();

    // templatelist
    $('#pick-resources').hide();
    $('#cpu-input').val('1');
    $('#cpu-output').val('1');
    $('#memory-input').val('0.5');
    $('#memory-output').val('0.5');
    // Show modal window
    $('#createvmdialog').modal('show');
}

// Populate name field with random name
function randomname() {
    $.get('/machines/random', function(data) {
        $('#name').val(data);
    });
}

// Populate array to send to /api/vm.py - Triggered by 'create' button
function fetch_values(selected_template) {
    // Clear and hide on to reset errors
    $('.creation-error').empty().hide();
    cpu = $('#cpu-input').val();
    memory = $('#memory-input').val()*1024;

    var data = {
        // 'name' gets added if check_errors() is happy
        'template_id': selected_template,
        'archetype': $('#archetype_options').val(),
        'personality': $('#personality_options').val(),
        'sandbox': $('#sandbox_options').val(),
        'cpu': '' + cpu,
        'memory': '' + memory,
        'flavorID': flavorList['data'][document.getElementById("flavorChoice").value]['id'],
        'count': $('#vmCount').val(),
    };
    check_errors(data, selected_template);
}

// Check the VM name for blocked words and other errors
function check_errors(data, selected_template) {
    badwords_url = '/assets/badwords';

    print_name = $('#name').val().replace(/[^a-z A-Z 0-9 .@_-]+/g, ' ');
    name = print_name.toLowerCase();

    $.get(badwords_url, function(words) {
        data['name'] = 'badname';

        // Remove new lines and replace with | then cut off the last |
        badwords = words.replace(/\r?\n|\r/g, '|').slice('|', -1);
        regexp = new RegExp('(' + badwords + ')', 'g');

        var count = true;
        // Check if name has any bad words
        if (name.match(regexp)) {
            creation_error('name-creation-error', 'Please try a different name. "<b>'+ print_name +'</b>" contains blocked words.');
        } else {
            data['name'] = print_name;
        }

        // Show warning if no name
        if (data['name'] === '') {
            creation_error('name-creation-error','Please enter a name.');
        }
 
        // Show warning if no count
        if (data['count'] === '') {
            creation_error('name-creation-error', 'Please enter how many VMs you want to create.');
            count = false;
        }

        // Show warning if count is 0
        if (data['count'] < 1 && data['count'] !== '') {
            creation_error('name-creation-error', 'You cannot have less than 1 VM, enter the number of VMs you want to create.');
            count = false;
        }

        // Show warning if no template
        if (selected_template === '') {
            creation_error('template-creation-error','Please enter a Template.');
        }

        // Show warning if no resources
        if ((availablequotavm > 0 || groupquotavm === -1) && (availablequotacpu > 0 || groupquotacpu === -1) && (availablequotamem > 0 || groupquotamem === -1)) {
            resources = true;
        } else {
            creation_error('resource-creation-error','You do not have the resources to create a new VM. Please delete uneeded VMs or contact us to discuss your quota.');
        }

        // If all fields are good send data to /api/vm.py
        if (data['name'].length > 0 && data['name'] !== 'badname' && selected_template.length > 0 && resources === true && count === true) {
            // Disable 'Create' button - no errors
            document.getElementById('create-btn').disabled = true;
            create_VM(data);
        }
    });
}

// Create VM
function create_VM(data) {
    $.ajax({
        type: 'PUT',
        url: '/api/vm',
        contentType: 'application/json',
        data: JSON.stringify(data),
        statusCode: {
            400: function(data) {
                creation_error('main-creation-error', data.statusText);
                document.getElementById('create-btn').disabled = false;
            },
            403: function() {
                exceptions("403");
                document.getElementById('create-btn').disabled = false;
            },
            500: function(data) {
                creation_error('main-creation-error', data.statusText);
                document.getElementById('create-btn').disabled = false;
            }
        }
    }).done(function(json) {
        drawTable(miscAction);
        quota.update();
        // Enable create button so multiple VMs can be created in one session
        document.getElementById('create-btn').disabled = false;
        $('#createvmdialog').modal('hide');
    });
}
