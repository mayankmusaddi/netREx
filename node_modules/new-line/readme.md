# new-line

simple new line stream for node.js stream2
it also handles files (streams) that contain bytes > 0x7f (binary files) gracefully,
and does not change the bytes, other than e.g. `split` or `split2`.

## install

```bash
npm install new-line

# for node 0.8 also install:
npm install readable-stream
```


## use

```js
var fs = require('fs');
var newLineStream = require('new-line');
var source = fs.createReadStream('./package.json');
var target = fs.createWriteStream('./out.json');
var newLine = newLineStream();
source.pipe(newLine).pipe(target);

var nr = 0;
newLine.on('line', function(line) {
  console.log(++nr + ': ' + line);
});
```

## test

```bash
npm test
```

## license
MIT