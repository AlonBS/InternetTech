/**
 * Created by Alon & Tal on 13/1/2014.
 */

var webServer = require('./hujiwebserver.js');
var net = require('net');
var portNum = 8888;
var numOfClients = 400; // This number is architecture dependent. On our computer, 400 was possible.

var httpRequest = "GET /ex2/index.html HTTP/1.1\nConnection: keep-alive\r\n\r\n";

function loadServer_1() {

    console.log("-----Starting Load Test 1--------");
    console.log("---------------------------------");

    var clients = [];
    var successes = 0;

    for (var i = 0; i < numOfClients; ++i) {

        ( function(c) {
            clients[c] = net.connect({port: portNum})
            clients[c].on('error', function () {
                console.log("Error occurred on client " + c + ".");
            });
        }(i));
    }

    for (var i = 0; i < numOfClients; ++i) {

        ( function(c) {

            clients[c].write(httpRequest);
            clients[c].on('data', function (data) {
                ++successes;
            });
        }(i));
    }

    setTimeout(function() {

        console.log("*************RESULTS************");
        console.log("Requests handled successfully: " + successes + " out of " + numOfClients + ".");

        console.log("Load Test 1 Ended - check results");
        console.log("---------------------------------");

    }, 2500);
}



function loadServer_2() {

    console.log("-----Starting Load Test 2--------");
    console.log("---------------------------------");

    var clients = [];
    var successes = 0;

    for (var i = 0; i < numOfClients; ++i) {

        (function(c) {

            clients[c] = net.connect({port: portNum}, function () {
                clients[c].write(httpRequest);
            });

            clients[c].on('data', function (data) {
                ++successes;
            });

            clients[c].on('error', function () {
                console.log("Error occurred on client " + c + ".");
            });

        }(i));
    }


    setTimeout(function() {

        console.log("*************RESULTS************");
        console.log("Requests handled successfully: " + successes + " out of " + numOfClients + ".");

        console.log("Load Test 2 Ended - check results");
        console.log("---------------------------------");

    }, 2500);
}



function runLoadTest() {

    webServer.start(portNum,  function(err, server) {

        console.log("Server connected successfully");
        console.log("-----------------------------");

        webServer.static("/ex2"); // we check load test against static requests
        loadServer_1();

        setTimeout(function() { // We wait a bit before trying the second load test.
            loadServer_2();
        }, 5000);
    });
}


runLoadTest();

