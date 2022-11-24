/* DataTable */

$(document).ready( function () {
    const logsTable = $('#logsTable');
    const groupsConfig = logsTable.data('groups-config');

    const textFormat = (value) => { return value; }
    const jsonFormat = (value) => {
        let formattedValue = JSON.parse(value);
        if (typeof formattedValue === 'object' && !Array.isArray(formattedValue)) {
            return '<pre>'+JSON.stringify(formattedValue)+'</pre>';
        }
        return '<pre>'+formattedValue+'</pre>';
    }

    const format = (value, type) => {
        switch (type) {
            case 'json': return jsonFormat(value);
            case 'text':
            default: return textFormat(value);
        }
    }

    let columns = [];
    Object.keys(groupsConfig).forEach((groupName) => {
        columns.push({
            'data': groupName,
            'render': function(value) {
                return format(value, groupsConfig[groupName].type)
            }
        })
    });

    var datatableOptions = {
        "processing": true,
        "serverSide": false,
        "search": {
            "caseInsensitive": true
        },
        "ajax": {
            url: logsTable.data('remote-url'),
            dataSrc: '',
            dataType: "json",
            error: function (xhr, error, thrown) {
                console.log(error)
            }
        },
        "language": {
            processing: '<i class="fas fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        "order": [[ 0, "desc" ]],
        "columnDefs": [
            {
                "targets": "no-sort",
                "orderable": false,
            },
            {
                "className": "border border-gray-400 whitespace-nowrap",
                "targets": 0,
            },
            {
                "className": "border border-gray-400",
                "targets": "_all"
            }
        ],
        "columns": columns
    };
    var logsDataTable = logsTable.DataTable(datatableOptions);

    /* Toggle filters */

    const toggleFilter = document.querySelector('#toggle');
    const toggleable = document.querySelectorAll('.toggleable');
    const btnFilter = document.querySelector('#apply-filter');
    const dateFilterInput = document.querySelector('#date-filter');
    const fileFilterSelect = document.querySelector('#file-filter');

    toggleFilter.addEventListener('change', function() {
        if (this.checked) {
            toggleable[0].classList.add('hidden');
            toggleable[1].classList.remove('hidden');
        } else {
            toggleable[1].classList.add('hidden');
            toggleable[0].classList.remove('hidden');
        }
    });

    /* Apply filters */

    btnFilter.addEventListener('click', function() {

        var url = logsTable.data('remote-url');
        if (toggleable[0].classList.contains('hidden')) {
            let filterFile = fileFilterSelect.options[fileFilterSelect.selectedIndex].value;
            url += '?file=' + filterFile;
        } else {
            if(dateFilterInput.value !== 'all') {
                let filterDate = new Date(dateFilterInput.value);
                let filterMonth = ("0" + (filterDate.getMonth() + 1)).slice(-2);
                url += '?year=' + filterDate.getFullYear() + '&month=' + filterMonth + '&day=' + filterDate.getDate();
            }
        }

        logsDataTable.ajax.url(url).load();
    });

    /* Search */
    const toggleCase = document.querySelector('#toggle-case');

    toggleCase.addEventListener('change', function() {
        datatableOptions.search.caseInsensitive = !this.checked;
        dateFilterInput.selectedIndex = 0;
        fileFilterSelect.selectedIndex = 0;
        logsDataTable.destroy();
        logsDataTable = logsTable.DataTable(datatableOptions);
    });
});