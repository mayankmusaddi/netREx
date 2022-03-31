const express = require("express");
const app = express();
const path = require("path");
const fs = require('fs');
const csv = require('csv-parser');

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.static("frontend"));

// view engine setup
app.set("views", path.join(__dirname, "/../frontend"));

const jsonpath = "../frontend/json/";
const datapath = "./frontend/data/";
let file = require(jsonpath + "droughtroot.json");

// Note: The includes method is not supported in Edge 13 (and earlier versions).

// Helper Functions----------------------------------
function getIds(nodes) {
  ids = [];
  for (var i = 0; i < nodes.length; i++) {
    ids.push(nodes[i].id);
  }
  return ids;
}

function initTF(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].type = "circle";
    if ("tf" in nodes[i].attributes && nodes[i].attributes.tf!="") {
      nodes[i].type = "equilateral";
      nodes[i].equilateral = { numPoints: 3 };
    }
  }
}

function initNeighbour(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].size = 70;
    nodes[i].borderColor = "#39ff14";
  }
}

function sortByTime(dict) {
  var sortedDay = [];
  var sortedHour = [];
  for (var key in dict) {
    var time = key.split(" ");
    if (time[1] == "day") sortedDay[sortedDay.length] = parseInt(time[0], 10);
    else sortedHour[sortedHour.length] = parseInt(time[0], 10);
  }
  sortedDay.sort((a, b) => a - b);
  sortedHour.sort((a, b) => a - b);

  var tempDict = {};
  for (var i = 0; i < sortedHour.length; i++) {
    var key = [sortedHour[i], "hr"].join(" ");
    tempDict[key] = dict[key];
  }
  for (var i = 0; i < sortedDay.length; i++) {
    var key = [sortedDay[i], "day"].join(" ");
    tempDict[key] = dict[key];
  }
  return tempDict;
}

//var csv is the CSV file with headers
function csvJSON(csv){
  var lines=csv.split("\n");
  var result = [];
  var headers=lines[0].split("\t");
  for(var i=1;i<lines.length-1;i++){
      var obj = {};
      var currentline=lines[i].split("\t");
      for(var j=0;j<headers.length;j++)
          obj[headers[j]] = currentline[j];
      result.push(obj);
  }
  return result;
}
// --------------------------------------------------

app.use("/validate", (req, res) => {
  var query = req.body;
  console.log(query);
  file = require(jsonpath + query.condition + query.tissue);

  var genes = query.genes.split(/[ ,+\s]/).filter(Boolean);
  if(query.species != "rice"){
    mapping = require("../frontend/data/orthologs/"+query.species+".json");
    mapped_genes = [];
    for(var i=0;i<genes.length;i++){
      if(genes[i] in mapping)
      mapped_genes.push(mapping[genes[i]]);
    }
    genes = mapped_genes;
  }

  const nodes = file.nodes.filter((d) => genes.includes(d.label));

  var valid = nodes.map((d) => {return d.label;});
  var invalid = genes.filter((d) => !valid.includes(d));
  var metadata = { species : query.species, condition: query.condition, tissue: query.tissue };

  fs.createReadStream(datapath+query.tissue.toUpperCase()+"/"+query.condition+"_full.csv")
  .pipe(csv({mapHeaders: ({ header, index }) => header.trim().toLowerCase()}))
  .on('data', function (row) {
    let ni = nodes.findIndex(d => d.label === row.label);
    row.rapid = row.label;
    delete row.id;
    delete row.label;
    if(ni != -1) nodes[ni].attributes = row;
  })
  .on('end', function () {
      data = { nodes: nodes, valid: valid, invalid: invalid, metadata: metadata };
      res.send(data);
  })
});

app.use("/module", (req, res) => {
  var query = req.body;
  console.log("Query: " + JSON.stringify(query));
  file = require(jsonpath + query.tissue + query.module);

  var nodes = file.nodes;
  fs.createReadStream(datapath+query.tissue.toUpperCase()+"/modules/"+query.module+"_full.csv")
  .pipe(csv({mapHeaders: ({ header, index }) => header.trim().toLowerCase()}))
  .on('data', function (row) {
    let ni = nodes.findIndex(d => d.label === row.label);
    row.rapid = row.label;
    delete row.id;
    delete row.label;
    if(ni != -1) nodes[ni].attributes = row;
  })
  .on('end', function () {
      fs.readFile(datapath + query.tissue.toUpperCase() + "/GO/" + query.module + ".txt", 'utf8', (err, data) => {
        if (err) console.log(err);
        file.go = csvJSON(data);
        initTF(nodes);
        res.send(file);
      })
  })

});

app.use("/load", (req, res) => {
  var query = req.body;
  var nodes = [];
  fs.createReadStream(datapath+query.tissue.toUpperCase()+"/"+query.condition+"_full.csv")
  .pipe(csv({mapHeaders: ({ header, index }) => header.trim().toLowerCase()}))
  .on('data', function (row) {
    row.rapid = row.label;
    delete row.id;
    delete row.label;
    node = {"attributes": row};
    nodes.push(node);
  })
  .on('end', function () {
      data = { nodes: nodes };
      res.send(data);
  })
});

app.use("/pathway", (req, res) => {
  var query = req.body;
  file = require(jsonpath + query.condition + query.tissue);
  var path_list = require("../frontend/data/gene_list.json");
  var all_genes = file.nodes.map((d) => d.label);
  var filtered_list = {};
  for(var path in path_list){
    gene_list = path_list[path];
    path_genes = gene_list.filter((d) => all_genes.includes(d));
    filtered_list[path] = path_genes;
  }
  res.send(filtered_list);
});

app.use("/submit", (req, res) => {
  var query = req.body;
  console.log(query);
});

app.use("/expression", (req, res) => {
  const nodes = req.body.nodes;
  const props = Object.keys(nodes[0].attributes);

  var timestamps = {};
  for (const prop of props) {
    if (prop.substring(0, 3) === "fc_") {
      var txt = prop
        .substring(3)
        .match(/[a-zA-Z]+|[0-9]+/g)
        .join(" ");
      timestamps[txt] = prop;
    }
  }
  timestamps = sortByTime(timestamps);

  row_nodes = [];
  var i = 0;
  Object.keys(timestamps).forEach(function (key) {
    row_nodes.push({ name: key, rank: i, clust: i });
    i++;
  });

  col_nodes = [];
  let mat = Array(row_nodes.length)
    .fill()
    .map(() => Array(nodes.length).fill(0));
  let p_mat = Array(row_nodes.length)
    .fill()
    .map(() => Array(nodes.length).fill(0));

  for (var i = 0; i < nodes.length; i++) {
    var label = nodes[i].label;
    var row = nodes[i].attributes;
    if("symbol" in row && row.symbol!=""){
        var cut = row.symbol.length;
        if (row.symbol.indexOf(',')!=-1 && row.symbol.indexOf(',')<cut) cut = row.symbol.indexOf(',');
        if (row.symbol.indexOf('|')!=-1 && row.symbol.indexOf('|')<cut) cut = row.symbol.indexOf('|');
        label = row.symbol.substr(0, cut);
    }
    col_nodes.push({ name: label, rank: i, clust: i });
    var j = 0;
    Object.keys(timestamps).forEach(function (key) {
      var value = nodes[i].attributes[timestamps[key]];
      var p_value = nodes[i].attributes["pval" + timestamps[key].substring(2)];
      p_mat[j][i] = p_value;
      mat[j][i] = value;
      j++;
    });
  }

  var exp = { row_nodes: row_nodes, col_nodes: col_nodes, mat: mat };
  var pval = { row_nodes: row_nodes, col_nodes: col_nodes, mat: p_mat };
  var data = { exp, pval };
  res.send(data);
});

app.use("/simple_network", (req, res) => {
  const nodes = req.body.nodes;
  ids = getIds(nodes);
  initTF(nodes);
  const edges = file.edges.filter(
    (d) => ids.includes(d.source) && ids.includes(d.target)
  );
  var graph = { nodes, edges };
  res.send(graph);
});

app.use("/neighborhood_network", (req, res) => {
  const query_nodes = req.body.nodes;
  const neighbor_number = req.body.neighbor_number;

  var query_ids = getIds(query_nodes);
  const node_edges = file.edges.filter(
    (d) => query_ids.includes(d.source) || query_ids.includes(d.target)
  );

  var neighbor_ids = [];
  for (var i = 0; i < node_edges.length; i++) {
    if (!query_ids.includes(node_edges[i].source))
      neighbor_ids.push(node_edges[i].source);
    if (!query_ids.includes(node_edges[i].target))
      neighbor_ids.push(node_edges[i].target);
  }

  const neighbour_nodes = file.nodes.filter((d) => neighbor_ids.includes(d.id));
  neighbour_nodes.sort((a, b) => a.attributes.rank - b.attributes.rank);
  neighbour_nodes.length = neighbor_number;

  for (var i = 0; i < neighbour_nodes.length; i++) {
    neighbour_nodes[i].attributes.neighbor = "true";
  }

  const nodes = query_nodes.concat(neighbour_nodes);
  ids = getIds(nodes);
  initTF(nodes);
  initNeighbour(query_nodes);

  const edges = file.edges.filter(
    (d) => ids.includes(d.source) && ids.includes(d.target)
  );

  fs.createReadStream(datapath+req.body.tissue.toUpperCase()+"/"+req.body.condition+"_full.csv")
  .pipe(csv({mapHeaders: ({ header, index }) => header.trim().toLowerCase()}))
  .on('data', function (row) {
    let ni = nodes.findIndex(d => d.label === row.label);
    row.rapid = row.label;
    delete row.id;
    delete row.label;
    if(ni != -1) nodes[ni].attributes = row;
  })
  .on('end', function () {
      var graph = { nodes, edges };
      res.send(graph);
  })
});

app.listen(3000, function () {
  console.log("Server started on port 3000.. ");
});
