var stream = require('stream');
// node.js 0.8 compatibility
if (!stream.Transform) {
  stream = require('readable-stream');
}

module.exports = function() {
  var newLine = new stream.Transform({objectMode: true});
  var separator = '\n'.charCodeAt(0);

  newLine._transform = function(chunk, encoding, done) {

    // no buffer
    if (!Buffer.isBuffer(chunk)) {
      this.push(chunk);
      done();
      return;
    }

    // buffer
    if (this._lastLineData) chunk = Buffer.concat([this._lastLineData, chunk]);

    var i, begin = 0;
    for (i = 0; i< chunk.length; i++) {
      if (chunk[i] === separator) {
        var lbuf = chunk.slice(begin, i+1);
        this.push(lbuf);
        this.emit('line', lbuf.toString());
        begin = i+1;
      }
    }

    if (begin < chunk.length - 1) this._lastLineData = chunk.slice(begin, chunk.length);

    done();
  };

  newLine._flush = function(done) {
    if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
    done();
  };

  return newLine;
};

