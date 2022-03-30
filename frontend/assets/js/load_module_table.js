function load_module_table(data){
    $(document).ready(()=>{

    var columns = [
        { data: "attributes.rapid" },
        { data: "attributes.symbol" },
        { data: "attributes.tf" },
        { data: "attributes.description"},
        { data: "attributes.msu_loc"},
        { data: "attributes.ktotal"},
        { data: null},

        { data: "attributes.go"},
        { data: "attributes.mapman"},
        { data: "attributes.kegg"},
    ];

    $("#data-table>thead>tr").append( $('<th />', {text : 'Gene ID'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'Name'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'TF'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'Description'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'MSU ID'}) );
    $("#data-table>thead>tr").append( $('<th />', {html : 'k<sub>total</sub>'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'IC4R	Expression'}) );

    $("#data-table>thead>tr").append( $('<th />', {text : 'GO'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'Mapman'}) );
    $("#data-table>thead>tr").append( $('<th />', {text : 'KEGG'}) );

    var desc_ind=[1,2,3,4,5,6];
    var func_ind=[7,8,9];

    const set = (obj, path, val) => { 
        const keys = path.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((obj, key) => obj[key] = obj[key] || {}, obj); 
        lastObj[lastKey] = val;
    };

    for(var i in data.nodes){
        for(var j in columns){
            var attr = columns[j]["data"];
            if(attr!=null && !_.has(data.nodes[i], attr)){
                set(data.nodes[i], attr, '-');
            }
        }
    }

    var table = $("#data-table").DataTable( {
        data: data.nodes,
        columnDefs: [ 
            {
                targets: [6],
                data: null,
                defaultContent: "<button class='btn-light'>Click!</button>"
            },
        ],
        columns: columns,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'colvisGroup',
                text: 'Description',
                className: "tabledesc",
                show: [ ...desc_ind],
                hide: [ ...func_ind]
            },
            {
                extend: 'colvisGroup',
                text: 'Function',
                className: "tablefunc",
                show: [ ...func_ind ],
                hide: [ ...desc_ind]
            },
        ]
    });

    $("#data-table tbody").on( 'click', 'button', function () {
        var data = table.row( $(this).parents('tr') ).data();
        window.open("http://expression.ic4r.org/expression-api?term="+data.label, "Expression Chart", "width=1000,height=650,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,left=100,top=100");
    } );

    new $.fn.dataTable.Buttons( table, {
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
    } );
    table.buttons( 1, null ).container().appendTo(
        table.table().container()
    );

    table.button('.tabledesc').trigger();
    $('.tabledesc').addClass("active")

    $('.buttons-colvisGroup').click(function(){
        $('.buttons-colvisGroup').each(function(){
            $(this).removeClass("active");
        }); 
        $(this).addClass("active");
    });

    //Edge Table
    var edgecolumns = [
        { data: "source" },
        { data: "target" },
        { data: "attributes.pcc"},
        { data: "attributes.k"}
    ];

    $("#edge-table>thead>tr").append( $('<th />', {text : 'Source'}) );
    $("#edge-table>thead>tr").append( $('<th />', {text : 'Target'}) );
    $("#edge-table>thead>tr").append( $('<th />', {text : 'PCC'}) );
    $("#edge-table>thead>tr").append( $('<th />', {text : 'HRR'}) );

    var edgetable = $("#edge-table").DataTable( {
        data: data.edges,
        columns: edgecolumns,
        dom: 'lfrtiBp',
        // responsive: true,
        columnDefs: [
            {
                render: function ( d, type, row ) {
                    let node = data.nodes.find(o => o.id === d);
                    return node.label;
                },
                targets: [ 0, 1 ],
            },
            {
                render: function(data,type,row){
                    return parseFloat(data).toFixed(3);
                },
                targets: [ 2 ],
            }
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

    //GO Table
    let goheaders = Object.keys(data.go[0]);
    var gocolumns = [];

    goheaders.forEach( (val) => {
        $("#go-table>thead>tr").append( $('<th />', {text : val}) );
        gocolumns.push({data : val});
    });

    var gotable = $("#go-table").DataTable( {
        data: data.go,
        columns: gocolumns,
        dom: 'lfrtiBp',
        // responsive: true,
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