function bootVM(id) {
    $.ajax({
        type: 'POST',
        url: '/api/vm',
        data: { 'action' : 'boot', 'id' : id },
        statusCode: {
            500: function(data) {
                $('#errormessage').html(data.statusText);
                $('#error').show();
            }
        }
    }).done(function(json) {
        drawTable(miscAction);
    });
}
