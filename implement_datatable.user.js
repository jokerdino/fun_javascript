// ==UserScript==
// @name     Implement DataTable in NEFT portal
// @version  0.1.3
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
// @match         http://10.200.41.130:8080/NeftPortal/neft/SplitPayment.do*
// @downloadURL https://github.com/jokerdino/fun_javascript/raw/main/implement_datatable.user.js
// @updateURL https://github.com/jokerdino/fun_javascript/raw/main/implement_datatable.user.js
// ==/UserScript==


(function() {
    'use strict';
    const my_css_2 = GM_getResourceText("IMPORTED_CSS_2");
    GM_addStyle(my_css_2);
    const my_css = GM_getResourceText("IMPORTED_CSS");
    GM_addStyle(my_css);

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    var month_start = '01/' + mm + '/'+ yyyy;
    var cal_year_start = '01/01/' + yyyy;

    if (mm < 4) {
        yyyy = yyyy-1
        var fin_year_start = '01/04/'+yyyy;
    }
    else {
        fin_year_start = '01/04/'+yyyy;
    }

    var from_date = document.getElementsByName('fromdate')[0]
    var to_date = document.getElementsByName('todate')[0]
    var fetch_button = document.getElementsByName('fetchReport')[0]

    var p_element = document.querySelectorAll("p[align=center]")[0];

    let btn_today = document.createElement("button");
    btn_today.innerHTML = "Today";
    btn_today.classList.add("btn-success");
    btn_today.classList.add("btn");
    btn_today.addEventListener("click", function () {
        from_date.value=today
        to_date.value=today
        fetch_button.click()
    });
    p_element.appendChild(btn_today);

    let btn_month = document.createElement("button");
    btn_month.innerHTML = "Current month";
    btn_month.classList.add("btn-warning");
    btn_month.classList.add("btn");
    btn_month.addEventListener("click", function () {
        from_date.value=month_start
        to_date.value=today
        fetch_button.click()
    });
    p_element.appendChild(btn_month);

    let btn_fy = document.createElement("button");
    btn_fy.innerHTML = "Current financial year";
    btn_fy.classList.add("btn-danger");
    btn_fy.classList.add("btn");
    btn_fy.addEventListener("click", function () {
        from_date.value=fin_year_start
        to_date.value=today
        fetch_button.click()
    });
    p_element.appendChild(btn_fy);

    let btn_cy = document.createElement("button");
    btn_cy.innerHTML = "Current calendar year";
    btn_cy.classList.add("btn-info");
    btn_cy.classList.add("btn");
    btn_cy.addEventListener("click", function () {
        from_date.value=cal_year_start
        to_date.value=today
        fetch_button.click()
    });
    p_element.appendChild(btn_cy);

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
        <th colspan="8" style="text-align:right">Total:</th>
        <th></th>
    </tr>
</tfoot>`;

    $('#my_table').append(tfoot);

    document.getElementById("my_table").deleteRow(1);

    var tbodyRowCount = my_table.tBodies[0].rows.length;
    var rows = my_table.rows

    for (var r = 1; r < tbodyRowCount+1; r++) {

        // create new column with checkbox
        var td = document.createElement("td");
        var id_value = 'checkbox_'+r
        td.innerHTML = "<input type='checkbox' id="+id_value +">";
        rows[r].prepend(td);

        // add id value to radio buttons
        var radio_1 = my_table.rows[r].cells[9].querySelectorAll("input[type='radio']")
        radio_1.forEach(input => input.id = 'radio_'+r)
       // radio_1.forEach(input => input.disabled = true)

        // Modify "receipt belongs to different office" text to "Transfer"
        my_table.rows[r].cells[10].querySelectorAll("a")[0].innerHTML = "Transfer"

        // Get value of all input tags and write to the table cells
        for (var c = 1; c < 9; c++) {
            my_table.rows[r].cells[c].innerHTML = my_table.rows[r].cells[c].querySelectorAll("input[type='text']")[0].getAttribute("value")
        }

        // collect dates to set data-sort attribute
        // data-sort attribute is useful for sorting dates in DataTable

        var date_value = my_table.rows[r].cells[2].innerHTML
        var date_split = date_value.split('/')
        var date = date_split[0]
        var month = date_split[1]
        var year = date_split[2]
        var sort_value = year+"-"+month+"-"+date
        my_table.rows[r].cells[2].setAttribute("data-sort",sort_value);

    }

    var radios = document.querySelectorAll("input[type=radio]");

    // add listeners to all radios
    radios.forEach(function(radio) {
        radio.addEventListener('change', function() {

            // if radio button is checked, corresponding checkbox will be selected
            if (radio.checked == true) {

                var checkbox_id = "checkbox_"+radio.id.split('_')[1]
                var checkbox_element = document.getElementById(checkbox_id)
                checkbox_element.checked = true;
            }
        });
    });

    var checkboxes = document.querySelectorAll("input[type=checkbox]");

    // add listeners to all checkboxes
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {

            // if checkbox is checked, corresponding radio button will be selected
            if (checkbox.checked == true) {

                var radio_id = "radio_"+checkbox.id.split('_')[1]
                var radio_element = document.getElementById(radio_id)
                radio_element.checked = true;
            }
            // if checkbox is unchecked, corresponding radio button will be cleared
            if (checkbox.checked == false) {

                var radio_id_2 = "radio_"+checkbox.id.split('_')[1]
                var radio_element_2 = document.getElementById(radio_id_2)
                radio_element_2.checked = false;
            }
        });
    });


    // add datatable to receipts table
    $(document).ready(function () {
        $('#my_table').DataTable({
            dom: 'Bfrtip',
            columnDefs: [
                {
                    target: [4,5,6,10],
                    visible: false,
                    searchable: false,
                },
                {target: 7, className: 'dt-body-left'},
                {target: 8, className: 'dt-body-right'},
            ],
            buttons: [
                { extend: 'copyHtml5',  title:''},
                { extend: 'csvHtml5', title:''},
                { extend: 'excelHtml5', title:''}],
            order: [[2,'desc']],
            paging: false,

            footerCallback: function (row, data, start, end, display) {
                var api = this.api();

                // Remove the formatting to get integer data for summation
                var intVal = function (i) {
                    return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
                };

                // Total over all pages
                var total = api
                .column(8)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);


                // Update footer
                $(api.column(8).footer()).html(total);
            },
        });
    });
})();
