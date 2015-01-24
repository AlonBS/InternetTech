var http = require('http');
var path = require('path');
var hujiwebserver = require('./hujiwebserver');


var indexSize = '209';
var cssSize = '1377';
var jsSize = '14968'

/* ========================================================================== */

// Ports used in the tester
var portsArr = [1234, 1235, 1236, 1237, 1238, 1239, 1240, 1241,
                1242, 1243, 1244, 1245, 1246, 1247, 1248, 1249,
                1250, 1251, 1252, 1253, 1254];

// Container for the tests and their results
var testsObj = {};

// Num of Ms for the server to be opened
var numMsToClose = 3000;

var multiServersResultsArray = [];
/* ========================================================================== */

function setServer(port, defineSpecificProperties) {
    hujiwebserver.start(port, function(e, dynamicServer) {
        if (e) {
            console.log(e.message);
        } else {
            console.log('Server is up. Listening to port ' + port);
            console.log('Server will be closed automatically after ' + numMsToClose + ' ms.');
        }

        defineSpecificProperties(dynamicServer);

        setTimeout(dynamicServer.stop, numMsToClose);
    });
}

/* ========================================================================== */

/*
 Creates a request by utilizing the HTTP module (the request is based on the
 values in the "options" object), compares the response to the expected
 one and updates "testsObj" accordingly.
 */
function createReqStatic(testID, options, expectedRes) {
    var req = http.request(options, function(res) {
        console.log(res.headers['content-length']);;

        res.setEncoding = 'utf8';
        testsObj[testID] =
            ((res.statusCode === expectedRes.statusCode) &&
            (res.headers['content-type'] === expectedRes.headers['content-type']) &&
            (res.headers['content-length'] === expectedRes.headers['content-length']));
    });

    req.on('error', function(e) {
        console.log('There was an error with test ' + testID + ': ' + e.code + ", " + e.message);
        testsObj[testID] = false;
    });

    req.end();
}

/* ========================================================================== */

/*
 Creates a request by utilizing the HTTP module (the request is based on the
 values in the "options" object), compares the response to the expected
 one and updates "testsObj" accordingly.
 */
function createReq(testID, options, expectedRes) {
    var req = http.request(options, function(res) {
        res.setEncoding = 'utf8';

        res.on("data", function(chunk) {

            console.log("CHUNK: " + chunk.toString())
            console.log("EXPECTED: " + expectedRes.body)
            // Update testObj for the specific test according to the result of the comparison
            testsObj[testID] =
                ((res.statusCode === expectedRes.statusCode) &&
                (res.headers['content-type'] === expectedRes.headers['content-type']) &&
                (res.headers['content-length'] === expectedRes.headers['content-length']) &&
                (chunk.toString() === expectedRes.body));
        });
    });

    req.on('error', function(e) {
        console.log('There was an error with test ' + testID + ': ' + e.code + ", " + e.message);
        testsObj[testID] = false;
    });

    req.end();
}

/* ========================================================================== */

/*
 Creates a request by utilizing the HTTP module (the request is based on the
 values in the "options" object), compares the response to the expected
 one and updates "testsObj" accordingly.
 */
function createReqStringify(testID, options, expectedRes) {
    var req = http.request(options, function(res) {
        res.setEncoding = 'utf8';

        res.on("data", function(chunk) {
            // Update testObj for the specific test according to the result of the comparison
            testsObj[testID] = (JSON.stringify(res.headers) === expectedRes);
        });
    });

    req.on('error', function(e) {
        console.log('There was an error with test ' + testID + ': ' + e.code + ", " + e.message);
        testsObj[testID] = false;
    });

    req.end();
}

/* ========================================================================== */

/*
 Creates a request by utilizing the HTTP module (the request is based on the
 values in the "options" object), compares the response to the expected
 one and updates "testsObj" accordingly.
 */
function createReqMultiServers(testId, options, expectedRes, multiServersResultsArray) {
    var req = http.request(options, function(res) {
        res.setEncoding = 'utf8';

        res.on("data", function(chunk) {
            // Update testObj for the specific test according to the result of the comparison
            resValue =
                ((res.statusCode === expectedRes.statusCode) &&
                (res.headers['content-type'] === expectedRes.headers['content-type']) &&
                (res.headers['content-length'] === expectedRes.headers['content-length']) &&
                (chunk.toString() === expectedRes.body));
            multiServersResultsArray.push(resValue);
        });
    });

    req.on('error', function(e) {
        console.log('There was an error with multi-servers test: ' + e.code + ", " + e.message);
        multiServersResultsArray.push(false);
    });
    req.end();
}

/* ========================================================================== */

/*
 Prints the results of all of the tests
 */
function printTestsResults() {
    console.log("\n\n\n\n");
    console.log("==============");
    console.log("Tests results:");
    console.log("==============");

    var testArr = Object.keys(testsObj).sort();

    for (testIndex in testArr) {
        testID = testArr[testIndex];
        console.log('- Test ' + testID + ' ' + (testsObj[testID] ? 'passed!' : 'failed!'));
    }
}

/* ========================================================================== */

function test0(testId) {
    setServer(portsArr[testId], function (dynamicServer) {
        var rootFolder = path.normalize("./");
        console.log("root folder: " + rootFolder);
        dynamicServer.use("/", hujiwebserver.static(rootFolder));
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//style.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {
            'content-length': cssSize,     // TODO - Shachar should change the length
            'content-type': 'text/css'}};

    createReqStatic('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test1(testId) {
    setServer(portsArr[testId], function (dynamicServer) {
        var rootFolder = path.normalize("./");
        dynamicServer.use("/", hujiwebserver.static(rootFolder));
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//notExist.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  404,
        headers: {
            'content-length': '57',
            'content-type': 'text/html'}};

    createReqStatic('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test2(testId) {
    var msg = "Sent successfully!";

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.get("/", function (req, res, next){
            res.send(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//style.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '18', 'content-type': 'text/html'},
        body: msg};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test3(testId) {
    var msg = {'msg': 'Sent successfully!'};

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.put("/", function (req, res, next){
            res.send(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'PUT',
        path: '//www//style.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '28', 'content-type': 'application/json'},
        body: '{"msg":"Sent successfully!"}'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test4(testId) {
    var msg = new Buffer('Sent successfully!');

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.post("/", function (req, res, next){
            res.send(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'POST',
        path: '//www//style.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '18', 'content-type': 'application/octet-stream'},
        body: 'Sent successfully!'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test5(testId) {
    var msg = 'Sent successfully!';
    var a;
    var b;
    var c;

    setServer(portsArr[testId], function (dynamicServer) {

        dynamicServer.post("/:field1/:field2/x/:field3/", function (req, res, next){
            a = req.params.field1;
            b = req.params.field2;
            c = req.params.field3;
            res.send(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'POST',
        path: '/test51/test52/x/test53/'
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '18', 'content-type': 'text/html'},
        body: 'Sent successfully!'
        };

    createReq('test' + testId, options, expectedRes);

    setTimeout(function() {
        var paramsMatch = ((a === 'test51') && (b === 'test52') && (c === 'test53'));
        testsObj['test' + testId] = testsObj['test' + testId] && paramsMatch;
    }, numMsToClose);
}

/* ========================================================================== */

function test6(testId) {
    var msg = 'Sent successfully!';

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            next();
        });

        dynamicServer.get("/", function (req, res, next){
            res.send(msg);
            next();
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//style.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '18', 'content-type': 'text/html'},
        body: 'Sent successfully!'};

    createReq('test' + testId, options, expectedRes);
}
/* ========================================================================== */

function test7(testId) {
    var msg = 'Sent successfully!';

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.get("/", function (req, res, next){
            next();
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'POST',
        path: '//www//style.css' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  404,
        headers: {'content-length': '57', 'content-type': 'text/html'},
        body: '<html><body><h1>Error: 404 - Not Found</h1></body></html>'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test8(testId) {
    setServer(portsArr[testId], function (dynamicServer) {

        dynamicServer.post("/:field1/:field2/x/:field3/", function (req, res, next){
            next();
        });

        dynamicServer.post("/", function (req, res, next){
            res.send(req.params.field1);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'POST',
        path: '/test81/test82/x/test83/'
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '6', 'content-type': 'text/html'},
        body: 'test81'
    };

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test9(testId) {
    setServer(portsArr[testId], function (dynamicServer) {
        var rootFolder = path.normalize("./www");
        dynamicServer.use("/", hujiwebserver.static(rootFolder));
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//..//tester.js'
    };

    var expectedRes = {
        statusCode:  403,
        headers: {
            'content-length': '57',
            'content-type': 'text/html'}};

    createReqStatic('test' + testId, options, expectedRes);

}
/* ========================================================================== */

function test10(testId) {
    var msg = 'Sent successfully!';
    var query;
    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.delete("/", function (req, res, next){
            query = req.query;
            res.send(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'DELETE',
        path: 'folder//?field1=shachar&field2=langer&array1[age]=26&array1[gender]=m&array2[hello]=world&can[we[use[url]]]=yes'
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '18', 'content-type': 'text/html'},
        body: 'Sent successfully!'
    };

    createReq('test' + testId, options, expectedRes);

    setTimeout(function() {
        var expectedQueryObject = '{"field1":"shachar","field2":"langer","array1":{"age":"26","gender":"m"},'+
                                '"array2":{"hello":"world"},"can":{"we":{"use":{"url":"yes"}}}}';
        var queryMatch = (expectedQueryObject === JSON.stringify(query));
        testsObj['test' + testId] = testsObj['test' + testId] && queryMatch;
    }, numMsToClose);
}

/* ========================================================================== */

function test11(testId) {

    var msg = {'msg1': 'Sent successfully!', 'msg2': null};

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            res.json(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '41', 'content-type': 'application/json'},
        body: '{"msg1":"Sent successfully!","msg2":null}'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test12(testId) {

    var msg = null;

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            res.json(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '4', 'content-type': 'application/json'},
        body: 'null'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test13(testId) {

    var msg = undefined;

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            res.json(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '9', 'content-type': 'application/json'},
        body: 'undefined'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test14(testId) {

    var msg = 'Sent successfully!';

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            res.send(req.cookies.lior + ", " + req.cookies.shachar);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//', // Slashes are correct for Windows 7 and 8
        headers: {'cookie' : 'lior=resisi; shachar=langer'}
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': '14', 'content-type': 'text/html'},
        body: 'resisi, langer'};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test15(testId) {

    var msg = 'Sent successfully!';

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            res.cookie("patch","1234", {httpOnly: true , domain: '.example.com', path: '/admin', secure: true });
            res.cookie("knap","sack",  {httpOnly: false, domain: '.example.com', path: '/user',  secure: true });
            res.send(msg);
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = '{"set-cookie":["patch=1234; httpOnly; domain=.example.com; path=/admin; secure","knap=sack; httpOnly;'+
                        ' domain=.example.com; path=/user; secure"],"content-type":"text/html","content-length":"18"}';

    createReqStringify('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test16(testId) {

    var numOfServers = 10;
    var test16Ports = [];
    var expectedResArray = [];
    var optionsArray = [];

    for (var i = 0; i < numOfServers; i++) {
        test16Ports.push(1300 + i);
    }

    for (var i = 0; i < numOfServers; i++) {
        setServer(test16Ports[i], function (dynamicServer) {
            dynamicServer.use("/", function (req, res, next){
                var msg = "Server - Sent successfully!";
                res.send(msg);
            });
        });
    }

    for (var i = 0; i < numOfServers; i++) {
        optionsArray.push({
            port: test16Ports[i],
            method: 'GET',
            path: '//www//' // Slashes are correct for Windows 7 and 8
        });

        expectedResArray.push({
            statusCode:  200,
            headers: {'content-length': '27', 'content-type': 'text/html'},
            body: "Server - Sent successfully!"
        });
    }

    for (var i = 0; i < numOfServers; i++) {
        createReqMultiServers(i, optionsArray[i], expectedResArray[i], multiServersResultsArray);
    }

    function multiServersTestResult() {
        for (var i = 0; i < numOfServers; i++) {
            if (!multiServersResultsArray[i]) {
                testsObj['test'+testId] = false;
                return;
            }
        }

        testsObj['test'+testId] = true;
    }

    setTimeout(multiServersTestResult, numMsToClose + 100);
}

/* ========================================================================== */

function test17(testId) {

    var msg = 'Sent successfully!';

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            setTimeout(function() {
                console.log("--------------------------------------------------------- in first handler after wait"); // TODO - remove
                res.status('501').send(msg);
            }, 1000);
            next();
        });

        dynamicServer.use("/", function (req, res, next){
            console.log("--------------------------------------------------------- in second handler"); // TODO - remove
            res.status('200');
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'GET',
        path: '//www//' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  501,
        headers: {'content-length': '18', 'content-type': 'text/html'},
        body: msg};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function test18(testId) {

    var expectedMsg = '{"1":{"value":"firstTask","status":0}}\n' +
        'This function registers handlers for get, post, delete and put requests whose resource\n' +
        'begins with "/item", and it enables getting, adding, deleting and updating items (respectively)\n' +
        'in a predefined data structure that is saved on the server and managed per user.\n' +
        'As many servers might need to save some data locally, this function is indeed needed.\n' +
        'For example, it might be used in order to achieve some of Ex5 requirements.\n' +
        'The function expects to receive an instance of hujidynamicserver as an argument.';

    setServer(portsArr[testId], function (dynamicServer) {
        dynamicServer.use("/", function (req, res, next){
            dynamicServer.use("/", hujiwebserver.myUse(dynamicServer));
            dynamicServer.getData().createNewUser(0, 'user', 'useruser', 'password');
            dynamicServer.getData().put(0, 1, 'firstTask', 0);
            res.send(JSON.stringify(dynamicServer.getData().get('0')) + "\n" +
                hujiwebserver.myUse(dynamicServer).toString());
        });
    });

    var options = {
        port: portsArr[testId],
        method: 'PUT',
        path: '//item//' // Slashes are correct for Windows 7 and 8
    };

    var expectedRes = {
        statusCode:  200,
        headers: {'content-length': expectedMsg.length.toString(), 'content-type': 'text/html'},
        body: expectedMsg};

    createReq('test' + testId, options, expectedRes);
}

/* ========================================================================== */

function runTests() {
    test0(0);
    //test1(1);
    //test2(2);
    //test3(3);
    //test4(4);
    //test5(5);
    //test6(6);
    //test7(7);
    //test8(8);
    //test9(9);
    //test10(10);
    //test11(11);
    //test12(12);
    //test13(13);
    //test14(14);
    //test15(15);
    //test16(16);
    //test17(17);
    //test18(18);
    //test19(19);
    //test20(20);

    setTimeout(printTestsResults, numMsToClose + 1000);
}

/* ========================================================================== */

runTests();
