var quota = {
    quota: 0,
    used: 0,
    update: function () {
        $.ajax({
            type: "GET",
            url: "/api/quota",
            statusCode: {
                403: function() {
                    exceptions("403");
                },
                500: function() {
                    $("#errormessage").html("The cloud may be experiencing problems. Please try again later.");
                    $("#error").show();
                    $('#resources').hide();
                }
            }
        }).done(function(json_out) {

            $('#resources').show();

            for (var key in json_out) {
                if (json_out[key] < 0) {
                    json_out[key] = 0;
                }
            }

            // Structure
            userquotavm = json_out["userquotavm"];
            userquotacpu = json_out["userquotacpu"];
            userquotamem = json_out["userquotamem"];

            userusedvm = json_out["userusedvm"];
            userusedcpu = Math.ceil(json_out["userusedcpu"]);
            userusedmem = json_out["userusedmem"];

            groupusedvm = json_out["groupusedvm"];
            groupusedcpu = Math.ceil(json_out["groupusedcpu"]);
            groupusedmem = json_out["groupusedmem"];

            vmavailable = json_out["availablevm"];
            cpuavailable = json_out["availablecpu"]|0;
            memavailable = json_out["availablemem"];

            availablequotavm = json_out["availablequotavm"];
            availablequotacpu = json_out["availablequotacpu"];
            availablequotamem = json_out["availablequotamem"];

            // Sliders
            $('#cpu-input').attr('max', cpuavailable);
            $('#memory-input').attr('max', memavailable);

            $("#cpu-min").html("1");
            $("#cpu-max").html(cpuavailable);

            $("#mem-min").html("0.5 GB");
            $("#mem-max").html(memavailable + " GB");

            dial = {
                'inputColor'  : '#666',
                'fgColor'     : '#6897B3',
                'bgColor'     : '#EEEEEE',
                'min'         : '0',
                'readOnly'    : 'true',
                'width'       : '90%',
                'height'      : '70',
                'thickness'   : '.20',
                'displayMax'  : 'true'
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

            // Available
            $('.available-vm').val(vmavailable).trigger('change');
            $(".available-vm").knob($.extend({
                'max': availablequotavm,
                'rotation': 'anticlockwise'
            }, dial, colour_vm));

            $('.available-cpu').val(cpuavailable).trigger('change');
            $(".available-cpu").knob($.extend({
                'max': availablequotacpu,
                'rotation': 'anticlockwise'
            }, dial, colour_cpu));

            $('.available-mem').val(memavailable).trigger('change');
            $(".available-mem").knob($.extend({
                'max': availablequotamem,
                'rotation': 'anticlockwise'
            }, dial, colour_mem));

            // User
            $('.user-vm').val(userusedvm).trigger('change');
            $(".user-vm").knob($.extend({
                'max': userquotavm
            }, dial, colour_vm));

            $('.user-cpu').val(userusedcpu).trigger('change');
            $(".user-cpu").knob($.extend({
                'max': userquotacpu
            }, dial, colour_cpu));

            $('.user-mem').val(userusedmem).trigger('change');
            $(".user-mem").knob($.extend({
                'max': userquotamem
            }, dial, colour_mem));
        });
    }
};
