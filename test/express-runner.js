require('..'); // Require autoquit
var express = require('express');

// Setup the fake clock
var sinon = require('sinon');
var clock = sinon.useFakeTimers();

// Take timeout from args, disconnect when done.
var options = {
    timeOut: process.argv[3],
    exitFn: function () {
        process.disconnect();
    }
};

// Create express app
var app = express();
app.get('/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('alive');
});

// Start the server
var http = require('http');
var server = http.createServer(app);
server.autoQuit(options);
server.listen(process.argv[2]);

// Message handling
process.on('message', function (msg) {
    if (msg.clock) {
        clock.tick(msg.clock * 1000);
    }
    if (msg.ping) {
        process.send({ ping: true });
    }
});
