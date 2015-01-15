//// user/:name/y
//function transformToRegex(r, request) {
//
//    var endsWithSlash = r.indexOf('/', r.length - 1) !== -1;
//    var suffix = endsWithSlash ? '?.*$' : '/?.*$';
//    var regex = new RegExp( '^' + r.replace(/(:[a-zA-Z0-9]+|\*)/g, ".*") + suffix);
//
//    console.log(regex)
//    console.log(request)
//
//    console.log(regex.test(request))
//
//}
//
//
//
//
//
//function temp1(req) {
//
//    var requestLine = req.substring(0, req.regexIndexOf(/[\r\n]/));
//    console.log(requestLine);
//
//    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
//    var requestLineMatch = requestLineRegex.exec(requestLine);
//
//    console.log(requestLineMatch[0]);
//    console.log(requestLineMatch[1]);
//    console.log(requestLineMatch[2]);
//    console.log(requestLineMatch[3]);
//    console.log(requestLineMatch[4]);
//    console.log(requestLineMatch[5]);
//
//
//
//}
//
//var msg = "POST /name=tobi HTTP/1.1\n" +
//    "Content-Type: text/xml\n" +
//    "Host: http://www.example.com:3000\n" +
//    "Content-Length: 10\n\n" +
//    "This is the body!!!";
//
//
////temp1(msg);
//
//
//
//
//
//
//var methodOptions = ["options", "get", "head", "post", "put", "delete", "trace", "connect"];
//
//// checks if httpRequest.method is valid (i.e, it exists in methodOptions map)
//var isContained = false;
//for (var i in methodOptions) {
//    console.log(methodOptions[i]);
//}
//
//








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

        //console.log("AA");

        //res.on('data', function (resData) {
        //    console.log("::: " + resData.toString());
        //});

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

//function checkTest(receivedCode, resourceHandler) {
//    if (expectedTestResults[testId] === receivedCode) {
//        console.log("test " + testId + ": pass, by handler " + resourceHandler);
//    }
//    else {
//        console.log("test " + testId + ": failed. got " + receivedCode + " instead of " + expectedTestResults[testId] +
//        ", by handler " + resourceHandler);
//    }
//}


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
                path: '/uploads/iosi.txt'
            };

            createHttpRequest(options, data, 1, 200);
        });
    });
}


// should return the content of innerFile.txt
function test2() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0
        },
        path: '/ex2/innerDir/innerFile.txt'

    };

    createHttpRequest(options, "", 2, 200);
}


// should return 404 - not found
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


// should return return 200 - pass
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

// should return return 200 - pass
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


// should return return 200 - pass
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


// should return return 200 - pass
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


// should return return 404
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
        path: '/ex2/notExist.txt'

    };

    createHttpRequest(options, "", 8, 404);
}


// should return return 404
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
        path: '/../ex3/alonTest.js'

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

        // TODO: this is the correct format to use 'static' server
        //server.use("/", webServer.static("/"));


        webServer.myUse('/uploads');

        server.use('/ex2/innerDir', function(request, response, next){

            /*if (response.statusCode === 200)
                console.log("handled by the first 'use'. next is called so verify that also the second handler has " +
                "been invoked");
            else
                console.log("handled by the first 'use', but got failure");*/

            response.status(200).send("handled by the first 'use'. next is called so verify that also the second " +
            "handler has been invoked");

            //checkTest(response.statusCode, "first 'use'");

            next();
        });

        server.use('/ex2', function(request, response, next){

            /*if (response.statusCode === 200)
                console.log("handled by the second 'use'. next is called but there isn't another resource handler");
            else
                console.log("handled by the second 'use', but got failure");

            //console.log("Here 2");*/

            console.log("w:: " + request.path);

            response.status(200).send("handled by the second 'use'. next is called but there isn't another resource " +
            "handler");

            //checkTest(response.statusCode, "second 'use'");

            next();


            //response.status(200).send("handled by the second 'use'");
            //setTimeout(function() {
            //
            //    response.status(200).send("handled by the second 'use'");
            //}, 300);
        });

        server.get('/only/get', function(request, response, next){
            response.status(200).send("handled by the first 'get'.");

            /*if (response.statusCode === 200)
                console.log("handled by the first 'get'.");
            else
                console.log("handled by the first 'get', but got failure");*/

            //checkTest(response.statusCode, "first get");
        });

        // this method send only the handler !!
        server.post(/*'/only/post', */function(request, response, next){
            response.status(200).send("handled by the first 'post'.");

            /*if (response.statusCode === 200)
                console.log("handled by the first 'post'.");
            else
                console.log("handled by the first 'post', but got failure");*/

            //checkTest(response.statusCode, "first post");
        });

        server.put('/only/put', function(request, response, next){
            response.status(200).send("handled by the first 'put'.");

            /*if (response.statusCode === 200)
                console.log("handled by the first 'put'.");
            else
                console.log("handled by the first 'put', but got failure");*/

            //checkTest(response.statusCode, "first put");
        });

        server.delete('/only/delete', function(request, response, next){
            response.status(200).send("handled by the first 'delete'.");

            /*if (response.statusCode === 200)
                console.log("handled by the first 'delete'.");
            else
                console.log("handled by the first 'delete', but got failure");*/

            //checkTest(response.statusCode, "first delete");
        });

        test1('./iosi.txt');
        // TODO - There is an error during 'next' call. the second handler are not invoked.
        test2();
        test3();
        test4();
        test5();
        test6();
        test7();
        test8();
        test9();
    });
}




function runTests() {

    setUpServerAndUseCases();

}

runTests();

/*
1. verify resources with the same resource
2. verify longest path compared to the resource
3. verify extracting params via colons and '?' sign
4. verify cookies
5. verify registering to 'get'
6. check for unauthorized access

write doc.html that explains what we are testing..

 */










