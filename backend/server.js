const express = require("express");
const app = express();
const path = require('path');

app.use(express.static('frontend'));
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, '/../frontend'));
app.set('view engine', 'pug');

// for transfering data to frontend
const Transform = require('stream').Transform;
const fs = require('fs');
const parser = new Transform();
const newLineStream = require('new-line');

let droughtFile = require('../frontend/json/drought.json');

// Note: The includes method is not supported in Edge 13 (and earlier versions).

function getIds(nodes) {
    ids = [];
    for (var i = 0; i < nodes.length; i++ ) {
        ids.push(nodes[i].id);
    }
    return ids;
};

app.use('/graph', (req, res) => {
    var query = req.body;
    console.log("Query: "+JSON.stringify(query));

    const nodes = droughtFile.nodes.filter(d => query.genes.includes(d.label));
    ids = getIds(nodes);
    const edges = droughtFile.edges.filter(d => ids.includes(d.source) && ids.includes(d.target));

    var graph = {nodes,edges};
    res.render('graph',{data: graph});

    // parser._transform = function(data, encoding, done) {
    //     const str = data.toString().replace('</body>', '<script>var data = '+JSON.stringify(graph)+';</script></body>');
    //     this.push(str);
    //     done();
    // };

    // res.write('<!-- Begin stream -->\n');
    // fs
    // .createReadStream(path.join(__dirname+'/../frontend/graph.html'))
    // .pipe(newLineStream())
    // .pipe(parser)
    // .on('end', () => {
    //     res.write('\n<!-- End stream -->')
    // }).pipe(res);

});

app.use('/graph1', (req, res) => {
    var query = req.body;
    console.log("Query2: "+JSON.stringify(query));

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

    var nodes = query_nodes.concat(neighbour_nodes);
    ids = getIds(nodes);
    const edges = droughtFile.edges.filter(d => ids.includes(d.source) && ids.includes(d.target));
    var graph = {nodes,edges};

    parser._transform = function(data, encoding, done) {
        const str = data.toString().replace('</body>', '<script>var data = '+JSON.stringify(graph)+';</script></body>');
        this.push(str);
        done();
    };

    res.write('<!-- Begin stream -->\n');
    fs
    .createReadStream(path.join(__dirname+'/../frontend/graph.html'))
    .pipe(newLineStream())
    .pipe(parser)
    .on('end', () => {
        res.write('\n<!-- End stream -->')
    }).pipe(res);

});

app.listen(3000, function(){
    console.log("Server started on port 3000.. ");
})