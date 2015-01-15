/**
 * Created by Alon & Tal on 13/1/2014.
 */

var http = require('http');
var fs = require('fs');
var webServer = require('./hujiwebserver.js');


function createHttpRequest(options, body, testNum, expectedStatusCode) {
    var req = http.request(options, function (res) {

        res.setEncoding = 'utf8';
        if (res.statusCode === expectedStatusCode)
        {
            console.log("test " + testNum + ": pass");
        }
        else {
            console.log("test " + testNum + ": failed. got " + res.statusCode + " instead of " + expectedStatusCode);
        }

        res.on('end', function() {
            console.log("ENDED");
        })
    });

    req.on('error', function(e) {
        console.log("ERROR: test " + testNum + " - " + e);
        console.log("Failed test " + testNum);
    });


    req.write(body);
    req.end();
}


function test1(path) {
    fs.stat(path, function (err, stats) {

        if (err || !stats.isFile()) {

            console.log("ERROR 1");
            return;
        }

        fs.readFile(path, 'ascii', function (err, data) {

            if (err) {
                console.log("ERROR READING FILE ");
                return;
            }

            var options = {
                hostname: 'localhost',
                port: 8888,
                method: 'PUT',
                headers: {
                    'connection' : "keep-alive",
                    'Content-Type' : 'text/plain',
                    'Content-Length' : data.length
                },
                path: '/uploads/uploadMe.txt'
            };

            createHttpRequest(options, data, 1, 200);
        });
    });
}


function test2() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0,
            'Cookie': 'name=Tal; name2=Alon'
        },
        path: '/ex2/green/innerFile.txt?firstName=liraz'

    };

    createHttpRequest(options, "", 2, 200);
}


function test3() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/only/post/someFile.txt'

    };

    createHttpRequest(options, "", 3, 404);
}


function test4() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/only/get/someFile.txt'

    };

    createHttpRequest(options, "", 4, 200);
}


function test5() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'POST',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/only/post/someFile.txt'

    };

    createHttpRequest(options, "", 5, 200);
}


function test6() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'PUT',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/only/put/someFile.txt'

    };

    createHttpRequest(options, "", 6, 200);
}


function test7() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'DELETE',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/only/delete/someFile.txt'

    };

    createHttpRequest(options, "", 7, 200);
}


function test8() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'DELETE',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/only/delete/notExist.txt'

    };

    createHttpRequest(options, "", 8, 200);
}


function test9() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'DELETE',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/../../someFile.js'

    };

    createHttpRequest(options, "", 9, 404);
}

function setUpServerAndUseCases() {

    webServer.start(8888,  function(err, server) {

        if (err) {
            console.log("Error: " + err);
            server.close();
            return
        }

        console.log("Server Connected Successfully!");
        console.log("------------------------------");

        var myUseExplanation = webServer.myUse('/uploads').toString();
        console.log("myUse explanation:");
        console.log(myUseExplanation);
        console.log("------------------------------");

        server.use('/ex2/:color', function(request, response, next){

            if (request.params.color === 'green' && request.param('firstname') === 'liraz' &&
            request.cookies.name === 'tal' && request.cookies.name2 === 'alon') {
                console.log("pass testing extracting param values");
            }
            else {
                console.log("failed testing extracting param values");
            }

            response.status(200).send("handled by the first 'use'. next is called so verify that also the second " +
            "handler has been invoked");

            next();
        });

        server.use('/ex2', function(request, response, next){

            try {
                var fullPath = getFullPath(request.path);

                // verify that the received root folder  exists
                if (!fs.existsSync(fullPath)) {
                    if (response.statusCode === 404) {
                        console.log("file not found");
                    }
                }
            } catch (e) {}

            response.status(200).send("handled by the second 'use'. next is called but there isn't another resource " +
            "handler");

            next();
        });

        server.get('/only/get/', function(request, response, next){
            response.status(200).send("handled by the first 'get'.");
        });

        // this method send only the handler !!
        server.post(function(request, response, next){
            response.status(200).send("handled by the first 'post'.");
        });

        server.put('/only/put', function(request, response, next){
            response.status(200).send("handled by the first 'put'.");
        });

        server.delete('/only/delete', function(request, response, next){
            response.status(200).send("handled by the first 'delete'.");
        });

        test1('./uploadMe.txt');
        test2();
        test3();
        test4();
        test5();
        test6();
        test7();
        test8();
        test9();

        server.stop();
    });
}


function runTests() {

    setUpServerAndUseCases();
}

runTests();