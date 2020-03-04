var test = require('tape');
var fs = require('fs');
var path = require('path');
var newLineStream = require('../string');
var inputPath = path.resolve(__dirname + '/../package.json');
var outputPath = path.resolve(__dirname + '/output/package.json');

test('pipe newLine stream to writable stream', function(t) {
  var source = fs.createReadStream(inputPath);
  var target = fs.createWriteStream(outputPath);
  var newLine = newLineStream();
  source.pipe(newLine).pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(inputPath, 'utf8');
    var output = fs.readFileSync(outputPath, 'utf8');
    t.equal(output, input);
    t.end();
  });
});

test('read small binary file and pipe newLine stream to writable stream', function(t) {
  //var i = path.resolve(__dirname + '/fixtures/stream.html.pdf');
  //var o = path.resolve(__dirname + '/output/stream.html.pdf');
  var i = path.resolve(__dirname + '/fixtures/favicon.ico');
  var o = path.resolve(__dirname + '/output/favicon.ico');
  var source = fs.createReadStream(i);
  var target = fs.createWriteStream(o, {encoding: 'utf8'});
  var newLine = newLineStream();
  source.pipe(newLine).pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(i, 'utf8');
    var output = fs.readFileSync(o, 'utf8');
    t.equal(output, input);
    t.end();
  });
});

test('read large binary file and pipe WITHOUT newLine stream to writable stream', function(t) {
  var i = path.resolve(__dirname + '/fixtures/stream.html.pdf');
  var o = path.resolve(__dirname + '/output/stream.html.pdf');
  var source = fs.createReadStream(i);
  var target = fs.createWriteStream(o, {encoding: 'utf8'});
  var newLine = newLineStream();
  source.pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(i, 'utf8');
    var output = fs.readFileSync(o, 'utf8');
    t.equal(output, input);
    t.end();
  });
});


test('read large binary file, pipe with string version -> corrupted file', function(t) {
  var i = path.resolve(__dirname + '/fixtures/stream.html.pdf');
  var o = path.resolve(__dirname + '/output/newline.stream.html.pdf');
  var source = fs.createReadStream(i);
  var target = fs.createWriteStream(o, {encoding: 'utf8'});
  var newLine = newLineStream();
  source.pipe(newLine).pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(i, 'utf8');
    var output = fs.readFileSync(o, 'utf8');
    t.notEqual(output, input);
    t.end();
  });
});

test('output file with line numbers', readNewLine);

test('output file with line numbers :: for the second time', readNewLine);

function readNewLine(t) {
  t.plan(6);
  var source = fs.createReadStream(inputPath);
  var nr = 0, found = 0;
  var newLine = newLineStream();
  source.pipe(newLine);

  newLine.on('readable', function() {
    var line;
    while (line = newLine.read()) {
      nr++;
      transform(nr, line);
    }
  });

  newLine.on('line', function(line){
    transform(nr, line);
  });

  function transform(nr, line) {
    var str = nr + ': ' + line;

    switch (nr) {
      case 1:
        t.equal(str, '1: {\n');
        break;
      case 10:
        t.equal(str, '10:     "type": "git",\n');
        break;
      case 30:
        t.equal(str, '30: }\n');
        break;
    }
  }

}