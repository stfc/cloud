var quota = {
    quota: 0,
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
        }).done(function(json_out) {

            for (var key in json_out) {
                if (json_out[key] < 0) {
                    json_out[key] = "<span style='font-size:14px'>&infin;</span>";
                }
            }

            // Structure
            userquotavm = json_out["userquotavm"];
            userquotacpu = json_out["userquotacpu"];
            userquotamem = json_out["userquotamem"];
            userquotasys = json_out["userquotasys"];

            userusedvm = json_out["userusedvm"];
            userusedcpu = json_out["userusedcpu"];
            userusedmem = json_out["userusedmem"];
            userusedsys = json_out["userusedsys"];

            groupquotavm = json_out["groupquotavm"];
            groupquotacpu = json_out["groupquotacpu"];
            groupquotamem = json_out["groupquotamem"];
            groupquotasys = json_out["groupquotasys"];

            groupusedvm = json_out["groupusedvm"];
            groupusedcpu = json_out["groupusedcpu"];
            groupusedmem = json_out["groupusedmem"];
            groupusedsys = json_out["groupusedsys"];

            vmavailable = json_out["availablevm"];
            cpuavailable = json_out["availablecpu"];
            memavailable = json_out["availablemem"];
            sysavailable = json_out["availablesys"];

            $("#useable-resources").html([
                '<p>VMs: '+vmavailable+'</p>',
                '<p>CPU: '+cpuavailable+'</p>',
                '<p>Memory: '+memavailable+' GB</p>',
                '<p>Disk: '+sysavailable+' GB</p>'
            ]);
            $("#user-stats").html([
                '<p>VMs: '+userusedvm+' / '+userquotavm+'</p>',
                '<p>CPU: '+userusedcpu+' / '+userquotacpu+'</p>',
                '<p>Memory: '+userusedmem+' / '+userquotamem+' GB</p>',
                '<p>Disk: '+userusedsys+' / '+userquotasys+' GB</p>'
            ]);
            $("#group-stats").html([
                '<p>VMs: '+groupusedvm+' / '+groupquotavm+'</p>',
                '<p>CPU: '+groupusedcpu+' / '+groupquotacpu+'</p>',
                '<p>Memory: '+groupusedmem+' / '+groupquotamem+' GB</p>',
                '<p>Disk: '+groupusedsys+' / '+groupquotasys+' GB</p>'
            ]);

            // Sliders
            $('#cpu-input').attr('max', Math.floor(cpuavailable));
            $('#memory-input').attr('max', memavailable);

            $("#cpu-min").html("1");
            $("#cpu-max").html(Math.floor(cpuavailable));

            $("#mem-min").html("0.5 GB");
            $("#mem-max").html(memavailable + " GB");

            // Pagination
            drawPagination();
        });
    }
};
