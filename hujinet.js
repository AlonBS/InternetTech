/**
 * Created by Alon & Tal on 21/12/2014.
 */

exports.createServer = function(port, onRequestArrival, callBackFunc) {

    var net = require('net');
    var server = net.createServer(function(socket) { //'connection' listener

        socket.buffer = "";
        socket.on('data', function(data) {
            this.buffer += data;
            onRequestArrival(this.buffer.toString(), socket);
        });

        socket.on('end', function() {/*do nothing */});

        socket.on('uncaughtException', function(err) {

            errMsg = "";
            if (err) {
                errMsg = "Server had an uncaught exception"
            }

            callBackFunc(errMsg)
        });


        socket.on('error', function(err) {
            if (err.code == 'ECONNRESET') {
                callBackFunc("");
                return;
            }

            callBackFunc(err.toString())
        });


        socket.setTimeout(2000, function() {
            socket.end();
        });
    });


    server.listen(port, function(err) {
        if (err) {
            callBackFunc("Server was unable to listen on the received port");
        }
        else {
            callBackFunc()
        }
    });

    server.on('error', function(err) {

        if (err.code == 'EADDRINUSE') {
            callBackFunc("Address already in use.\nServer is down.")
        }

        callBackFunc(err.toString())
    });

    return server;
};