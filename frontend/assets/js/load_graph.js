// Add a method to the graph model that returns an object with every neighbors of a node inside:
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
    neighbors = {},
    index = this.allNeighborsIndex[nodeId] || {};
    
    for (k in index)
    neighbors[k] = this.nodesIndex[k];
    
    return neighbors;
});

function load_graph(data, graphid, N, move){
    function expand() {
        $('#'+graphid).addClass('col-lg-12 col-md-12').removeClass('col-lg-10 col-md-10');
		$('#sidepanel'+N).hide();
		$('#expand'+N).addClass('fa fa-bars').removeClass('fas fa-expand-arrows-alt');
		s.renderers[0].resize();
		s.refresh();
	    $(this).one("click", compress);
	}
	function compress() {
        $('#'+graphid).addClass('col-lg-10 col-md-10').removeClass('col-lg-12 col-md-12');
		$('#sidepanel'+N).show();
		$('#expand'+N).addClass('fas fa-expand-arrows-alt').removeClass('fa fa-bars');
		s.renderers[0].resize();
		s.refresh();
	    $(this).one("click", expand);
	}
	$('#expand'+N).one("click", expand);
    
    // Populate select timestamp options
    var timestamps = getTimestamps(data);

	var $el = $('#regtime'+N);
	$el.empty(); // remove old timestamps
	$.each(timestamps, function(key,value) {
		$el.append($("<option></option>")
	   		.attr("value", value).text(key));
	});
	var $el = $('#regtimeHead'+N+' > div > ul');
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

    var $el = $('#otherCond'+N);
	$el.empty(); // remove old conditions
	$.each(conditions, function(key,value) {
		$el.append($("<option></option>")
	   		.attr("value", value).text(key));
	});
	var $el = $('#otherCondHead'+N+' > div > ul');
	$el.empty(); // remove old conditions
	$.each(conditions, function(key,value) {
		$el.append($("<li></li>")
	    	.attr("data-value", value).attr("class", "option").text(key));
    });

    $('.colorswitch'+N).click(function(){
		$('.colorswitch'+N).each(function(){
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
    
    s = new sigma({ 
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
    
    filter = new sigma.plugins.filter(s);
    var selectedNode;
    
    var edges = s.graph.edges();
    for (var i = 0; i < edges.length; i += 1){
        edges[i].type = 'curve';
        edges[i].size = 0.1;
    }
    
    // We first need to save the original colors of our nodes and edges, like this:
    s.graph.nodes().forEach(function(n) {
        n.originalColor = n.color;
        n.firstColor = n.color;
        n.originalBorderColor = n.borderColor;
    });
    s.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
    });
    
    // When a node is clicked, we check for each node if it is a neighbor of the clicked one. If not, we set its color as grey, and else, it takes its original color. We do the same for the edges, and we only keep edges that have both extremities colored.
    s.bind('overNode', function(e) {
        var nodeId = e.data.node.id,
        toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;
        
        s.graph.nodes().forEach(function(n) {
            if (toKeep[n.id]){
                n.color = n.originalColor;
                n.borderColor = n.originalBorderColor;
            }
            else{
                n.color = '#eee';
                n.borderColor = '#eee';
            }
        });
        
        s.graph.edges().forEach(function(e) {
            if (toKeep[e.source] && toKeep[e.target])
            e.color = e.originalColor;
            else
            e.color = '#eee';
        });
        s.refresh()
    });
    // When the stage is clicked, we just color each node and edge with its original color.
    s.bind('outNode', function(e) {
        s.graph.nodes().forEach(function(n) {
            n.color = n.originalColor;
            n.borderColor = n.originalBorderColor;
        });
        
        s.graph.edges().forEach(function(e) {
            e.color = e.originalColor;
        });
        
    });
    
    if(move){
        //Initialize nodes as a circle
        s.graph.nodes().forEach(function(node, i, a) {
            node.x = Math.cos(Math.PI * 2 * i / a.length);
            node.y = Math.sin(Math.PI * 2 * i / a.length);
        });
        
        //Call refresh to render the new graph
        CustomShapes.init(s);
        s.refresh();
        
        s.startForceAtlas2();
        setTimeout(
            function () {
                s.stopForceAtlas2();
            }, 
        1000);
            
        var config = {
            nodeMargin: 3.0,
            scaleNodes: 1.3,
        };
        // Configure the algorithm
        var listener = s.configNoverlap(config);
        // Bind all events:
        listener.bind('start stop interpolate', function(event) {
            console.log(event.type);
        });
        // Start the algorithm:
        s.startNoverlap();
    }
    
    if (selectedNode != undefined){
        s.cameras[0].goTo({x:selectedNode['read_cam0:x'],y:selectedNode['read_cam0:y'],ratio:0.1});
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
    
    $(document).ready(()=>{

        $('#load'+N).click(()=>{
            var val = $('#otherCond'+N).val();
            var qs = window.location.href;
            var url = updateQueryStringParameter(qs,'condition', val);
            window.open(url, "_blank"); 
        });

        $('#downloadimg'+N).click(()=>{
            var graphimage = s.renderers[0].snapshot({format: 'jpg', background: 'white', filename: 'graph.jpg', labels: true});
            
            $('#imgdownload').remove();
            $('#sidepanel'+N).append($('<a>', {id: 'imgdownload', href: graphimage, download: 'graph.jpg'}));
            $('#imgdownload')[0].click();
        });
        
        $('#original'+N).click(()=>{
            s.graph.nodes().forEach(function(n) {
                n.originalColor = n.firstColor;
                n.color = n.originalColor;
            });
            s.refresh();
        });
        $('#module'+N).click(()=>{
            s.graph.nodes().forEach(function(n) {
                n.originalColor = colors[n.attributes.wgcna_modules];
                n.color = n.originalColor;
            });
            s.refresh();
        });
        
        $('#regulation'+N).click(()=>{
            var val = $('#regtime'+N).val();
            s.graph.nodes().forEach(function(n) {
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
            console.log("Refreshed by button");
            s.refresh();
        });
        
        $(function(){
            $('#regtime'+N).change(function(){
                console.log("Select Change working");
                var val= $(this).val();
                var regTrigger = document.getElementById('regulation');

                if(regTrigger.checked){
                    s.graph.nodes().forEach(function(n) {
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
                    s.refresh();
                    console.log("Refreshed by Select");
                }
            })
            $('#regtime'+N).trigger('change');
        });
    });

    return s;
}