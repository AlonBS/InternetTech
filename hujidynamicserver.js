/**
 * Created by Alon and Tal on 06/01/2015.
 */

var hujiNet = require('./hujinet.js');


function onRequestArrival(request, clientSocket) {

    for (r in this.resourceHandlers) {

        if (r[3].test(request)) {

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


module.exports = DynamicServer;