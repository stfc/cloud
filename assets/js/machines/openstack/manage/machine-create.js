// Error handler
function creation_error(id, text) {
    icon = '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ';
    body = '<span>' + text + '</span><br>';
    $('#' + id).append(icon + body).show();
}

// Set defaults when modal opened
function createVMdialog() {
    $('.creation-error').hide(); // Hide all errors
    $('#create-btn').attr('disabled', '');
    $('#create-btn').attr('onclick', 'fetch_values(selected_template)');

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
        $('#rename').val(data);
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
        'template_id'  : selected_template,
        'cpu'          : '' + cpu,
        'memory'       : '' + memory,
        'flavorID'     : flavorList['data'][document.getElementById("flavorChoice").value]['id'],
        'count'        : $('#vmCount').val(),
    };

    if (aqManaged == 'true') {
        if ($('#archetype_options').val() !== '') {
            data['archetype'] = $('#archetype_options').val()
        }
        if ($('#personality_options').val() !== '') {
            data['personality'] = $('#personality_options').val()
        }
        if ($('#sandbox_options').val() !== '') {
            data['sandbox'] = $('#sandbox_options').val()
        }
    }
    check_errors(data, selected_template);
}

// Check the VM name for blocked words and other errors
function check_errors(data, selected_template) {
    badwords_url = '/assets/badwords';

    print_name = $('#name').val().replace(/[^a-z A-Z 0-9 .@_-]+/g, ' ');
    name = print_name.toLowerCase();

    $.get(badwords_url, function(words) {
        check = {
            'name'      : false,
            'count'     : false,
            'template'  : false,
            'resources' : false,
        }

        data['name'] = 'badname';


        // Remove new lines and replace with | then cut off the last |
        badwords = words.replace(/\r?\n|\r/g, '|').slice('|', -1);
        regexp = new RegExp('(' + badwords + ')', 'g');


        // Check Name
        if (name === '') {
            // Name field is empty
            creation_error('name-creation-error','Please enter a name.');
        }
        else if (name.match(regexp)) {
            // Name contains badwords
            creation_error('name-creation-error', 'Please try a different name. "<b>'+ print_name +'</b>" contains blocked words.');
        }
        else {
            // Name is approved
            data['name'] = print_name;
            check['name'] = true;
        }

 
        // Check Count
        if (data['count'] === '') {
            // Show warning if no count
            creation_error('name-creation-error', 'Please enter how many VMs you want to create.');
        }
        else if (data['count'] < 1 && data['count'] !== '') {
            // Show warning if count is < 1
            creation_error('name-creation-error', 'You cannot have less than 1 VM, enter the number of VMs you want to create.');
        }
        else if (data['count'] > availablequotavm && groupquotavm !== -1) {
            // Show Warning if count is > quota
            creation_error('name-creation-error','You do not have the quota to create ' + data['count'] + ' VMs');
        } 
        else if (data['count'] > count_limit && groupquotavm === -1) {
            // Limit numbers of VMs created at once in unlimited quotas
            creation_error('name-creation-error','You cannot create more than ' + count_limit + ' VMs at one time');
        } else {
            // Count Approved
            check['count'] = true;
        }


        // Check Template
        if (selected_template === '') {
            // Show warning if no template
            creation_error('template-creation-error','Please enter a Template.');
        }
        else if ((data['archetype'] !== undefined) && (data['personality'] === undefined)) {
            // Archetype selected but personality not
            creation_error('template-creation-error','Please select personality or deselect archetype');
        }
        else if ((aqManaged == 'true') && ($('#user_options').val() !== '') && (data['sandbox'] === undefined)) {
            // User selected but sandbox not
            creation_error('template-creation-error','Please select sandbox or deselect user');
        }
        else {
            // Template Approved
            check['template'] = true;
        }


        // Check Resources
        if ((availablequotavm > 0 || groupquotavm === -1) && (availablequotacpu > 0 || groupquotacpu === -1) && (availablequotamem > 0 || groupquotamem === -1)) {
            // Resources approved
            check['resources'] = true;
        } else {
            // Show warning if no resources
            creation_error('resource-creation-error','You do not have the resources to create a new VM. Please delete uneeded VMs or contact us to discuss your quota.');
        }

        // If all fields are good send data to /api/vm.py
        if (Object.values(check).includes(false) === false) {
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
