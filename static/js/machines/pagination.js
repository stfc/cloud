var pagination;

var offset = 0;
var numvms = 0;
var pagesize = 10;

function drawPagination(page)
{
    // when redrawing, stay on current page unless directed otherwise
    var p = (pagination != undefined ? pagination.a['page'] : 1);
    if (page != undefined) {
        p = page;
    }

    // the number of vms used is taken from quota
    pagination = $(".pagination").paging(quota.used, {
        format: '[< ncn >]',
        perpage: pagesize,
        lapping: 0,
        page: p,
        onSelect: function (page) {
            offset = this.slice[0];
            drawTable(miscAction);
        },
        onFormat: function (type) {
            switch (type) {
            case 'block':
                if (this.value != this.page) {
                    return '<li><a href="#">' + this.value + '</a></li>';
                } else {
                    return '<li class="active"><a href="#">' + this.value + '</a></li>';
                }
            case 'next':
                return '<li><a href="#">&gt;</a></li>';
            case 'prev':
                return '<li><a href="#">&lt;</a></li>';
            case 'first':
                return '<li><a href="#">first</a></li>';
            case 'last':
                return '<li><a href="#">last</a></li>';
            }
        }
    });
}
