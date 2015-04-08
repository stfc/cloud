var quota = {
    available: 0,
    used: 0,
    update: function () {
        $.ajax({
            type: "GET",
            url: "/api/quota",
            statusCode: {
                403: function() {
                    $.removeCookie('session', {path : '/'});
                    $.removeCookie('name', {path : '/'});
                    $.removeCookie('fedid', {path : '/'});
                    window.location.replace("/login");
                },
                500: function() {
                    $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                    $("#error").show();
                }
            }
        }).done(function(json) {
            quota.available = json["available"];
            quota.used = json["used"];

            drawPagination();

            if (quota.available <= 0) {
                $("#quota_vms").html("Unlimited");
            } else {
                $("#quota_vms").html(quota.available);
            }
            $("#quota_vms_used").html(quota.used);
        });
    }
}