var http = require('http');
var async = require('async');
var assert = require('assert');
var child_process = require('child_process');

var child = null;
var running = false;
var port = 0;
var runner = null;

function startChild(timeout) {
    if (timeout == null) {
        timeout = 30;
    }
    port = 15000 + Math.floor(Math.random() * 5000);
    running = true;
    child = child_process.fork("test/" + runner + ".js", [port, timeout]);
    child.on('disconnect', function () {
        running = false;
    });
}

function advanceClock(seconds) {
    assert(running);
    child.send({
        clock: seconds
    });
}

function advanceClockAsync(seconds) {
    return function (cb) {
        assert(running);
        child.send({
            clock: seconds
        });
        cb();
    };
}

function assertRunning(cb) {
    child.once('message', function () {
        assert(running);
        cb();
    });
    child.send({
        ping: true
    });
}

function assertExits(cb) {
    return function (err) {
        if (err) {
            return cb(err);
        }
        // Should end
        child.once('disconnect', cb);
    };
}

function pokeServer(cb) {
    var options = {
        hostname: 'localhost',
        port: port,
        agent: false
    };
    http.get(options, function (res) {
        assert.equal(res.statusCode, 200);
        cb();
    });
}

function runTests() {
    it("Should quit after a certain amount of time", function (done) {
        startChild();
        assertRunning(function () {
            advanceClock(30);
            child.once('disconnect', done);
        });
    });

    it("Should reset stay alive period when a request comes in", function (done) {
        startChild();
        async.series([
            assertRunning,
            advanceClockAsync(16),
            // Should still be running, send call:
            assertRunning,
            pokeServer,
            assertRunning,
            // Move the clock forward, 32 seconds after start
            advanceClockAsync(16),

            // Should still be running if the interval has been reset
            assertRunning,
            advanceClockAsync(16)
        ], assertExits(done));
    });

    it("Can customize timeout period", function (done) {
        // Default test runner has 30 seconds timeout. We've tested above that it
        // stays alive for 16 seconds. Let's try 5.
        startChild(5);
        async.series([
            assertRunning,
            advanceClockAsync(4),
            assertRunning,
            advanceClockAsync(2)
        ], assertExits(done));
    });
}

runner = 'runner';
describe("Plain HTTP server", runTests);

runner = 'express-runner';
describe("Express", runTests);
