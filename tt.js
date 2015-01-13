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



function createHttpRequest(fileContent) {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'PUT',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : fileContent.length
        },
        path: '/uploads'
        //body: fileContent

    };

    var req = http.request(options, function (res) {
        res.setEncoding = 'utf8';

        if (res.statusCode !== 200)
        {
            //console.log(res)
        }

        res.on('data', function (resData) {

            console.log(resData.toString());
        });
    });

    req.on('error', function(e) {
        console.log("ERROR: test 1 - " + e);
        console.log("Failed test 1")
    });

    req.write(fileContent);
    req.end();
}


function test1(path) {

    fs.stat(path, function (err, stats) {

        if (err || !stats.isFile()) {

            console.log("ERROR 1");
            return;
        }

        fs.readFile(path, 'utf8', function (err, data) {

            if (err) {
                console.log("ERROR READING FILE ");
                return;
            }

            httpRequest = createHttpRequest(data);

        });
    });
}




function setUpServerAndUseCases() {

    var a = webServer.start(8888,  function(err, server) {

        if (err) {
            console.log("Error: " + err);
            server.close();
            return
        }

        console.log("Server Connected Successfully!");
        console.log("------------------------------");
    });

    a.use();

    webServer.myUse('/uploads');
}




function runTests() {

    setUpServerAndUseCases();

    //test1('./generalDesign')


}

var path = require('path')



var a = path.normalize("/ex2/index.html");

var b = path.normalize('^\\\\ex2');
console.log("B: " + b);

var b = new RegExp("^\\ex2");

console.log(a);
console.log(b);

var c = a.match(b);

console.log(c);




