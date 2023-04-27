function pick_resources(flavorList) {
    var flavorDisplay = '<select id="flavorChoice" class="btn btn-default btn-xs" onchange="setSliderAmounts(flavorList, false);">'
    setSliderAmounts(flavorList, true);

    for (i = 0; i < flavorList['data'].length; i++){
        flavorDisplay += '<option value=\"' + i + '\">' 
            + flavorList['data'][i]['name'] + ' - ' 
            + flavorList['data'][i]['cpu'] + 'CPU(s), '
            + flavorList['data'][i]['ram'] + 'GB RAM, '
            + flavorList['data'][i]['disk'] + 'GB Total Disk'
            + '</option>';
    }
    flavorDisplay += '</select>'
    $('#flavorDisplay').html(flavorDisplay);
}

function setSliderAmounts(flavorList, starter){
    var i = 0;
    if(starter == false){
        i = document.getElementById("flavorChoice").value;
    }

    $('#create-btn').removeAttr('disabled');

    if ($('#vmCount').val() >= 1 ) {
        var r_vms = $('#vmCount').val();
    } else {
        var r_vms = 1;
    }
    
    var r_cpu =  flavorList['data'][i]['cpu'] * r_vms;
    var r_mem =  flavorList['data'][i]['ram'] * r_vms;
    var r_disk = flavorList['data'][i]['disk'] * r_vms;

    var vms_values =  [availablequotavm]
    var cpu_values =  [biggestCPUAmount * r_vms, availablequotacpu]
    var mem_values =  [biggestRAMAmount * r_vms, availablequotamem]
    var disk_values = [biggestDiskAmount * r_vms]
 
    vms_values =   vms_values.filter(function(n){ return n != undefined && n >= 0});
    cpu_values =   cpu_values.filter(function(n){ return n != undefined && n >= 0});
    mem_values =   mem_values.filter(function(n){ return n != undefined && n >= 0});
    disk_values = disk_values.filter(function(n){ return n != undefined && n >= 0});

    var max_vms =  Math.min.apply(Math, vms_values);
    var max_cpu =  Math.min.apply(Math, cpu_values);
    var max_mem =  Math.min.apply(Math, mem_values);
    var max_disk = Math.min.apply(Math, disk_values);

    fillBar('vms',  r_vms,  max_vms);
    fillBar('cpu',  r_cpu,  max_cpu);
    fillBar('mem',  r_mem,  max_mem);
    fillBar('disk', r_disk, max_disk);
}

function fillBar(resource, request, max) {

    if (request <= max) {
        x = (request / max) * 100;
        $('#flavorMax-' + resource).css('color', '');
    } else {
        x = 100;
        $('#flavorMax-' + resource).css('color', 'red');
        $('#create-btn').prop('disabled', true);
    }      

    $('#flavorBar-' + resource).css('width',(x + '%'));
    $('#flavorMax-' + resource).text(request + "/" + max);
}

