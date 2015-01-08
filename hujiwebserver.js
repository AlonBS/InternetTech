/**
 * Created by Alon & Tal on 21/12/2014.
 */

var hujiDynamicServer = require('./hujidynamicserver.js');

var fs = require('fs');
var path = require ('path');

var serverStaticRootFolder = "";
var server;   // TODO - currently - only one server is supported. (this will be enclosed as a private member of hujiwebServer)
var serversNextId = 0; //TODO - needed
var servers = {};   // TODO - needed?



// TODO - where should we put this method
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}



//


function writeLog(moduleName, funcName, content, isErr) {
    var message = "at " + moduleName + "." + funcName + ": " + content;
    if (isErr) {
        message = "ERROR: " + message;
    }

    console.log(message);
}


exports.static = function (rootFolder) {
    try {
        serverStaticRootFolder = path.resolve(rootFolder);

        // verify that the received root folder  exists
        if (!fs.existsSync(serverStaticRootFolder)) {
            writeLog("hujiwebserver", "static", "invalid root folder", true);

            // TODO: which error we need to send to user?
            //callBack("invalid server root folder");
        }
    } catch (e) {
        //callBack("invalid server root folder");
    }


    server.use(serverStaticRootFolder, staticResourceHandler);
};

var staticResourceHandler = function (request, response, next) {

    // checks for unauthorized access: if the file path starts with the given server root folder.
    if (request.path.indexOf(serverStaticRootFolder) != 0) {
        response.status(401).send(errBody[401]);

        //sendErrorResponse(401, socket, closeConnection);
        writeLog("hujiwebserver", "staticResourceHandler", "unauthorized access to: " + request.path, true);
        return;
    }

    fs.stat(request.path, function (err, stats) {
        if (err || !stats.isFile()) {
            response.status(404).send(errBody[404]);
            writeLog("hujiwebserver", "staticResourceHandler", request.path + " is not a file or doesn't exist", true);

            //sendErrorResponse(404, socket, closeConnection);
            return;
        }

        // opens the file as a readable stream
        var fileAsAStream = fs.createReadStream(request.path);

        // waits until we know the readable stream is actually valid before piping
        fileAsAStream.on("open", function() {


            // TODO - to tal: I think you have a mistake here. shouldn't it be:
            // TODO - why do you set response.closeConnection to false?
            var closeConnection = response.shouldCloseConnection;
            response.closeConnection(false);

            // send header part
            // TODO - lower case perhaps?
            response.set("Content-Type", server.identifyType(request.path));
            response.set("Content-Length", stats.size);
            response.send();

            //var response = httpObjects.createHttpResponse(version, "200", reasonPharseContent[200],
            //    {"Content-Type" : identifyType(request.path), "Content-Length" : stats.size},"");
            //
            //socket.write(parser.stringify(response));

            // send 'body' content
            fileAsAStream.pipe(request.clientSocket, {end: false});

            if (closeConnection)
                request.clientSocket.end();
        });

        // catches any errors that happen while creating the readable stream (usually invalid names)
        fileAsAStream.on("error", function(err) {
            response.status(404).send(errBody[404]);
            writeLog("hujiwebserver", "staticResourceHandler", "An error had occurred: " + err, true);

            //sendErrorResponse(404, socket, closeConnection);
        })
    })
};


exports.start = function (port, callBack) {

    if (port < 1 || port > 65535) {

        callBack("Invalid port number given");
    }

    server = new hujiDynamicServer(port);

    callBack("", server)

};


