
var webServer = require('./hujiwebserver.js');
var net = require('net');
var http = require('http');
var fs = require('fs');
var pathModule = require ('path');
var parser = require ('./hujiparser.js');
var requestModule = require ('./HttpRequest.js');
var responseModule = require ('./HttpResponse.js');

var rootFolder = "";


function serverOnCallBack(err) {

    if (err) {
        console.log("An error has occurred: " + err);
    }
    else {

        console.log("Server connected successfully");
    }
}


function serverOffCallBack(err) {

    if (err) {
        console.log("An error has occurred: " + err);
    }
    else {

        console.log("Server disconnected successfully");
    }
}

function test_1() {

    setTimeout(function(){

        var options = {
            hostname: 'localhost',
            port: 8888,
            method: 'GET',
            headers: {
                connection : "keep-alive"
            },
            path: '/ex2/index.html'
        };

        var req = http.request(options, function (res) {
            res.setEncoding = 'utf8';

            if (res.statusCode !== 200 ||
                res.headers['content-type'] !== "text/html" ||
                res.headers['content-length'] !== '209')
            {
                console.log("index.html length is: " + res.headers['content-length']);
                console.log("failed getting '/ex2/index.html' file.");
            }
            else
            {
                console.log("Passed test 1")
            }

            res.on('data', function (resData) {

                // console.log(resData) We don't need to print the actual data

            });
        });

        req.on('error', function(e) {
            console.log("ERROR: test 1 - " + e);
            console.log("Failed test 1")
        });

        req.end();

    }, 100)
}

/**
 * Tests for non-existing file
 */
function test_2() {

    setTimeout(function(){

        var options = {
            hostname: 'localhost',
            port: 8888,
            method: 'GET',
            path: '/ex2/no_such_file.html'
        };

        var req = http.request(options, function (res) {
            res.setEncoding = 'utf8';

            if (res.statusCode !== 404) {
                console.log("Failed Test 2");
            }
            else
            {
                console.log("Passed Test 2")
            }

            res.on('data', function (resData) {

                // console.log(resData) We don't need to print the actual data

            });
        });

        req.on('error', function(e) {
            console.log("ERROR: test 1 - " + e);
            console.log("Failed test 1")
        });

        req.end();

    }, 200)
}

/**
 * Other method names check (including capitalization check)
 */
function test_3() {

    test_1c_helper('POST', 100)
    test_1c_helper('delete', 200)
    test_1c_helper('HEAD', 300)
    test_1c_helper('PuT', 400)
}


function test_1c_helper(method, time) {

    setTimeout(function(){

        var options = {
            hostname: 'localhost',
            port: 8888,
            method: method,
            headers: {
                connection : "keep-alive"
            },
            path: '/ex2/main.js'
        };


        var req = http.request(options, function (res) {
            res.setEncoding = 'utf8';

            if (res.statusCode !== 200 ||
                res.headers['content-type'] !== "application/javascript" ||
                res.headers['content-length'] !== '9431')
            {
                console.log("Failed test 3");
            }
            else
            {
                console.log("Passed test 3 for " + method)
            }

            res.on('data', function (resData) {

                // console.log(resData) We don't need to print the actual data

            });
        });

        req.on('error', function(e) {
            console.log("ERROR: test 1 - " + e);
            console.log("Failed test 1")
        });

        req.end();

    }, 200 + time)
}


/**
 * Send different requests from 200 different clients
 */
function test_4() {

    setTimeout(function(){

        clients = []
        for (var i = 0 ;  i < 200 ; ++i ) {
            clients[i] = net.connect({port: 8888});
        }

        var count = 0;
        for (var i = 0 ; i < 200 ; ++i) {

            clients[i].on('data', function(data) {

                this.end();
                if (++count > 399) {
                    console.log("Passed Test 4")
                }
            });

            clients[i].on('error', function(err) {
                console.log(err)
            });
        }

        for (var i = 0 ; i < 200 ; ++i) {
            clients[i].write("GET ex2/style.css HTTP/1.1\n\n");
        }
    }, 1200);
}



function run_tests() {
    try {
        rootFolder = pathModule.resolve(rootFolder);

        // verify that the received root folder is exists
        if (!fs.existsSync(rootFolder)) {
            rootFolder = "";
        }
    } catch (e) {
        rootFolder = "";
    }

    var serverId = webServer.start(8888, rootFolder, serverOnCallBack);

    setTimeout(function(){

        test_1();
        test_2();
        test_3();
        test_4();

        setTimeout(function(){

            webServer.stop(serverId, serverOffCallBack);

        }, 10000)

    }, 1000)
}


//run_tests();

//var x = JSON.stringify([1,2,3]);
//console.log(x);
//
////var ;
//switch (typeof (x)) {
//    case 'string':
//        console.log("hi1");
//        break;
//    case 'object':
//        console.log("hi2");
//        break;
//}

//function fillQueryParams(queryParams) {
//    var query = {};
//    var splittedQueryParams = queryParams.split("&");
//
//    for (var i=0; i< splittedQueryParams.length; i++) {
//        var equalIndex = splittedQueryParams[i].indexOf('=');
//
//        if (equalIndex != -1) {
//            var key = splittedQueryParams[i].substr(0, equalIndex);
//            var val = splittedQueryParams[i].substr(equalIndex + 1);
//            addToQuery(key, val, query);
//            //query[key] = val;
//        }
//    }
//
//    return query;
//}
//
//function addToQuery(key, val, query) {
//    var leftBracketIndex = key.indexOf('[');
//
//    if (leftBracketIndex !== -1) {
//        var rightBracketIndex = key.lastIndexOf(']');
//        var newKey = key.substr(0, leftBracketIndex);
//        var leftStr = key.substr(leftBracketIndex+1, (rightBracketIndex - leftBracketIndex - 1));
//
//        query[newKey] = addToQuery(leftStr, val, query);
//
//        return query;
//    }
//
//    query[key] = val;
//
//    return query;
//}

//var t = "shoe=big";
//var res = fillQueryParams(t);
//console.log(res.shoe);

//console.log("start for");
//for (var v in res.color) {
//    console.log(res.color[v]);
//}


var msg = "GET http://www.example.com/www/index.html?name=tobi HTTP/1.1\n" +
    "Content-Type: text/xml\n" +
    "Host: http://www.example.com:3000\n" +
    "Content-Length: 10\n\n" +
    "This is the body!!!";

var request = parser.parse(msg);

console.log("method: " + request.method + ", version: " + request.version + ", path: " + request.path + ", hostname: " + request.host + ", protocol: " + request.protocol);

var queries = "";
for (var val in request.query)
    queries += val + ": " + request.query[val] + "; ";

console.log("query: " + queries);

var prms = "";
for (var val in request.params)
    prms += val + ": " + request.params[val] + "; ";

console.log("params: " + prms);

var header = "";
for (var val in request.header)
    header += val + ": " + request.header[val] + "; ";

console.log("header: " + header);
console.log("-----------------------");

//webServer.start(8888, function() {
//    console.log("hi");
//    //webServer.static("c:/users/:name/tal");
//});

/*
function prepareResource(resource) {
    if (resource === undefined || resource === null) {
        return "/";
    }
    if (resource.indexOf('/') !== 0) {
        resource = "/" + resource;
    }

    if (resource.lastIndexOf('/') === resource.length-1) {
        resource = resource.substr(0, resource.length-1);
    }

    resource = pathModule.normalize(resource);

    return resource;
}

function extractParamsName(resource, params) {
    console.log("received resource: " + resource)
    resource = prepareResource(resource);
    console.log("after preparation, resource is: " + resource);
    var splitted = resource.split('/');
    var paramNum = 1;

    for (var i=0; i<splitted.length; i++) {
        if (splitted[i] !== undefined && splitted[i] !== null && splitted[i].indexOf(':') === 0) {
            var param = splitted[i].substr(1);
            params[param] = paramNum++;

            splitted[i] = "([^\/]*)"
        }
    }

    resource = '^' + splitted.join('\\');
    return resource;
}


var res = new responseModule(null).status(500).set('content-type', 'txt/html').set('content-length', 16);
res.body = "this is the body";

var resAsStr = parser.stringify(res);

console.log("resAsStr:\n" + resAsStr);
console.log("-----------------------");
var resource = '/a(bc)?d';
var matches = "/sd/ad/es".match(resource);

console.log(matches);

console.log("-----------------------");
var res1 = "x/:name/:last/z/:city";
var path = "/x/tal/orenstein/z/rehovot/";

var params = {};
var newResorece = extractParamsName(res1, params);

console.log("new resource is: " + newResorece);

matches = path.match(newResorece);
var correctParams = {};
for (var name in params) {
    var i = params[name];
    correctParams[name] = matches[i];
}

for (var name in correctParams) {
    console.log("param: " + name + ", value: " + correctParams[name]);
}

console.log("-----------------------");
var str2 = "http://///www.example.com/articles/index.html?name=tal&a[b[c]]=d  ";
str2 = pathModule.normalize(str2);
console.log(str2);
var uriRegex = '^[^\\\\\\.]*[\\\\]?[^\\\\]*([\\\\][^\\?#]*)(\\?|#)?(.*)';
var matches2 = str2.toLowerCase().trim().match(uriRegex);

if (matches2 !== null)
    console.log("path: " + matches2[1] + ", sign: " + matches2[2] + ", query: " + matches2[3]);
else
    console.log("null");
*/

//console.log("order=" + request.query.order + "; shoe[color]=" + request.query.shoe.color + "; shoe[type]=" + request.query.shoe.type);

console.log("done");

//var x = {"name" : "tal"};
//console.log(x.sd);