$(function() {
    $('#loginform').submit(function() {
        var data = {
            "username" : $("#username").val(),
            "password" : $("#password").val()
        };

        $.ajax({
            type: "PUT",
            url: "/api/user",
            contentType: "application/json",
            data: JSON.stringify(data),
            statusCode: {
                400: function() {
                    $("#errormessage").html("Please enter your Federal ID and password.");
                    $("#error").show();
                },
                403: function() {
                    $("#errormessage").html("Incorrect username and/or password.");
                    $("#error").show();
                },
                500: function() {
                    $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                    $("#error").show();
                }
            }
        }).done(function(json) {
            var date = new Date();
            date.setTime(date.getTime() + (json["expires"] * 1000));
            Cookies.set("session", json["session"], {expires : date, path : '/'});
            Cookies.set("name", json["name"], {expires : date, path : '/'});
            Cookies.set("fedid", json["fedid"], {expires : date, path : '/'});
            window.location.replace("/machines");
        });

        return false;
    });
});
