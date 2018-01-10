$(function() {
    $('#sshform').submit(function() {
        var key = $("#sshkey").val();
        if (key === "") {
            key = "\n";
        }
        $.ajax({
            type: "POST",
            url: "/api/user",
            data: { 'action' : 'sshkey', 'key' : key },
            statusCode: {
                500: function(data) {
                    alert(JSON.stringify(data))

                    $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                    $("#error").show();
                }
            }
        }).done(function(json) {
            $("#successmessage").html("Your SSH key has been sucessfully associated to your account");
            $("#success").show();
        });

        return false;
    });
});
