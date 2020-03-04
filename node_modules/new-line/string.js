// original source: https://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/

var stream = require('stream');
// node.js 0.8 compatibility
if (!stream.Transform) {
  stream = require('readable-stream');
}

module.exports = function() {
  var newLine = new stream.Transform({objectMode: true});
  var separator = '\n';

  newLine._transform = function(chunk, encoding, done) {
    var self = this;

    if (!Buffer.isBuffer(chunk)) {
      this.push(chunk);
      done();
      return;
    }

    var data = chunk.toString('utf8');

    if (this._lastLineData) data = this._lastLineData + data;

    var lines = data.split(separator).map(function(value, i, arr){
      if (arr.length -1 !== i) return value + separator;
      return value;
    });
    this._lastLineData = lines.splice(lines.length - 1, 1)[0];

    lines.forEach(function(line){
      self.push(line);
      self.emit('line', line);
    });

    done();
  };

  newLine._flush = function(done) {
    if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
    done();
  };

  return newLine;
};

