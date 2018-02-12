$(function() {
    $('#sshform').submit(function() {
        var key = $("#sshkey").val();
        document.getElementById('submitkey').disabled = true;

        var keyname = $('#keynameLabel').attr('value');
        $.ajax({
            type: "POST",
            url: "/api/user",
            data: { 'action' : 'sshkey', 'key' : key, 'keyname' : keyname },
            statusCode: {
                400: function(data) {
                    // data.statusText - this is the error message passed when Cherrypy raises a HTTP error
                    $("#errormessage").html(data.statusText);
                    $("#error").show();
                    document.getElementById('submitkey').disabled = false;
                },
                500: function(data) {
                    $("#errormessage").html(data.statusText);
                    $("#error").show();
                    document.getElementById('submitkey').disabled = false;
                }
            }
        }).done(function(json) {
            $("#successmessage").html("Your SSH key has been sucessfully associated to your account");
            $("#success").show();
            document.getElementById('submitkey').disabled = false;            
        });

        return false;
    });
});
