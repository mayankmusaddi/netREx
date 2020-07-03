function load_table(data, N){    
    $(document).ready(()=>{

    var columns = [
        { data: "label" },
        { data: "attributes.tf" },
        { data: "attributes.wgcna_modules"},
        { data: "attributes.description"},
        { data: "attributes.msu_loc"},
        { data: null},

        { data: "attributes.go"},
        { data: "attributes.mapman"},
        { data: "attributes.kegg"},
    ];

    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'Label'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'TF'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'Module'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'Description'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'MSU ID'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'IC4R	Expression'}) );

    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'GO'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'Mapman'}) );
    $("#data-table"+N+">thead>tr").append( $('<th />', {text : 'KEGG'}) );

    var desc_ind=[1,2,3,4,5];
    var func_ind=[6,7,8];
    var fc_ind=[];
    var ind = 9;

    var timestamps = getTimestamps(data);
    Object.keys(timestamps).forEach(function(key) {
        var time = timestamps[key].substring(4);
        columns.push({data: "attributes.fc_"+time});
        columns.push({data: "attributes.pval_"+time});

        $("#data-table"+N+">thead>tr").append( $('<th />', {text : "FC "+key}) );
        $("#data-table"+N+">thead>tr").append( $('<th />', {text : "Pval "+key}) );

        fc_ind.push(ind);
        ind++;
        fc_ind.push(ind);
        ind++;
    });

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

    var table = $("#data-table"+N).DataTable( {
        data: data.nodes,
        columnDefs: [ 
            {
                targets: [5],
                data: null,
                defaultContent: "<button class='btn-light'>Click!</button>"
            },
            {
                render: function(data,type,row){
                    let num = data.split("E");
                    return parseFloat(num[0]).toFixed(3)+(num.length==2?('E'+num[1]):'');
                },
                targets: [ ...fc_ind],
            }
        ],
        columns: columns,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'colvisGroup',
                text: 'Description',
                className: "tabledesc",
                show: [ ...desc_ind],
                hide: [ ...func_ind, ...fc_ind]
            },
            {
                extend: 'colvisGroup',
                text: 'Function',
                className: "tablefunc",
                show: [ ...func_ind ],
                hide: [ ...desc_ind, ...fc_ind]
            },
            {
                extend: 'colvisGroup',
                text: 'Fold Change',
                className: "tablefc",
                show: [ ...fc_ind ],
                hide: [ ...desc_ind, ...func_ind]
            }
        ]
    });

    $("#data-table"+N+' tbody').on( 'click', 'button', function () {
        var data = table.row( $(this).parents('tr') ).data();
        // console.log(data.label);
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
    // $('.dt-button').addClass('btn btn-primary');

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

    $("#edge-table"+N+">thead>tr").append( $('<th />', {text : 'Source'}) );
    $("#edge-table"+N+">thead>tr").append( $('<th />', {text : 'Target'}) );
    $("#edge-table"+N+">thead>tr").append( $('<th />', {text : 'PCC'}) );
    $("#edge-table"+N+">thead>tr").append( $('<th />', {text : 'HRR'}) );

    var edgetable = $("#edge-table"+N).DataTable( {
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
    });
}