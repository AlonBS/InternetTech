/**
 * Created by Alon and Tal on 06/01/2015.
 */

var hujiNet = require('./hujinet.js');


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

    var requestLine = request.substring(0, request.regexIndexOf(/[\r\n]/));
    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
    var path = requestLineRegex.exec(requestLine)[2];

    if (path === undefined) {

        //TODO - no path was given in the request. what should we do?
        // maybe send error message?
    }


    for (r in this.resourceHandlers) {
        if (r[3].test(path)) {

            var httpRequest = parser.parse(request);//

            //if the request is missing or in bad format, return (the error response was already sent)
            if (httpRequest === null || httpRequest === undefined) {
                return; // TODO - when was the message sent?
            }

            httpRequest.updateParams(r[0]); // TODO - need to implement this method

            var handler = r[1];
            handler(httpRequest, httpResponse, function() {

            });



            // do as hujiwebserver onRequest arrival

            // first : if we got here - than the request matches the specific
            // resource - so we need to build the request (using the parser)
            // next: call a function (yet to be built) updateParams
            // which loads the params according to the resource

            // finally - call the handler with the request (and response?),
            // and create the next function as needed.

            // Note: requestHandler is now in the for of:
            // [ [resource, handler, "any", resourceAsRegex - call me about ths ]...[ ... ]]
        }
    }
}



function isValidRequest(httpRequest, socket, closeConnection) {

    if (!httpRequest.version || httpRequest.version === "" || httpRequest.version.indexOf("HTTP/1.") !== 0) {
        writeLog("hujiwebserver", "isValidRequest", "wrong http version", true);
        sendErrorResponse(400, socket, closeConnection);
        return false;
    }

    // checks if httpRequest.method is valid (i.e, it exists in methodOptions map)
    var isContained = false;

    for (var i=0; i < methodOptions.length; i++) {
        if (methodOptions[i] === httpRequest.method) {
            isContained = true;
            break;
        }
    }

    if (!isContained) {
        writeLog("hujiwebserver", "isValidRequest", "wrong method request", true);
        sendErrorResponse(400, socket, closeConnection);
        return false;
    }

    return true;
}








module.exports = DynamicServer;