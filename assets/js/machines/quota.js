var quota = {
    quota: 0,
    used: 0,
    update: function () {
        $.ajax({
            type: "GET",
            url: "/api/quota",
            statusCode: {
                403: function() {
                    Cookie.remove('session', {path : '/'});
                    Cookie.remove('name', {path : '/'});
                    Cookie.remove('fedid', {path : '/'});
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

            // Sliders
            $('#cpu-input').attr('max', Math.floor(cpuavailable));
            $('#memory-input').attr('max', memavailable);

            $("#cpu-min").html("1");
            $("#cpu-max").html(Math.floor(cpuavailable));

            $("#mem-min").html("0.5 GB");
            $("#mem-max").html(memavailable + " GB");

            dial = {
                'inputColor'  : '#666',
                'fgColor'     : '#6897B3',
                'bgColor'     : '#EEEEEE',
                'min'         : '0',
                'readOnly'    : 'true',
                'width'       : '70',
                'height'      : '70',
                'thickness'   : '.20',
            };

            colour_vm = {
                'inputColor'  : '#ef4600',
                'fgColor'     : '#ef4600'
            };
            colour_cpu = {
                'inputColor'  : '#00a056',
                'fgColor'     : '#00a056'
            };
            colour_mem = {
                'inputColor'  : '#0053b4',
                'fgColor'     : '#0053b4'
            };
            colour_sys = {
                'inputColor'  : '#b40053',
                'fgColor'     : '#b40053'
            };

            // Available
            $('.available-vm').val(vmavailable).trigger('change');
            $(".available-vm").knob($.extend({
                'max': vmavailable
            }, dial, colour_vm));

            $('.available-cpu').val(cpuavailable).trigger('change');
            $(".available-cpu").knob($.extend({
                'max': cpuavailable
            }, dial, colour_cpu));

            $('.available-mem').val(memavailable).trigger('change');
            $(".available-mem").knob($.extend({
                'max': memavailable
            }, dial, colour_mem));

            $('.available-sys').val(sysavailable).trigger('change');
            $(".available-sys").knob($.extend({
                'max': sysavailable
            }, dial, colour_sys));

            // User
            $('.user-vm').val(userusedvm).trigger('change');
            $(".user-vm").knob($.extend({
                'max': userquotavm,
                'format'      : function (value) {
                    return value + "/" + userquotavm;
                }
            }, dial, colour_vm));

            $('.user-cpu').val(userusedcpu).trigger('change');
            $(".user-cpu").knob($.extend({
                'max': userquotacpu,
                'format'      : function (value) {
                    return value + '/' + userquotacpu;
                }
            }, dial, colour_cpu));

            $('.user-mem').val(userusedmem).trigger('change');
            $(".user-mem").knob($.extend({
                'max': userquotamem,
                'format'      : function (value) {
                    return value + '/GB' + userquotamem;
                }
            }, dial, colour_mem));

            $('.user-sys').val(userusedsys).trigger('change');
            $(".user-sys").knob($.extend({
                'max': userquotasys,
                'format'      : function (value) {
                    return value + '/' + userquotasys + 'GB';
                }
            }, dial, colour_sys));

            // Group
            $('.group-vm').val(groupusedvm).trigger('change');
            $(".group-vm").knob($.extend({
                'max': groupquotavm,
                'format'      : function (value) {
                    return value + '/' + groupquotavm;
                }
            }, dial, colour_vm));

            $('.group-cpu').val(groupusedcpu).trigger('change');
            $(".group-cpu").knob($.extend({
                'max': groupquotacpu,
                'format'      : function (value) {
                    return value + '/' + groupquotacpu;
                }
            }, dial, colour_cpu));

            $('.group-mem').val(groupusedmem).trigger('change');
            $(".group-mem").knob($.extend({
                'max': groupquotamem,
                'format'      : function (value) {
                    return value + '/' + groupquotamem;
                }
            }, dial, colour_mem));

            $('.group-sys').val(groupusedsys).trigger('change');
            $(".group-sys").knob($.extend({
                'max': groupquotasys,
                'format'      : function (value) {
                    return value + '/' + groupquotasys + 'GB';
                }
            }, dial, colour_sys));
        });
    }
};
