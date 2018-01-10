function deleteVMdialog(id, name)
{
    $('#confirmdelete').data('vmid', id);
    $('#deletevmdialog').modal('show');
    $('#name-to-del').html(name);
}

function deleteVM()
{
    var id = $('#confirmdelete').data('vmid');

    $.ajax({
        type: 'DELETE',
        url: '/api/vm?' + $.param({'id': id}),
        statusCode: {
            403: function() {
                exceptions("403");
            },
            500: function(data) {
                $('#errormessage').html('The cloud may be experiencing problems. Please try again later.');
                $('#error').show();
            }
        }
    }).done(function(json) {
        drawTable();
        quota.update();
    }).always(function(json) {
        $('#deletevmdialog').modal('hide');
    });
}
