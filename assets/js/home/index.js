$(function() {
    $('#carousel').carousel({
        interval: 18000
    });

    $(".dial").knob({
        'width'       : '150',
        'inputColor'  : '#999999',
        'fgColor'     : '#6897B3',
        'bgColor'     : '#EEEEEE',
        'min'         : '0',
        'max'         : '100',
        'thickness'   : '.03',
        'angleOffset' : '-140',
        'angleArc'    : '280',
        'readOnly'    : 'true',
        'fontWeight'  : '200',
        'format'      : function (value) {
           return value + '%';
        }
    });

    $.ajax({
        type: "GET",
        url: "/stats",
        dataType: "xml"
    }).done(function(data) {
        var cpu_total = $(data).find("cpu").find("total").text();
        var cpu_used = $(data).find("cpu").find("used").text();
        var mem_total = $(data).find("mem").find("total").text();
        var mem_used = $(data).find("mem").find("used").text();

        $("#cpu").val(Math.ceil((cpu_used/cpu_total)*100) + "%");
        $("#mem").val(Math.ceil((mem_used/mem_total)*100) + "%");

        $("#cpu_used").html(cpu_used/100);
        $("#cpu_total").html(cpu_total/100);

        $("#mem_used").html(Math.ceil(mem_used/1024/1024));
        $("#mem_total").html(Math.ceil(mem_total/1024/1024));

        $("#cpu").trigger('change');
        $("#mem").trigger('change');
    }).fail(function() {
        $("#cpu").val("0%")
        $("#mem").val("0%")
    });
});