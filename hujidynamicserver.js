/**
 * Created by Alon and Tal on 06/01/2015.
 */

var hujiNet = require('./hujinet.js');



function onRequestArrival(request, clientSocket) {




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


DynamicServer.prototype.use = function (resource , requestHandler) {

    this.resourceHandlers.push([resource, "any", requestHandler]);
};


DynamicServer.prototype.get = function (resource , requestHandler) {

    this.resourceHandlers.push([resource, "get", requestHandler]);
};


DynamicServer.prototype.post = function (resource , requestHandler) {

    this.resourceHandlers.push([resource, "post", requestHandler]);
};


DynamicServer.prototype.delete = function (resource , requestHandler) {

    this.resourceHandlers.push([resource, "delete", requestHandler]);
};

DynamicServer.prototype.put = function (resource , requestHandler) {

    this.resourceHandlers.push([resource, "put", requestHandler]);
};


module.exports = DynamicServer;