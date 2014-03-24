# autoquit

> Automatically quit node.js servers when inactive.

[![Build Status](https://travis-ci.org/rubenv/node-autoquit.png?branch=master)](https://travis-ci.org/rubenv/node-autoquit)

Detects when a server has been inactive for a period of time and shuts it down.

Designed to be used in combination with something like node-systemd: https://github.com/rubenv/node-systemd

More info on why you'd want to use this module: http://savanne.be/articles/deploying-node-js-with-systemd/

## Usage

You can install the latest version via npm:

```
$ npm install autoquit
```

Require the autoquit module. It will monkey-patch the support for auto-quitting into net.Server.

```js
require('autoquit');
```

Create an app as usual and call the `autoQuit` method. Do this before calling `listen` to avoid inconsistencies in the connection counting.

```js
var http = require('http');
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
});
server.autoQuit();
server.listen(1337);
```

Do a request to your service:

```
# curl -i http://localhost:1337/
HTTP/1.1 200 OK
Content-Type: text/plain
Connection: keep-alive
Transfer-Encoding: chunked

Hello World
```

After 10 minutes of inactivity (the default), it will close the server.

## Specifying options

You can pass options as an object to the `autoQuit` call:

```js
server.autoQuit({ timeOut: 900 });
```

Accepted options:

* `timeOut`: number of seconds of inactivity before triggering the shutdown method.    
* `exitFn`: A function that will be invoked when shutting down. If this is not supplied, the default action is to invoke `process.exit(0);`.

## License 

    (The MIT License)

    Copyright (C) 2011-2014 by Ruben Vermeersch <ruben@rocketeer.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
