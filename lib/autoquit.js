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
        self.getConnections(function (err, count) {
            if (!err && count > 0) {
                // Still have connections!
                aquit.lastActive = new Date().getTime();
            }

            var closeAt = aquit.lastActive + aquit.options.timeOut * 1000;
            var now = new Date().getTime();
            // Allow some tolerance as setTimeout callbacks are not precise
            if (closeAt > now + 100) {
                // Reschedule when we actually need to shut down.
                if (aquit.timeOutHandler === null) {
                    aquit.timeOutHandler = setTimeout(shutdownIfNeeded, closeAt - now);
                }
                return;
            }
            shutdown();
        });
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
