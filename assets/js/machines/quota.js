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

            // Structure
            groupquotavm = json_out["groupquotavm"];
            groupquotacpu = json_out["groupquotacpu"];
            groupquotamem = json_out["groupquotamem"];

            groupusedvm = json_out["groupusedvm"];
            groupusedcpu = Math.ceil(json_out["groupusedcpu"]);
            groupusedmem = json_out["groupusedmem"];

            availablequotavm = json_out["availablequotavm"];
            availablequotacpu = json_out["availablequotacpu"];
            availablequotamem = json_out["availablequotamem"];

            // Used for slider amounts if no limits on these quotas
            biggestDiskAmount = json_out["biggestDiskAmount"];
            biggestCPUAmount = json_out["biggestCPUAmount"];
            biggestRAMAmount = json_out["biggestRAMAmount"];

            // Setting sliders and dial data depending if quotas have limits
            $("#cpu-min").html("1");
            if (groupquotacpu === -1) {
                $("#cpu-max").html(biggestCPUAmount);
                $('#cpu-input').attr('max', biggestCPUAmount);
                maxCPUDial = 'No Limit'
            } else {
                $("#cpu-max").html(availablequotacpu);
                $('#cpu-input').attr('max', availablequotacpu);
                maxCPUDial = groupquotacpu
            }

            $("#mem-min").html("1GB");
            if (groupquotamem === -1) {
                $("#mem-max").html(biggestRAMAmount + "GB");
                $('#memory-input').attr('max', biggestRAMAmount);
                maxRAMDial = 'No Limit'
            } else {
                $("#mem-max").html(availablequotamem + "GB");
                $('#memory-input').attr('max', availablequotamem);
                maxRAMDial = groupquotamem
            }
 
            if (groupquotavm === -1) {
                maxVMDial = 'No Limit'
            } else {
                maxVMDial = groupquotavm
            }

            $("#disk-min").html("1GB");
            $("#disk-max").html(biggestDiskAmount + "GB");
            $('#disk-input').attr('max', biggestDiskAmount);


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


            $('.group-vm').val(groupusedvm);
            $(".group-vm").knob($.extend({
                'max': maxVMDial
            }, dial, colour_vm));

            $('.group-cpu').val(groupusedcpu);
            $(".group-cpu").knob($.extend({
                'max': maxCPUDial
            }, dial, colour_cpu));

            $('.group-mem').val(groupusedmem);
            $(".group-mem").knob($.extend({
                'max': maxRAMDial
            }, dial, colour_mem));
        });
    }
};
