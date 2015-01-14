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



function createHttpRequest(options, body, testNum) {
    var req = http.request(options, function (res) {

        res.setEncoding = 'ascii';
        if (res.statusCode !== 200)
        {
            //console.log(res)
        }

        console.log("AA");

        //res.on('data', function (resData) {
        //
        //    console.log(resData.toString());
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
                //body: fileContent

            };

            createHttpRequest(options, data, 1);
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

    createHttpRequest(options, "", 2);
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

        webServer.myUse('/uploads');

        server.use('/ex2/innerDir', function(request, response, next){

            console.log("Here 1");

            response.status(200).send("handled by the first 'use'. next is called so verify that also the second" +
            " handler has been invoked");
            next();
        });

        server.use('/ex2', function(request, response, next){

            console.log("Here 2");
            //response.status(200).send("handled by the second 'use'");

            setTimeout(function() {

                response.status(200).send("handled by the second 'use'");
            }, 300);
        });

        server.get('/onlyGet', function(request, response, next){
            response.status(200).send("handled by the first 'get' only");
        });

        //test1('./iosi.txt');
        // TODO - There is an error during 'next' call. the second handler are not invoked.
        test2();

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










