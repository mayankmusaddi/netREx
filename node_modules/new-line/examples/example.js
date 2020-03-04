var fs = require('fs');
var newLineStream = require('new-line');
var source = fs.createReadStream('./package.json');
var target = fs.createWriteStream('./out.json');
var newLine = newLineStream();

// pipes the source line by line (unmodified) into the target
source.pipe(newLine).pipe(target);


var nr = 0;
newLine.on('line', function(line) {
  console.log(++nr + ': ' + line);
});