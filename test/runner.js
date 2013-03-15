require('..'); // Require autoquit

// Setup the fake clock
var sinon = require('sinon');
var clock = sinon.useFakeTimers();

process.on('message', function (msg) {
    if (msg.clock) {
        clock.tick(msg.clock * 1000);
    }
});

// Take timeout from args, disconnect when done.
var options = {
    timeOut: process.argv[3] || 30,
    exitFn: function () {
        process.disconnect();
    }
};

// Start the server
var http = require('http');
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('alive');
});
server.autoQuit(options);
server.listen(process.argv[2]);
