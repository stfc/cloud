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
            loadingCount++;
            console.log(loadingCount);

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
            biggestRAMAmount = json_out["biggestRAMAmount"]/1024;

            // Setting sliders and dial data depending if quotas have limits
            $("#cpu-min").html("1");
            if (groupquotacpu === -1) {
                $("#cpu-max").html(biggestCPUAmount);
                $('#cpu-input').attr('max', biggestCPUAmount);
                maxCPUDial = 'No Limit';
            } else {
                $("#cpu-max").html(availablequotacpu);
                $('#cpu-input').attr('max', availablequotacpu);
                maxCPUDial = groupquotacpu;
            }

            $("#mem-min").html("1GB");
            if (groupquotamem === -1) {
                $("#mem-max").html(biggestRAMAmount + "GB");
                $('#memory-input').attr('max', biggestRAMAmount);
                maxRAMDial = 'No Limit';
            } else {
                $("#mem-max").html(availablequotamem + "GB");
                $('#memory-input').attr('max', availablequotamem);
                maxRAMDial = groupquotamem;
            }
 
            if (groupquotavm === -1) {
                maxVMDial = 'No Limit';
            } else {
                maxVMDial = groupquotavm;
            }

            $("#disk-min").html("1GB");
            $("#disk-max").html(biggestDiskAmount + "GB");
            $('#disk-input').attr('max', biggestDiskAmount);

            // Dial CSS data
            dial = {
                'inputColor'  : '#666',
                'fgColor'     : '#6897B3',
                'bgColor'     : '#EEEEEE',
                'min'         : '0',
                'readOnly'    : 'false',
                'width'       : '90%',
                'height'      : '70',
                'thickness'   : '.20',
                'dynamicDraw' : 'true',
                'displayMax'  : 'false'
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

            // Create function to return the elements
            maxElements = document.getElementsByClassName('max-display');
            if (maxElements.length == 0){
                // First time dials created in the session
                $('.group-vm').val(groupusedvm);
                $(".group-vm").knob($.extend({
                    'max': maxVMDial
                }, dial, colour_vm));

                $('.group-cpu').val(groupusedcpu);
                $(".group-cpu").knob($.extend({
                    'max': maxCPUDial
                }, dial, colour_cpu));

                $('.group-mem').val(groupusedmem);
                $('.group-mem').knob($.extend({
                    'max' : maxRAMDial
                }, dial, colour_mem));
 
                maxElements = document.getElementsByClassName('max-display');
                maxIDs = ['VM', 'CPU', 'RAM'];

                // What to do if maxValues.length is more than 3?
                // Shouldn't be possible really
                for (i = 0; i < maxElements.length; i++){
                    document.getElementsByClassName('max-display')[i].id = maxIDs[i];
                }
            } else {
                // Quota dials are being updated (due to new project or general refresh)
                maxElements = document.getElementsByClassName('max-display');
                for (i = 0; i < maxElements.length; i++){
                    if (maxElements[i].id == maxIDs[0]) {
                        updateMaxValue(maxVMDial, '.group-vm');
                    } 
                    if (maxElements[i].id == maxIDs[1]) {
                        updateMaxValue(maxCPUDial, '.group-cpu');
                    } 
                    if (maxElements[i].id == maxIDs[2]) {
                        updateMaxValue(maxRAMDial, '.group-mem');
                    }

                    for (j = 0; j < maxElements.length; j++){
                        // Delete unneeded elements added when configuring dials
                        if (maxElements[j].hasAttribute('id') == false){
                            document.getElementsByClassName('max-display')[j].remove();
                            // When element is deleted, j is decremented to reflect this in maxElements array
                            j -= 1
                        }
                    }
                }
            }
            
            updateDialValue(maxVMDial, '.group-vm', groupusedvm);
            updateDialValue(maxCPUDial, '.group-cpu', groupusedcpu);
            updateDialValue(maxRAMDial, '.group-mem', groupusedmem);
        });
    }
};

function updateMaxValue(maxDial, dialName){
    // If the new max. value is different to what's currently displaying
    if (maxElements[i].textContent != "of " + maxDial) {
        // Change text max. value (what user sees)
        maxElements[i].textContent = "of " + maxDial;
        // Change max. value on actual dial i.e. coloured 'pie chart' section
        $(dialName).trigger('configure', {
            'max' : maxDial,
        });
    }
}

function updateDialValue(maxDial, dialName, quotaValue){
    // Setting quota values - dependent on whether there is a limit on the quota
    // Using .trigger allows the actual dial to update when there's a change in value
    // If there is no limit, using .trigger means the actual value won't be displayed
    // .trigger isn't needed with no limit because the actual dial won't be filled
    if (maxDial == 'No Limit'){
        $(dialName).val(quotaValue);
    } else {
        $(dialName).val(quotaValue).trigger('change');
    }
}
