/**
 * Created by Alon and Tal on 06/01/2015.
 */

var hujiNet = require('./hujinet.js');
var parser = require('./hujiparser.js');
var httpResponseModule = require('./HttpResponse');




// square.js
function DynamicServer(port) {

    this.listener = hujiNet.createServer(port, onRequestArrival, function(err){
        // TODO - implement
    });

    this.resourceHandlers = []
};


DynamicServer.prototype.stop = function() {

    setTimeout(function() {
        this.listener.end();
    }, 2000);
};


function transformToRegex(r) {

    var endsWithSlash = r.indexOf('/', r.length - 1) !== -1;
    var suffix = endsWithSlash ? '?.*$' : '/?.*$';
    return new RegExp( '^' + r.replace(/(:[a-zA-Z0-9]+|\*)/g, ".*") + suffix, "g");
}




function setUpResourceAndHandler() {

    var retVal = []
    var resource, requestHandler;
    if (arguments[1] === undefined) {

        resource = '/';
        requestHandler = arguments[0]
    }
    else {

        resource = arguments[0];
        requestHandler = arguments[1]
    }

    retVal[0] = resource;
    retVal[1] = requestHandler;
    retVal[2] = arguments[2];
    retVal[3] = transformToRegex(resource);

    return retVal;
}


DynamicServer.prototype.use = function () {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1], "any");
    this.resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.get = function () {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"get");
    this.resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.post = function (resource , requestHandler) {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"post");
    this.resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.delete = function (resource , requestHandler) {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"delete");
    this.resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};


DynamicServer.prototype.put = function (resource , requestHandler) {

    var rh = setUpResourceAndHandler(arguments[0], arguments[1],"put");
    this.resourceHandlers.push([rh[0], rh[1], rh[2], rh[3]]);
};




DynamicServer.prototype.identifyType = function identifyType(uri) {

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
}


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

    var httpRequest = parser.parse(request);

    //if the request is missing or in bad format, return (the error response was already sent)
    if (httpRequest === null || httpRequest === undefined) {
        return createErrorResponse(clientSocket, 400);
    }

    if (httpRequest.path === undefined) {
        return createErrorResponse(clientSocket, 400);
    }

    var closeConnection = shouldCloseConnection(httpRequest);
    if (!isValidRequest(httpRequest)) {
        return createErrorResponse(clientSocket, 400);
    }

    var foundMatch = false;
    var doNext = false;
    for (r in this.resourceHandlers) {  // dynamically search for  handlers

        if (r[3].test(httpRequest.path)) {

            foundMatch = true;
            // This must be in here, since only here we know the matching resource
            httpRequest.updateParams(r[0]); // TODO - need to implement this method

            var httpResponse = createResponse(httpRequest, clientSocket, closeConnection);
            var handler = r[1];
            handler(httpRequest, httpResponse, function() {
                // important for this variable to remain in this function stack
                // to support multi-threading calls of this function
                doNext = true;
            });

            if (!doNext) return;
            doNext = false;
        }
    }

    if (!foundMatch) { // no resource match the given request
        createErrorResponse(clientSocket, 404);
    }
}



function isValidRequest(httpRequest) {

    if (!httpRequest.version || httpRequest.version === "" || httpRequest.version.indexOf("HTTP/1.") !== 0) {
        writeLog("hujiwebserver", "isValidRequest", "wrong http version", true);
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

    // send header part
    response.set("content-type", identifyType(httpRequest.path));

    //TODO what other fields in the response should we set?
    return response;
}



module.exports = DynamicServer;

