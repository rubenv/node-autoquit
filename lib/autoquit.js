var net = require('net');

var Server = net.Server;

Server.prototype.autoQuit = function (options) {
    var self = this;

    options = options || {};
    options.timeOut = options.timeOut || 600;
    self._autoQuit = {
        options: options,
        connections: 0,
        lastActive: null,
        timeOutHandler: null
    };

    var aquit = self._autoQuit;

    var shutdown = function () {
        try {
            self.close();
        } catch (e) {
            // Ignore, nothing we can do about it (fails on some older Node.js versions).
        }
        if (aquit.options.exitFn) {
            aquit.options.exitFn();
        } else {
            process.exit(0);
        }
    };

    var shutdownIfNeeded = function () {
        aquit.timeOutHandler = null;
        if (aquit.connections > 0) {
            // Still have connections!
            return;
        }

        var closeAt = aquit.lastActive + aquit.options.timeOut * 1000;
        if (closeAt > new Date().getTime()) {
            // Reschedule when we actually need to shut down.
            aquit.timeOutHandler = setTimeout(shutdownIfNeeded, closeAt - new Date().getTime());
            return;
        }

        shutdown();
    };

    var isInactive = function () {
        // We don't have any connections anymore, schedule a shutdown.
        aquit.lastActive = new Date().getTime();
        if (aquit.timeOutHandler == null) {
            var interval = aquit.options.timeOut * 1000;
            aquit.timeOutHandler = setTimeout(shutdownIfNeeded, interval);
        }
    };

    var countConnection = function (request) {
        aquit.connections += 1;
        request.on('end', countDisconnect);
    };

    var countDisconnect = function () {
        aquit.connections -= 1;
        if (aquit.connections === 0) {
            isInactive();
        }
    };

    self.on('request', countConnection);

    isInactive();
};
