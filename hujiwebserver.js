/**
 * Created by Alon & Tal on 21/12/2014.
 */

var hujiDynamicServer = require('./hujidynamicserver.js');

var fs = require('fs');
var path = require ('path');

var serverStaticRootFolder = "";
   // TODO - currently - only one server is supported. (this will be enclosed as a private member of hujiwebServer)
var serversNextId = 0; //TODO - needed
var servers = {};   // TODO - needed?



// TODO - where should we put this method
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};



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

            return;

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



exports.myUse = function () {

    this.toString = function() {
        return "EX"; // TODO THIS IS NOT GOOD
    };

    server.post('/uploads/secured', myUseResourceHandler);
};


var myUseResourceHandler = function (request, response) {

    // opens the file as a writable stream
    var writeToFile = fs.createWriteStream(request.path); //TODO we jave a problem since we don't no the 'path'

    // waits until we know the writable stream is actually valid before piping
    writeToFile.on("open", function() {

        writeToFile.write(request.body, function () {

            writeToFile.end();

            // we always close connection once a file has being uploaded
            response.closeConnection(true);
            response.status(200).send("File uploaded successfully.");

        });
    });


    // catches any errors that happen while creating the readable stream (usually invalid names)
    writeToFile.on("error", function(err) {
        response.status(500).send("Unable to upload the file.");
        writeLog("hujiwebserver", "myUseResourceHandler", "An error had occurred: " + err, true);
    });

}










exports.start = function (port, callBack) {

    if (port < 1 || port > 65535) {

        callBack("Invalid port number given");
    }

    server = new hujiDynamicServer(port);

    callBack("", server)

};


