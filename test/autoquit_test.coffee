http = require 'http'
async = require 'async'
assert = require 'assert'
child_process = require 'child_process'

child = null
running = false
port = 0

startChild = (timeout = 30) ->
    port = 15000 + Math.floor(Math.random() * 5000)
    running = true
    child = child_process.fork 'test/runner.js', [port, timeout]
    child.on 'disconnect', () -> running = false

advanceClock = (seconds) ->
    assert(running)
    child.send clock: seconds

advanceClockAsync = (seconds) ->
    (cb) ->
        assert(running)
        child.send(clock: seconds)
        cb()

assertRunning = (cb) ->
    child.once 'message', () ->
        assert(running)
        cb()
    child.send ping: true

assertExits = (cb) ->
    (err) ->
        return done(err) if err
        # Should end
        child.once 'disconnect', cb

pokeServer = (cb) ->
    http.get 'http://localhost:' + port, (res) ->
        assert.equal(res.statusCode, 200)
        cb()

describe "Autoquit", ->
    it "Should quit after a certain amount of time", (done) ->
        startChild()
        assertRunning () ->
            advanceClock(30)
            child.once 'disconnect', done

    it "Should reset stay alive period when a request comes in", (done) ->
        startChild()
        async.series [
            assertRunning
            advanceClockAsync(16)
            # Should still be running, send call:
            assertRunning
            pokeServer
            assertRunning
            # Move the clock forward, 32 seconds after start
            advanceClockAsync(16)

            # Should still be running if the interval has been reset
            assertRunning
            advanceClockAsync(16)
        ], assertExits(done)

    it "Can customize timeout period", (done) ->
        # Default test runner has 30 seconds timeout. We've tested above that it
        # stays alive for 16 seconds. Let's try 5.
        startChild(5)
        async.series [
            assertRunning
            advanceClockAsync(4)
            assertRunning
            advanceClockAsync(2)
        ], assertExits(done)
