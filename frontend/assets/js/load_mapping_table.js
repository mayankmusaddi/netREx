function load_name_table(data){
    console.log("T: ", data);
    var namecolumns = [
        { data: "attributes.rapid" },
        { data: "attributes.symbol" }
    ];
    $("#name-table>thead>tr").append( $('<th />', {text : 'Valid RAP ID'}) );
    $("#name-table>thead>tr").append( $('<th />', {text : 'Name'}) );
    var nametable = $("#name-table").DataTable( {
        data: data.nodes,
        columns: namecolumns,
        dom: 'lfrtiBp',
        columnDefs: [
            { className: 'dt-centre'}
        ],
        buttons: [
            {
                extend: 'copyHtml5',
                text: '<i class="fas fa-copy"></i> Copy',
                titleAttr: 'Copy'
            },
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i> Excel',
                titleAttr: 'Excel'
            },
            {
                extend: 'csvHtml5',
                text: '<i class="fas fa-file-csv"></i> CSV',
                titleAttr: 'CSV'
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="fas fa-file-pdf"></i> PDF',
                titleAttr: 'PDF'
            },
        ]
    });
}
function load_mapping_table(data){
    $(document).ready(()=>{

        valid_data = [];
        for(var i=0;i<data.valid.length;i++){
            let ni = data.nodes.findIndex(d => d.label === data.valid[i]);
            valid_data.push({
                id: data.mapping[data.valid[i]],
                osid: data.valid[i],
                symbol: data.nodes[ni].attributes.symbol,
            });
        }
        invalid_data = [];
        unmapped_data = [];
        for(var i=0;i<data.invalid.length;i++){
            if(data.invalid[i] in data.mapping){
                invalid_data.push({
                    id: data.mapping[data.invalid[i]],
                    osid: data.invalid[i]
                });
            } else unmapped_data.push({ id: data.invalid[i]});
        }
    
        var validcolumns = [
            { data: "id" },
            { data: "osid" },
            { data: "symbol"}
        ];
        $("#valid-table>thead>tr").append( $('<th />', {text : 'Ensemble Stable ID'}) );
        $("#valid-table>thead>tr").append( $('<th />', {text : 'Rice Ortholog ID'}) );
        $("#valid-table>thead>tr").append( $('<th />', {text : 'Rice Gene Name'}) );

        var validtable = $("#valid-table").DataTable( {
            data: valid_data,
            columns: validcolumns,
            dom: 'lfrtiBp',
            // responsive: true,
            columnDefs: [
                { className: 'dt-centre'}
            ],
            buttons: [
                {
                    extend: 'copyHtml5',
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
            ]
        });

        var invalidcolumns = [
            { data: "id" },
            { data: "osid" }
        ];
        $("#invalid-table>thead>tr").append( $('<th />', {text : 'Ensemble Stable ID'}) );
        $("#invalid-table>thead>tr").append( $('<th />', {text : 'Rice Ortholog ID'}) );

        var invalidtable = $("#invalid-table").DataTable( {
            data: invalid_data,
            columns: invalidcolumns,
            dom: 'lfrtiBp',
            // responsive: true,
            columnDefs: [
                { className: 'dt-centre'}
            ],
            buttons: [
                {
                    extend: 'copyHtml5',
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
            ]
        });

        var unmappedcolumns = [
            { data: "id" }
        ];
        $("#unmapped-table>thead>tr").append( $('<th />', {text : 'Ensemble Stable ID'}) );
        var unmappedtable = $("#unmapped-table").DataTable( {
            data: unmapped_data,
            columns: unmappedcolumns,
            dom: 'lfrtiBp',
            // responsive: true,
            columnDefs: [
                { className: 'dt-centre'}
            ],
            buttons: [
                {
                    extend: 'copyHtml5',
                    text: '<i class="fas fa-copy"></i> Copy',
                    titleAttr: 'Copy'
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i> Excel',
                    titleAttr: 'Excel'
                },
                {
                    extend: 'csvHtml5',
                    text: '<i class="fas fa-file-csv"></i> CSV',
                    titleAttr: 'CSV'
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fas fa-file-pdf"></i> PDF',
                    titleAttr: 'PDF'
                },
            ]
        });
    });
}