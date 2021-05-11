function load_neighbour_graph(data, graphid){
    function expand() {
        $('#'+graphid).addClass('col-lg-12 col-md-12').removeClass('col-lg-10 col-md-10');
		$('#sidepanelN').hide();
		$('#expandN').addClass('fa fa-bars').removeClass('fas fa-expand-arrows-alt');
		sN.renderers[0].resize();
		sN.refresh();
	    $(this).one("click", compress);
	}
	function compress() {
        $('#'+graphid).addClass('col-lg-10 col-md-10').removeClass('col-lg-12 col-md-12');
		$('#sidepanelN').show();
		$('#expandN').addClass('fas fa-expand-arrows-alt').removeClass('fa fa-bars');
		sN.renderers[0].resize();
		sN.refresh();
	    $(this).one("click", expand);
	}
    $('#expandN').one("click", expand);
    
    function refreshScreen(){
        sN.cameras[0].goTo({x:0,y:0,ratio:1});
		sN.refresh();
	    $(this).one("click", refreshScreen);
    }
	$('#refreshN').one("click", refreshScreen);

    
    // Populate select timestamp options
    var timestamps = getTimestamps(data);

	var $el = $('#regtimeN');
	$el.empty(); // remove old timestamps
	$.each(timestamps, function(key,value) {
		$el.append($("<option></option>")
	   		.attr("value", value).text(key));
	});
	var $el = $('#regtimeHeadN'+' > div > ul');
	$el.empty(); // remove old timestamps
	$.each(timestamps, function(key,value) {
		$el.append($("<li></li>")
	    	.attr("data-value", value).attr("class", "option").text(key));
    });
    
    // Populate other condition options
    var conditions = {
        'Drought' : 'drought',
        'Cold' : 'cold',
        'Flood' : 'flood',
        'Osmosis' : 'osmo',
        'ABA' : 'aba',
        'JA' : 'ja',
    };
    let toRemove = Object.keys(conditions).find(key => conditions[key] === data.condition);
    delete conditions[toRemove];

    var $el = $('#otherCondN');
	$el.empty(); // remove old conditions
	$.each(conditions, function(key,value) {
		$el.append($("<option></option>")
	   		.attr("value", value).text(key));
	});
	var $el = $('#otherCondHeadN'+' > div > ul');
	$el.empty(); // remove old conditions
	$.each(conditions, function(key,value) {
		$el.append($("<li></li>")
	    	.attr("data-value", value).attr("class", "option").text(key));
    });
    
    // Populate Pathway Dropdown
    function loadPathsN(pathway){
        // $(document).ready(()=>{
            // $(function(){
                $('#pathN').change(function(){
                    var data= $(this).val();
                    var nodeids = pathway[data];
                    sN.graph.nodes().forEach(function(n) {
                        if (nodeids.includes(n.id)){
                            n.color = n.originalColor;
                            n.borderColor = n.originalBorderColor;
                        }
                        else{
                            n.color = '#eee';
                            n.borderColor = '#eee';
                        }
                    });
                    sN.graph.edges().forEach(function(e) {
                        if (nodeids.includes(e.source) && nodeids.includes(e.target))
                        e.color = e.originalColor;
                        else
                        e.color = '#eee';
                    });
                    sN.refresh();
                });
                $('#pathN').trigger('change');
            // });
        // });
    }
    $.getJSON('./pathway_list.json', function(paths) {
        var pathway = {};
        for(path in paths){
            var subpaths = paths[path];
            for(subpath in subpaths){
                data.nodes.forEach(function(n) {
                    if("kegg" in n.attributes && n.attributes.kegg.includes(subpath)){
                        if(!(subpath in pathway))
                            pathway[subpath] = [];
                        pathway[subpath].push(n.id);
                    }
                });
            }
        }
        var $el = $('#pathN');
        $.each(pathway, function(key,value) {
            $el.append($("<option></option>")
                   .attr("value", key).text(key));
        });
        var $el = $('#pathHeadN'+' > div > ul');
        $.each(pathway, function(key,value) {
            $el.append($("<li></li>")
                .attr("data-value", key).attr("class", "option").text(key));
        });
        loadPathsN(pathway);
    });

    $('.colorswitchN').click(function(){
		$('.colorswitchN').each(function(){
			$(this).prop('checked', false); 
		}); 
		$(this).prop('checked', true);
	});
    
    const colors = {
        "Black" : '#000000',
        "Blue" : '#0000FF',
        "Brown" : '#A52A2A',
        "Cyan" : '#00FFFF',
        "Green" : '#008000',
        "GreenYellow" : '#ADFF2F',
        "Grey" : '#808080',
        "Grey60" : '#C0C0C0',
        "LightCyan" : '#E0FFFF',
        "lightGreen" : '#90EE90',
        "lightYellow" : '#FFFFE0',
        "Magenta" : '#FF00FF',
        "MidnightBlue" : '#191970',
        "Pink" : '#FFC0CB',
        "Purple" : '#800080',
        "Red" : '#FF0000',
        "royalBlue" : '#4169E1',
        "Salmon" : '#FA8072',
        "Tan" : '#D2B48C',
        "Turquoise" : '#40E0D0',
        "Yellow" : '#FFFF00',
    };
    
    sN = new sigma({ 
        graph: data,
        container: graphid,
        renderer: {
            container: document.getElementById(graphid),
            type: sigma.renderers.canvas
        },
        settings: {
            minNodeSize: 1,
            maxNodeSize: 15,
        }
    });
    
    filter = new sigma.plugins.filter(sN);
    var selectedNode;
    
    var edges = sN.graph.edges();
    for (var i = 0; i < edges.length; i += 1){
        edges[i].type = 'curve';
        edges[i].color = 'rgb(150,150,150)';

    }
    
    // We first need to save the original colors of our nodes and edges, like this:
    sN.graph.nodes().forEach(function(n) {
        n.originalColor = n.color;
        n.firstColor = n.color;
        n.originalBorderColor = n.borderColor;
    });
    sN.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
    });
    
    // When a node is clicked, we check for each node if it is a neighbor of the clicked one. If not, we set its color as grey, and else, it takes its original color. We do the same for the edges, and we only keep edges that have both extremities colored.
    sN.bind('overNode', function(e) {
        var nodeId = e.data.node.id,
        toKeep = sN.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;
        
        sN.graph.nodes().forEach(function(n) {
            if (toKeep[n.id]){
                n.color = n.originalColor;
                n.borderColor = n.originalBorderColor;
            }
            else{
                n.color = '#eee';
                n.borderColor = '#eee';
            }
        });
        
        sN.graph.edges().forEach(function(e) {
            if (toKeep[e.source] && toKeep[e.target])
            e.color = e.originalColor;
            else
            e.color = '#eee';
        });
        sN.refresh()
    });
    // When the stage is clicked, we just color each node and edge with its original color.
    sN.bind('outNode', function(e) {
        sN.graph.nodes().forEach(function(n) {
            n.color = n.originalColor;
            n.borderColor = n.originalBorderColor;
        });
        
        sN.graph.edges().forEach(function(e) {
            e.color = e.originalColor;
        });
        
    });
    //Initialize nodes as a circle
    sN.graph.nodes().forEach(function(node, i, a) {
        node.x = Math.cos(Math.PI * 2 * i / a.length);
        node.y = Math.sin(Math.PI * 2 * i / a.length);
    });
    
    //Call refresh to render the new graph
    CustomShapes.init(sN);
    sN.refresh();

    let dragListener = sigma.plugins.dragNodes(sN, sN.renderers[0])
    // dragListener.bind('startdrag', function(event) {
    //     console.log(event);
    // });
    
    sN.startForceAtlas2();
    // sN.startForceAtlas2({adjustSizes:true});
    setTimeout(function () {sN.stopForceAtlas2();},1000);
        
    var config = {
        nodeMargin: 5.0,
        scaleNodes: 3,
    };
    // Configure the algorithm
    var listener = sN.configNoverlap(config);
    // Bind all events:
    listener.bind('start stop interpolate', function(event) {
        console.log(event.type);
    });
    // Start the algorithm:
    sN.startNoverlap();
    
    if (selectedNode != undefined){
        sN.cameras[0].goTo({x:selectedNode['read_cam0:x'],y:selectedNode['read_cam0:y'],ratio:0.1});
    };

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
          return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
          return uri + separator + key + "=" + value;
        }
    }
    
    // $(document).ready(()=>{

        $('#loadN').click(()=>{
            var val = $('#otherCondN').val();
            var qs = window.location.href;
            var url = updateQueryStringParameter(qs,'condition', val);
            window.open(url, "_blank"); 
        });

        $('#downloadimgN').click(()=>{
            var graphimage = sN.renderers[0].snapshot({format: 'jpg', background: 'white', filename: 'graph.jpg', labels: true});
            
            $('#imgdownload').remove();
            $('#sidepanelN').append($('<a>', {id: 'imgdownload', href: graphimage, download: 'graph.jpg'}));
            $('#imgdownload')[0].click();
        });
        
        $('#originalN').click(()=>{
            sN.graph.nodes().forEach(function(n) {
                n.originalColor = n.firstColor;
                n.color = n.originalColor;
            });
            sN.refresh();
        });
        $('#moduleN').click(()=>{
            sN.graph.nodes().forEach(function(n) {
                n.originalColor = colors[n.attributes.wgcna_modules];
                n.color = n.originalColor;
            });
            sN.refresh();
        });
        
        $('#regulationN').click(()=>{
            var val = $('#regtimeN').val();
            sN.graph.nodes().forEach(function(n) {
                var color = colors["Grey"];
                if(n.attributes.hasOwnProperty(val)){
                    if(n.attributes[val] === "Up")
                    color = colors["Red"];
                    else
                    color = colors["Blue"];
                }
                n.originalColor = color;
                n.color = n.originalColor;
            });
            sN.refresh();
        });
        
        // $(function(){
            $('#regtimeN').change(function(){
                var val= $(this).val();
                var regTrigger = document.getElementById('regulation');

                if(regTrigger.checked){
                    sN.graph.nodes().forEach(function(n) {
                        var color = colors["Grey"];
                        if(n.attributes.hasOwnProperty(val)){
                            if(n.attributes[val] === "Up")
                            color = colors["Red"];
                            else
                            color = colors["Blue"];
                        }
                        n.originalColor = color;
                        n.color = n.originalColor;
                    });
                    sN.refresh();
                }
            })
            $('#regtimeN').trigger('change');
        // });
    // });
    return sN;
}