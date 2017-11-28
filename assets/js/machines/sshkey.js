$(function() {
    $('#sshform').submit(function() {
        var key = $("#sshkey").val();
        document.getElementById('submitkey').disabled = true;
        if (key === "") {
            key = "\n";
        }
       var keyname = $('#keynameLabel').attr('value');
        $.ajax({
            type: "POST",
            url: "/api/user",
            data: { 'action' : 'sshkey', 'key' : key, 'keyname' : keyname },
            statusCode: {
                400: function() {
                    $("#errormessage").html("You cannot submit a blank public key. Please insert a valid public key into the text area.");
                    $("#error").show();
                    document.getElementById('submitkey').disabled = false;
                },
                409: function() {
                    $("#errormessage").html("You have tried to submit an invalid public key, try again.");
                    $("#error").show();
                    document.getElementById('submitkey').disabled = false;
                },
                500: function(data) {
                    alert(JSON.stringify(data))

                    $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
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
