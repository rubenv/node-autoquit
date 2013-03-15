assert = require 'assert'
child_process = require 'child_process'

child = null
running = false
port = 0

startChild = (timeout) ->
    port = 15000 + Math.floor(Math.random() * 5000)
    running = true
    child = child_process.fork 'test/runner.js'
    child.on 'disconnect', () -> running = false

advanceClock = (seconds) ->
    child.send clock: seconds

describe "Autoquit", ->
    it "Should quit after a certain amount of time", (done) ->
        startChild()
        assert(running)
        advanceClock(30)
        child.once 'disconnect', done

    it "Should reset stay alive period when a request comes in"
    it "Can customize timeout period"
