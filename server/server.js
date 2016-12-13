var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');

var app = express();
var port = process.env.PORT || 80;

app.use( cors() );
app.use( bodyParser.text() );

// routes will go here
app.post('/command', function(req, res) {
    var param = req.body.trim();
    var output = "";
    console.log('Request param: ' + param);

    switch (param) {
        case "version":
            output = 'Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz';

            console.log('Response: ' + output);
            res.send(output);
        break;
        case 'ls -s':
            output = "config 21080" + '\n';
            output += "firmware.cur 284520" + '\n';
            output += "tt.nc 7500020" + '\n';
            output += "gcode/" + '\n';
            output += "linearballbearingmount.nc 20140" + '\n';

            console.log('Response: ' + output);
            res.send(output);
        break;
        case 'ls -s /gcode':
            output = "file1.gcode 21080" + '\n';
            output += "file2.gcode 184520" + '\n';
            output += "file3.gcode 84520" + '\n';
            output += "file4.gcode 384520" + '\n';

            console.log('Response: ' + output);
            res.send(output);
        break;
        case 'get pos':
            output = 'last C: X:100.10 Y:101.11 Z:102.12' + '\n';
            output += 'realtime LMS: X:10.10 Y:11.11 Z:12.12' + '\n';

            console.log('Response: ' + output);
            res.send(output);
        break;
        default:
            res.send('Hello world!');
        break;
    }
});

app.get('/sd/config', function (req, res) {
    var file = fs.readFileSync('config', 'utf8');
    res.send(file);
});

app.options("/*", function(req, res, next){
    res.sendStatus(200);
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);
