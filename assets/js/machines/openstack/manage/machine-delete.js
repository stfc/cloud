function deleteVMdialog(id, name)
{
    $('#confirmdelete').data('vmid', id);
    $('#deletevmdialog').modal('show');
    $('#name-to-del').html(name);
}

function deleteVM()
{
    var id = $('#confirmdelete').data('vmid');
    document.getElementById('confirmdelete').disabled = true;

    $.ajax({
        type: 'DELETE',
        url: '/api/vm?' + $.param({'id': id}),
        statusCode: {
            403: function() {
                exceptions("403");
                document.getElementById('confirmdelete').disabled = false;
            },
            500: function(data) {
                $('#errormessage').html(data.statusText);
                $('#error').show();
                document.getElementById('confirmdelete').disabled = false;
            }
        }
    }).done(function(json) {
        document.getElementById('confirmdelete').disabled = false;
        drawTable(vmDeleted);
        quota.update();
    }).always(function(json) {
        $('#deletevmdialog').modal('hide');
    });
}
