const express = require("express");
const app = express();
const path = require('path');
const url = require('url');

app.use(express.static('frontend'));
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, '/../frontend'));
app.set('view engine', 'pug');

let droughtFile = require('../frontend/json/aba_full.json');

// Note: The includes method is not supported in Edge 13 (and earlier versions).

function getIds(nodes) {
    ids = [];
    for (var i = 0; i < nodes.length; i++ ) {
        ids.push(nodes[i].id);
    }
    return ids;
};

function initTF(nodes) {
    for (var i=0; i<nodes.length; i++) {
        nodes[i].type = 'circle';
        if ("tf" in nodes[i].attributes) {
            nodes[i].type = 'equilateral';
            nodes[i].equilateral = {numPoints : 3};
        }
    }
};

function initNeighbour(nodes) {
    for (var i=0; i<nodes.length; i++) {
        if(nodes[i].attributes.neighbor!="true"){
            nodes[i].size = 70;
            nodes[i].borderColor = 'red';
        }
    }
};

app.use('/network', (req, res) => {
    var query = req.body;
    console.log("Query: "+JSON.stringify(query));

    if(query.neighbor=="on")
        res.redirect(307,'/neighborhood_network');
    else
        res.redirect(307,'/simple_network');


});

app.use('/simple_network', (req, res) => {
    var query = req.body;

    const nodes = droughtFile.nodes.filter(d => query.genes.includes(d.label));
    ids = getIds(nodes);
    initTF(nodes);
    const edges = droughtFile.edges.filter(d => ids.includes(d.source) && ids.includes(d.target));

    var graph = {nodes,edges};
    res.render('graph',{data: graph});
});

app.use('/neighborhood_network', (req, res) => {
    var query = req.body;

    const query_nodes = droughtFile.nodes.filter(d => query.genes.includes(d.label));
    query_ids = getIds(query_nodes);
    const node_edges = droughtFile.edges.filter(d => query_ids.includes(d.source) || query_ids.includes(d.target));
    
    neighbor_ids = [];
    for (var i = 0; i < node_edges.length; i++ ) {
        if(!query_ids.includes(node_edges[i].source))
            neighbor_ids.push(node_edges[i].source);
        if(!query_ids.includes(node_edges[i].target))
            neighbor_ids.push(node_edges[i].target);
    }

    const neighbour_nodes = droughtFile.nodes.filter(d => neighbor_ids.includes(d.id));
    neighbour_nodes.sort((a, b) => a.attributes.rank - b.attributes.rank);
    neighbour_nodes.length = 100;

    for (var i=0; i < neighbour_nodes.length;i++ ) {
        neighbour_nodes[i].attributes.neighbor = "true";
    }

    var nodes = query_nodes.concat(neighbour_nodes);
    ids = getIds(nodes);
    initTF(nodes);
    initNeighbour(nodes);

    const edges = droughtFile.edges.filter(d => ids.includes(d.source) && ids.includes(d.target));
    var graph = {nodes,edges};

    res.render('graph',{data: graph});
});

app.listen(3000, function(){
    console.log("Server started on port 3000.. ");
})