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
    $('#cpu-output').val(flavorList['data'][i]['cpu']);
    $('#cpu-input').val(flavorList['data'][i]['cpu']);
    $('#memory-output').val(flavorList['data'][i]['ram']);
    $('#memory-input').val(flavorList['data'][i]['ram']);
    $('#disk-output').val(flavorList['data'][i]['disk']);
    $('#disk-input').val(flavorList['data'][i]['disk']);
}

