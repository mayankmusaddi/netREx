var test = require('tape');
var fs = require('fs');
var path = require('path');
var split2 = require('split2');
var inputPath = path.resolve(__dirname + '/../package.json');
var outputPath = path.resolve(__dirname + '/output/package.json');

test('pipe split2 -> removes newlines', function(t) {
  var source = fs.createReadStream(inputPath);
  var target = fs.createWriteStream(outputPath);
  source.pipe(split2()).pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(inputPath, 'utf8');
    var output = fs.readFileSync(outputPath, 'utf8');
    t.notEqual(output, input);
    t.end();
  });
});

test('read small binary file -> corrupted binary version', function(t) {
  var i = path.resolve(__dirname + '/fixtures/favicon.ico');
  var o = path.resolve(__dirname + '/output/favicon.ico');
  var source = fs.createReadStream(i);
  var target = fs.createWriteStream(o);
  source.pipe(split2()).pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(i);
    var output = fs.readFileSync(o);
    t.true(!input.equals(output));
    t.end();
  });
});

test('read large binary file -> corrupted binary version', function(t) {
  var i = path.resolve(__dirname + '/fixtures/stream.html.pdf');
  var o = path.resolve(__dirname + '/output/newline.stream.html.pdf');
  var source = fs.createReadStream(i);
  var target = fs.createWriteStream(o);
  source.pipe(split2()).pipe(target);

  target.on('finish', function() {
    var input = fs.readFileSync(i, 'utf8');
    var output = fs.readFileSync(o, 'utf8');
    t.notEqual(output, input);
    t.end();
  });
});
