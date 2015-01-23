/**
 * Created by Alon and Tal on 06/01/2015.
 */

var hujiNet = require('./hujinet.js');
var parser = require('./hujiparser.js');
var httpResponseModule = require('./HttpResponse');
var pathModule = require('path');

var resourceHandlers = []; // [resource, handler, type, params]

var handlerIndex = -1;
var currHttpRequest;
var currHttpResponse;


function DynamicServer(port) {

    this.listener = hujiNet.createServer(port, onRequestArrival, function(err){
        if (err) {
            console.log(err);
            return new Error(err); // throw err;
        }
    });
};


DynamicServer.prototype.stop = function() {
    var listener = this.listener;

    setTimeout(function() {
        listener.close();
    }, 10000);
};



function setUpResourceAndHandler() {

    var retVal = [];
    var resource, requestHandler;
    if (arguments[1] === undefined) {

        resource = '/';
        requestHandler = arguments[0]
    }
    else {

        resource = arguments[0];
        requestHandler = arguments[1]
    }

    var params = {};
    resource = resource.toLowerCase();
    resource = extractParamsName(resource, params);

    retVal[0] = resource;
    retVal[1] = requestHandler;
    retVal[2] = arguments[2];
    retVal[3] = params;

    return retVal;
}

// verify that the resource starts with '/' and ends without '/'
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
    resource = prepareResource(resource);

    if (resource === ".") {
        return "^.+";
    }

    var splitted = resource.split('\\');
    var paramNum = 1;

    for (var i=0; i<splitted.length; i++) {
        if (splitted[i] !== undefined && splitted[i] !== null && splitted[i].indexOf(':') === 0) {
            var param = splitted[i].substr(1);
            params[param] = paramNum++;

            splitted[i] = "([^\\]*)"
        }
    }

    resource = '^' + splitted.join('\\');
    resource = resource.replace(/\\/g, '\\\\');

    return resource;
}

DynamicServer.prototype.use = function () {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1], "any");
    resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.get = function () {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"get");
    resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.post = function (resource , requestHandler) {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"post");
    resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.delete = function (resource , requestHandler) {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"delete");
    resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.put = function (resource , requestHandler) {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"put");
    resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


var identifyType = function (uri) {
    var  fileType = uri.substring(uri.lastIndexOf('.') + 1).toLowerCase();

    switch (fileType){

        case "js":
            return "application/javascript";

        case "txt":
            return "text/plain";

        case "html":
            return "text/html";

        case "css":
            return "text/css";

        case "jpeg":
        case "jpg":
            return "image/jpeg";

        case "gif":
            return "image/gif";

        default:
            return "text/plain";
    }
};

DynamicServer.prototype.identifyType = identifyType;

var next = function() {

    var isFoundHandler = false;

    // if handler index > -1, it means that 'next' function is invoked again.
    if (handlerIndex > -1) {
        isFoundHandler = true;
    }

    for (var i = handlerIndex + 1; i < resourceHandlers.length; i++) {
        handlerIndex = i;

        var r = resourceHandlers[i];
        var matches = currHttpRequest.path.match(r[0] + "($|\\\\)");
        //var matches = currHttpRequest.path.match(r[0]);

        if (matches !== null && (currHttpRequest.method === r[2] || r[2] === 'any' ) ) {

            isFoundHandler = true;
            currHttpRequest.updateParams(matches, r[3]);

            var handler = r[1];

            handler(currHttpRequest, currHttpResponse, next);

            break;
        }
    }

    if (!isFoundHandler) {
        currHttpResponse.status(404).send();
    }
};

function onRequestArrival(request, clientSocket) {

    try {

        analyzeRequest(request, clientSocket)

    }
    catch (e) { // in case some error happens, we return '500'

        new httpResponseModule(clientSocket)
            .status(500)
            .closeConnection(true)
            .send();
    }

}


function createErrorResponse(clientSocket, code) {

    new httpResponseModule(clientSocket)
        .status(code)
        .closeConnection(true)
        .send();
}


function analyzeRequest(request, clientSocket) {

    currHttpRequest = parser.parse(request);

    // since the request isn't missing, update socket.buffer to holds the data received after reading the received data
    clientSocket.buffer = currHttpRequest.leftData;

    //if the request is missing or in bad format, return (the error response was already sent)
    if (currHttpRequest === null || currHttpRequest === undefined) {
        return createErrorResponse(clientSocket, 400);
    }

    if (currHttpRequest.path === undefined) {
        return createErrorResponse(clientSocket, 400);
    }

    var closeConnection = shouldCloseConnection(currHttpRequest);
    if (!isValidRequest(currHttpRequest)) {
        return createErrorResponse(clientSocket, 400);
    }

    currHttpResponse = createResponse(currHttpRequest, clientSocket, closeConnection);

    next();

    // set to default value for next time
    handlerIndex = -1;
}



function isValidRequest(httpRequest) {

    if (!httpRequest.version || httpRequest.version === "" || httpRequest.version.indexOf("HTTP/1.") !== 0) {
        writeLog("hujidynamicserver", "isValidRequest", "wrong http version", true);
        return false;
    }

    // checks if httpRequest.method is valid (i.e, it exists in methodOptions map)
    var methodOptions = ["options", "get", "head", "post", "put", "delete", "trace", "connect"];
    return methodOptions.indexOf(httpRequest.method) !== -1;
}


function shouldCloseConnection(httpRequest) {

    if (httpRequest.version === "http/1.0" && httpRequest.header["connection"] !== "keep-alive") {
        return true;
    }
    if (httpRequest.header["connection"] === "close") {
        return true;
    }

    return false;
}




function createResponse(httpRequest, clientSocket, closeConnection) {

    var response = new httpResponseModule(clientSocket);
    response.closeConnection(closeConnection);

    var type = identifyType(httpRequest.path);

    // send header part
    response.set("content-type", type);

    return response;
}


module.exports = DynamicServer;
