"use strict";

function renameDialog(id, name)
{
    $('#renamedialog').modal('show');
    $('#rename').val(name);
    $('#rename-btn').attr('onclick','renameVm_check("' + id + '")');
    $('.count-field').hide();
    $('#rename-creation-error').hide();
}

function renameVm_check(id) {
    var name = $('#rename').val().replace(/[^a-z A-Z 0-9 .@_-]+/g, ' ');
    var badwords_url = '/assets/badwords';

    $.get(badwords_url, function(words) {
        var badwords = words.replace(/\r?\n|\r/g, '|').slice('|', -1);
        var regexp = new RegExp('(' + badwords + ')', 'g');

        // Check if name has any bad words
        if (name === '') {
            creation_error('rename-creation-error','Please enter a name.');
        } else if (name.match(regexp)) {
            creation_error('rename-creation-error', 'Please try a different name. "<b>'+ name +'</b>" contains blocked words.');
        } else {
            console.log("Rename to " + name);
            var rename = {id: id, name: name};
            renameVm(rename);
        }

    })
}

function renameVm(object) {
    $.ajax({
       type: 'PUT',
       url: '/api/rename',
       contentType: 'application/json',
       data: JSON.stringify(object),
       statusCode: {
            500: function(name) {
                creation_error('rename-creation-error', data.statusText);
            }
       }
    }).done(function(json) {
        drawTable(miscAction);
        quota.update();
        $('#renamedialog').modal('hide');
    });
}	




