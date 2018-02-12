/*jshint esversion: 6 */
function pick_aquilon() {
    var user;
    var sandbox;
    var archetype;
    var personality;
    $('#aquilon-select').css('display', 'table');
    $('#sandbox_options').attr('disabled', true);
    $('#personality_options').attr('disabled', true);
    $('#pick-resources').show();

    // User
    $.get('/aquilon/user', function(user_list) {
        user_list = user_list.split('\n');
        $('#user_options').html('<option value="">None Selected</option>');
        for (user of user_list) {
            $('#user_options').append('<option value="' + user + '">' + user + '</option>');
        }

        // Sandbox
        $('#sandbox_options').html('<option value="">None Selected</option>');
        $('#user_options').change(function () {
            $('#sandbox_options').attr('disabled', true);
            selected_archetype = $('#user_options').val();
            $.get('/aquilon/find/sandbox?owner='+selected_archetype, function(sandbox_list) {
                sandbox_list = sandbox_list.split('\n');
                sandbox_options = [];
                for (sandbox of sandbox_list) {
                    sandbox_options.push(sandbox.split('@', 1)[0]);
                }
                $('#sandbox_options').html('<option value="">None Selected</option>');
                for (sandbox of sandbox_options) {
                    if (sandbox) {
                        $('#sandbox_options').append('<option value="' + $('#user_options').val() +'/' + sandbox + '">' + sandbox + '</option>');
                    }
                }
                $('#sandbox_options').removeAttr('disabled');
            });
        });
    });

    // Archetype
    $.get('/aquilon/archetype', function(archetype_list) {
        archetype_list = archetype_list.split('\n');
        archetype_options = [];
        for (archetype of archetype_list) {
            if (archetype.startsWith('Host Archetype:')) {
                archetype_options.push(archetype.split(' ')[2]);
            }
        }

        $('#archetype_options').html('<option value="">None Selected</option>');
        for (archetype of archetype_options) {
            if (archetype) {
                $('#archetype_options').append('<option value="' + archetype + '">' + archetype + '</option>');
            }
        }

        // Personality
        $('#personality_options').html('<option value="">None Selected</option>');
        $('#archetype_options').change(function () {
            $('#personality_options').attr('disabled', true);
            selected_archetype = $('#archetype_options').val();
            $.get('/aquilon/find/personality?archetype='+selected_archetype, function(personality_list) {
                personality_list = personality_list.split('\n');
                personality_options = [];
                for (personality of personality_list) {
                    personality_options.push(personality.split(/^[^\/]+\//, 2)[1]);
                }
                $('#personality_options').html('<option value="">None Selected</option>');
                for (personality of personality_options) {
                    if (personality) {
                        $('#personality_options').append('<option value="' + personality + '">' + personality + '</option>');
                    }
                }
                $('#personality_options').removeAttr('disabled');
            });
        });
    });

    helptext = 'You have selected an Aquilon Managed machine, please select a User/Sandbox and Archetype/Personality';
    controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_type=\'\'; draw_buttons();">Back</a>';
}
