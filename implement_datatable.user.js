// ==UserScript==
// @name     Implement DataTable in NEFT portal
// @version  0.1
// @author Barneedhar Vigneshwar G
// @description Replace HTML table in NEFT portal with interactive DataTable
// @grant      GM_getResourceText
// @grant      GM_addStyle
// @require https://code.jquery.com/jquery-3.5.1.js
// @require https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js
// @require https://cdn.datatables.net/buttons/2.3.6/js/dataTables.buttons.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js
// @require https://cdn.datatables.net/buttons/2.3.6/js/buttons.html5.min.js
// @resource IMPORTED_CSS https://cdn.datatables.net/buttons/2.3.6/css/buttons.dataTables.min.css
// @resource IMPORTED_CSS_2 https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css
// @match         http://10.200.41.130:8080/*
// @downloadURL https://github.com/jokerdino/fun_javascript/raw/main/implement_datatable.user.js
// ==/UserScript==


//todo
// total at the bottom
// checkbox at start of table

(function() {
    'use strict';
    const my_css_2 = GM_getResourceText("IMPORTED_CSS_2");
    GM_addStyle(my_css_2);
    const my_css = GM_getResourceText("IMPORTED_CSS");
    GM_addStyle(my_css);

    var table_1 = document.querySelectorAll("table[cellpadding='1']")
    table_1.forEach(table => table.id = 'my_table')

    const my_table = document.getElementById('my_table');

    const thead = `
<thead>
    <tr>
        <th>Select</th>
        <th>Reference No</th>
        <th>Reference Date</th>
        <th>Payee Name</th>
        <th>Mobile No</th>
        <th>Payment mode</th>
 		<th>Payment type</th>
        <th>Process reference</th>
        <th>Amount</th>
        <th>Core</th>
        <th>Change office</th>
    </tr>
</thead>`;
    $('#my_table').prepend(thead);

    const tfoot =`
<tfoot>
    <tr>
        <th colspan="7" class="has-text-left">Total:</th>
        <th colspan="9"></th>
    </tr>
</tfoot>`;

    $('#my_table').append(tfoot);

    document.getElementById("my_table").deleteRow(1);

    var tbodyRowCount = my_table.tBodies[0].rows.length;
    var rows = my_table.rows

    for (var r = 1; r < tbodyRowCount+1; r++) {

        // create new column with checkbox
        var td = document.createElement("td");
        var id_value = r
        td.innerHTML = "<input type='checkbox' id="+id_value +">";
        rows[r].prepend(td);

        // add id value to radio buttons
        var radio_1 = my_table.rows[r].cells[6].querySelectorAll("input[type='radio']")
        radio_1.forEach(input => input.id = 'radio_'+r)

        // Modify "receipt belongs to different office" text to "Transfer"
        my_table.rows[r].cells[9].querySelectorAll("a")[0].innerHTML = "Transfer"

        // Get value of all input tags and write to the table cells
        for (var c = 0; c < 8; c++) {
            my_table.rows[r].cells[c].innerHTML = my_table.rows[r].cells[c].querySelectorAll("input[type='text']")[0].getAttribute("value")
        }
    }

    var checkboxes = document.querySelectorAll("input[type=checkbox]");

    // add listeners to all checkboxes
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {

            // if checkbox is checked, corresponding radio button will be selected
            if (checkbox.checked == true) {
                radio_id = "radio_"+checkbox.id
                var radio_element = document.getElementById(radio_id)
                radio_element.checked = true;
            }
            // if checkbox is unchecked, corresponding radio button will be cleared
            if (checkbox.checked == false) {
                radio_id = "radio_"+checkbox.id
                var radio_element = document.getElementById(radio_id)
                radio_element.checked = false;
            }
        });
    });
    // add datatable to receipts table
    $(document).ready(function () {
        $('#my_table').DataTable({
            dom: 'Bfrtip',
            columnDefs: [
                {
                    target: [3,4,5],
                    visible: false,
                    searchable: false,
                },
                {target: 6, className: 'dt-body-left'},
                {target: 7, className: 'dt-body-right'},
            ],
            buttons: [
                { extend: 'copyHtml5',  title:''},
                { extend: 'csvHtml5', title:''},
                { extend: 'excelHtml5', title:''}],
            order: [[1,'desc']],
            paging: false,

            footerCallback: function (row, data, start, end, display) {
                var api = this.api();

                // Remove the formatting to get integer data for summation
                var intVal = function (i) {
                    return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                };

                // Total over all pages
                total = api
                    .column(7)
                    .data()
                    .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

                // Update footer
                $(api.column(7).footer()).html('Rs.' + total);
            },
        });
    });
})();
