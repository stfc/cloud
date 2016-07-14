function pick_aquilon() {
    var i;
    $('#aquilon-select').css('display', 'table');

    // User
    $.get('/aquilon/principal.csv', function(data) {
        data = data.split('\n');
        user_options = [];
        for (u of data) {
            user_options.push(u.split('@', 1)[0]);
        }
        $('#user_options').html('<option value="">None Selected</option>');
        for (u of user_options) {
            if (u && !u.startsWith('HTTP')) {
                $('#user_options').append('<option value="' + u + '">' + u + '</option>');
            }
        }

        // Sandbox
        $('#sandbox_options').html('<option value="">None Selected</option>');
        $('#user_options').change(function () {
            selected_archetype = $('#user_options').val();
            $.get('/aquilon/find/sandbox?owner='+selected_archetype, function(data) {
                data = data.split('\n');
                sandbox_options = [];
                for (s of data) {
                    sandbox_options.push(s.split('@', 1)[0]);
                }
                $('#sandbox_options').html('<option value="">None Selected</option>');
                for (s of sandbox_options) {
                    if (s) {
                        $('#sandbox_options').append('<option value="' + $('#user_options').val() +'/' + s + '">' + s + '</option>');
                    }
                }
            });
        });
    });

    // Archetype
    $.get('/aquilon/archetype', function(data) {
        data =  data.match(/Host Archetype: .* /g);
        archetype_options = [];
        for (a of data) {
            b = a.replace('Host Archetype: ','');
            archetype_options.push(b.split('@', 1)[0]);
        }
        $('#archetype_options').html('<option value="">None Selected</option>');
        for (a of archetype_options) {
            if (a) {
                $('#archetype_options').append('<option value="' + a + '">' + a + '</option>');
            }
        }

        // Personality
        $('#personality_options').html('<option value="">None Selected</option>');
        $('#archetype_options').change(function () {
            selected_archetype = $('#archetype_options').val();
            $.get('/aquilon/personality?archetype='+selected_archetype, function(data) {
                data = data.match(/Host Personality: .* Archetype/g);
                personality_options = [];
                for (p of data) {
                    q = p.replace('Host Personality: ','').replace(' Archetype','')
                    personality_options.push(q.split('@', 1)[0]);
                }
                $('#personality_options').html('<option value="">None Selected</option>');
                for (p of personality_options) {
                    if (p) {
                        $('#personality_options').append('<option value="' + p + '">' + p + '</option>');
                    }
                }
            });
        });
    });

    helptext = 'You have selected an Aquilon Managed machine, please select a User/Sandbox and Archetype/Personality';
    controls = '<a class="btn btn-danger" id="buttonback" onclick="selected_type=\'\'; draw_buttons();">Back</a>';
}
