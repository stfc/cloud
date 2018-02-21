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
//    $('#cpu-output').val(flavorList['data'][i]['cpu']);
//    $('#cpu-input').val(flavorList['data'][i]['cpu']);
//    $('#memory-output').val(flavorList['data'][i]['ram']);
//    $('#memory-input').val(flavorList['data'][i]['ram']);
//    $('#disk-output').val(flavorList['data'][i]['disk']);
//    $('#disk-input').val(flavorList['data'][i]['disk']);


// In theory, this block should use either quota limit or flavor limit, whichever is smallest
// There is currently no clause I know of for if the quota limit is less than the selected flavor

var max_cpu = biggestCPUAmount;
var max_mem = biggestRAMAmount;
var max_disk = biggestDiskAmount;

if (max_cpu == undefined || max_cpu > availablequotacpu){
    max_cpu = availablequotacpu;
};

if (max_mem == undefined || max_mem > availablequotamem){
    max_mem = availablequotamem;
};

//if (max_disk == undefined || max_disk > availablequotadisk){
//    max_disk = availablequotadisk;
//};





    $('#flavorBarCPU').css('width',    ( ((flavorList['data'][i]['cpu'] / max_cpu) * 100) + '%'));
    $('#flavorBarMemory').css('width', ( ((flavorList['data'][i]['ram'] / max_mem) * 100) + '%'));
    $('#flavorBarDisk').css('width',   ( ((flavorList['data'][i]['disk'] / max_disk) * 100) + '%'));

    $('#flavorMaxCPU').text(flavorList['data'][i]['cpu'] + "/" + max_cpu);
    $('#flavorMaxMemory').text(flavorList['data'][i]['ram'] + "GB/" + max_mem + "GB");
    $('#flavorMaxDisk').text(flavorList['data'][i]['disk'] + "GB/" + max_disk + "GB");


}

