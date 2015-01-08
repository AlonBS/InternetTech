/**
 * Created by Alon and Tal on 06/01/2015.
 */

var hujiNet = require('./hujinet.js');
var parser = require('./hujiparse.js');
var httpResponseModule = require('./HttpResponse');


function temp1(req) {

    var requestLine = req.substring(0, req.regexIndexOf(/[\r\n]/));
    console.log(requestLine);

    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
    var requestLineMatch = requestLineRegex.exec(requestLine);

    console.log(requestLineMatch[0]);
    console.log(requestLineMatch[1]);
    console.log(requestLineMatch[2]);
    console.log(requestLineMatch[3]);
    console.log(requestLineMatch[4]);
    console.log(requestLineMatch[5]);
}








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


function onRequestArrival(request, clientSocket) {

    try {

        analyzeRequest(request, clientSocket)

    }
    catch (e) { // in case some error happens, we return '500'

        new httpResponseModule(clientSocket)
            .status(500)
            .closeConnection(false) // TODO - should we close connection in this case or not ?
            .send("Error 500: Undefined Error"); // Again - we should take the map from hujiwebServer

    }

}


function analyzeRequest(request, clientSocket) {

    var httpRequest = parser.parse(request);

    //if the request is missing or in bad format, return (the error response was already sent)
    if (httpRequest === null || httpRequest === undefined) {
        return; // TODO - when was the message sent?
    }

    if (httpRequest.path === undefined) {
        //TODO - no path was given in the request. what should we do?
        // maybe send error message?
    }

    var closeConnection = shouldCloseConnection(httpRequest);
    if (!isValidRequest(httpRequest)) {

        new httpResponseModule(clientSocket)
            .status(404)
            .closeConnection(closeConnection)
            .send("Error 400: Bad Request"); //TODO move
        return;
    }

    var foundMatch = false;
    for (r in this.resourceHandlers) {  // dynamically search for  handlers

        if (r[3].test(httpRequest.path)) {

            foundMatch = true;

            // This must be in here, since only here we know the matching resource
            httpRequest.updateParams(r[0]); // TODO - need to implement this method

            var httpResponse = createResponse(httpRequest, clientSocket, closeConnection);
            var handler = r[1];
            handler(httpRequest, httpResponse, function() {

                //TODO - how do you suggest we implement next() ?
                // My idea is as following: this function could set a variable called 'doNext'
                // to true. after this line, we check if (!doNext) then return, else, we automatically
                // continue the for loop which started this call. (Everything stack-wise is ok I think).
                // let me know what you think.

            });

            //TODO as part of implementation
            //if (!doNext) return;
        }
    }


    if (!foundMatch) { // no resource match the given request

        new httpResponseModule(clientSocket)
            .status(404)
            .closeConnection(closeConnection)
            .send("Error 404: Not Found");
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
    response.set("content-type", identifyType(request.path)); //TODO - move identifyType
    response.set("content-length", stats.size); // TODO - what should we do we stat?

    //TODO what other fields in the response should we set?

    return response;
}








module.exports = DynamicServer;


/**
 OLD VERSION OF IS VALID REQUEST


 function isValidRequest(httpRequest, socket, closeConnection) {

    if (!httpRequest.version || httpRequest.version === "" || httpRequest.version.indexOf("HTTP/1.") !== 0) {
        writeLog("hujiwebserver", "isValidRequest", "wrong http version", true);
        return false;
    }


    var methodOptions = ["options", "get", "head", "post", "put", "delete", "trace", "connect"];

    // checks if httpRequest.method is valid (i.e, it exists in methodOptions map)
    var isContained = false;
    for (var i in methodOptions) {
        if (methodOptions[i] === httpRequest.method) {
            isContained = true;
            break;
        }
    }

    if (!isContained) {
        writeLog("hujiwebserver", "isValidRequest", "wrong method request", true);
        return false;
    }

    return true;
}
 */