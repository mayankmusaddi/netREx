const express = require("express");
const app = express();
const path = require('path');

app.use(express.static('frontend'));
app.use(express.urlencoded({ extended: false }));

// app.get("/", (req,res) => {
//     res.send("Hello World");
// });

// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

// app.get('/', function (req, res) {
//     res.render('/file', {
//       pass: 'arguments',
//       to: 'the file here'
//     });
//   });


const Transform = require('stream').Transform;
const fs = require('fs');
const parser = new Transform();
const newLineStream = require('new-line');



// app creation code removed for brevity

app.use('/graph', (req, res) => {
    var data1 = JSON.stringify(req.body);
    console.log('body: ' + data1);

    parser._transform = function(data, encoding, done) {
        const str = data.toString().replace('</body>', '<script>var data = '+data1+';</script></body>');
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


app.post('/graph', function(req, res){
    var data = JSON.stringify(req.body);
    console.log('body: ' + data);
    // res.render('/file', {
    //     pass: data,
    //     to: '../views/graph.html'
    // });
    // res.sendFile(path.join(__dirname+'/../frontend/graph.html'));
    res.redirect(path.join(__dirname+'/../frontend/graph.html'));
});

app.listen(3000, function(){
    console.log("Server started on port 3000.. ");
})