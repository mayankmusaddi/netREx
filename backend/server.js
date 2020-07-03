const express = require("express");
const app = express();
const path = require('path');
const url = require('url');

// var bodyParser = require('body-parser');

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static('frontend'));
// app.use(bodyParser.urlencoded({ extended: true }))

// for transfering data to frontend
const Transform = require('stream').Transform;
const fs = require('fs');
const parser = new Transform();
const newLineStream = require('new-line');

// view engine setup
app.set('views', path.join(__dirname, '/../frontend'));
app.set('view engine', 'pug');

const jsonpath = "../frontend/json/"
let file = require(jsonpath+'droughtroot.json');

// Note: The includes method is not supported in Edge 13 (and earlier versions).

// Helper Functions----------------------------------
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
            nodes[i].borderColor = '#39ff14';
        }
    }
};

function sortByTime(dict) {
    var sortedDay = [];
    var sortedHour = [];
    for(var key in dict) {
        var time = key.split(" ");
        if(time[1]=="day")
            sortedDay[sortedDay.length] = parseInt(time[0],10);
        else
            sortedHour[sortedHour.length] = parseInt(time[0],10);
    }
    sortedDay.sort((a,b)=>a-b);
    sortedHour.sort((a,b)=>a-b);

    var tempDict = {};
    for(var i = 0; i < sortedHour.length; i++) {
        var key = [sortedHour[i],"hr"].join(" ")
        tempDict[key] = dict[key];
    }
    for(var i = 0; i < sortedDay.length; i++) {
        var key = [sortedDay[i],"day"].join(" ")
        tempDict[key] = dict[key];
    }
    return tempDict;
}
// --------------------------------------------------


app.use('/validate', (req, res) => {
    var query = req.body;
    console.log(query);
    file = require(jsonpath+query.condition+query.tissue);

    var genes = query.genes.split(/[ ,]+/).filter(Boolean);
    const nodes = file.nodes.filter(d => genes.includes(d.label));

    var valid = nodes.map((d)=>{return (d.label)});
    var invalid = genes.filter(d => !valid.includes(d));
    var metadata = {condition: query.condition, tissue: query.tissue};

    data = {nodes: nodes, valid: valid, invalid: invalid, metadata: metadata};
    res.send(data);

    // res.render('graph',{data: data});
    // parser._transform = function(d, encoding, done) {
    //     const str = d.toString().replace('<body>', '<body><script>var data = '+JSON.stringify(data)+';</script>');
    //     this.push(str);
    //     done();
    // };
    // res.write('<!-- Begin stream -->\n');
    // fs
    // .createReadStream(path.join(__dirname+'/../frontend/validate.html'))
    // .pipe(newLineStream())
    // .pipe(parser)
    // .on('end', () => {
    //     res.write('\n<!-- End stream -->')
    // }).pipe(res);
});

app.use('/network', (req, res) => {
    var query = req.body;
    console.log("Query: "+JSON.stringify(query));
    file = require(jsonpath+query.condition+query.tissue)

    // if(query.neighbor=="on")
    //     res.redirect(307,'/netrex/neighborhood_network');
    // else
    //     res.redirect(307,'/netrex/simple_network');

    if(query.neighbor=="on")
        res.redirect(307,'/neighborhood_network');
    else
        res.redirect(307,'/simple_network');

});

app.use('/module', (req, res) => {
    var query = req.body;
    console.log("Query: "+JSON.stringify(query));
    file = require(jsonpath+query.tissue+query.module)
    
    res.render('graph',{data: file});
    // parser._transform = function(d, encoding, done) {
    //     const str = d.toString().replace('</body>', '<script>var data = '+JSON.stringify(data)+';</script></body>');
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

app.use('/expression', (req, res) => {
    const nodes = req.body.nodes;
    const props = Object.keys(nodes[0].attributes);

	var timestamps= {};
	for(const prop of props){
		if(prop.substring(0,3) === "fc_"){
			var txt = prop.substring(3).match(/[a-zA-Z]+|[0-9]+/g).join(" ");
			timestamps[txt]=prop;
		}
	}
    timestamps = sortByTime(timestamps);
    // var timestamps = getTimestamps(req.body);

    row_nodes = [];
    var i=0;
    Object.keys(timestamps).forEach(function(key) {
        row_nodes.push({"name": key, "rank": i,"clust": i});
        i++;
    });
    
    col_nodes = [];
    let mat = Array(row_nodes.length).fill().map(() => Array(nodes.length).fill(0));

    for (var i=0; i<nodes.length; i++) {
        col_nodes.push({"name": nodes[i].label, "rank": i, "clust": i});
        var j=0;
        Object.keys(timestamps).forEach(function(key) {
            var value = nodes[i].attributes[timestamps[key]];
            mat[j][i] = value;
            j++;
        });
    }

    var data = {"row_nodes": row_nodes, "col_nodes": col_nodes, "mat" : mat}
    res.send(data);
});

app.use('/simple_network', (req, res) => {
    const nodes = req.body.nodes;
    ids = getIds(nodes);
    initTF(nodes);
    const edges = file.edges.filter(d => ids.includes(d.source) && ids.includes(d.target));
    var graph = {nodes,edges};
    res.send(graph);
});

app.use('/neighborhood_network', (req, res) => {
    const query_nodes = req.body.nodes;
    const neighbor_number = req.body.neighbor_number;

    var query_ids = getIds(query_nodes);
    const node_edges = file.edges.filter(d => query_ids.includes(d.source) || query_ids.includes(d.target));
    
    var neighbor_ids = [];
    for (var i = 0; i < node_edges.length; i++ ) {
        if(!query_ids.includes(node_edges[i].source))
            neighbor_ids.push(node_edges[i].source);
        if(!query_ids.includes(node_edges[i].target))
            neighbor_ids.push(node_edges[i].target);
    }

    const neighbour_nodes = file.nodes.filter(d => neighbor_ids.includes(d.id));
    neighbour_nodes.sort((a, b) => a.attributes.rank - b.attributes.rank);
    neighbour_nodes.length = neighbor_number;

    for (var i=0; i < neighbour_nodes.length;i++ ) {
        neighbour_nodes[i].attributes.neighbor = "true";
    }

    const nodes = query_nodes.concat(neighbour_nodes);
    ids = getIds(nodes);
    initTF(nodes);
    initNeighbour(nodes);

    const edges = file.edges.filter(d => ids.includes(d.source) && ids.includes(d.target));
    var graph = {nodes,edges};

    res.send(graph);
    // res.render('graph',{data: graph});

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

app.listen(3000, function(){
    console.log("Server started on port 3000.. ");
})