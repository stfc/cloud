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

    var cpu_values = [biggestCPUAmount, availablequotacpu]
    var mem_values = [biggestRAMAmount, availablequotamem]
 
    cpu_values = cpu_values.filter(function(n){ return n != undefined && n >= 0});
    mem_values = mem_values.filter(function(n){ return n != undefined && n >= 0});

    var max_cpu = Math.min.apply(Math, cpu_values);
    var max_mem = Math.min.apply(Math, mem_values);
    var max_disk = biggestDiskAmount;

    $('#flavorBarCPU').css('width',    ( ((flavorList['data'][i]['cpu'] / max_cpu) * 100) + '%'));
    $('#flavorBarMemory').css('width', ( ((flavorList['data'][i]['ram'] / max_mem) * 100) + '%'));
    $('#flavorBarDisk').css('width',   ( ((flavorList['data'][i]['disk'] / max_disk) * 100) + '%'));

    $('#flavorMaxCPU').text(flavorList['data'][i]['cpu'] + "/" + max_cpu);
    $('#flavorMaxMemory').text(flavorList['data'][i]['ram'] + "GB/" + max_mem + "GB");
    $('#flavorMaxDisk').text(flavorList['data'][i]['disk'] + "GB/" + max_disk + "GB");

}
