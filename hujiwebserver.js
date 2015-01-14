/**
 * Created by Alon & Tal on 21/12/2014.
 */

var hujiDynamicServer = require('./hujidynamicserver.js');

var fs = require('fs');
var path = require ('path');

var serverStaticRootFolder = "";
var shortServerStaticRootFolder = "";
   // TODO - currently - only one server is supported. (this will be enclosed as a private member of hujiwebServer)
var serversNextId = 0; //TODO - needed
var servers = {};   // TODO - needed?

var server; // this dynamic server instance



// TODO - where should we put this method
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

function getFullPath(shortPath) {

    if (shortPath.indexOf('\\') === 0) {
        shortPath = "." + shortPath;
    }

    return path.resolve(shortPath);
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
    rootFolder = path.normalize(rootFolder);

    shortServerStaticRootFolder = rootFolder;

    //if (rootFolder.indexOf('\\') === 0) {
    //    var fullRoot = "." + rootFolder;
    //}

    try {
        serverStaticRootFolder = getFullPath(rootFolder);

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

    return staticResourceHandler;
    //server.use(rootFolder, staticResourceHandler);
};


var staticResourceHandler = function (request, response, next) {

    var fullPath = getFullPath(request.path);

    // checks for unauthorized access: if the file path starts with the given server root folder.
    if (fullPath.indexOf(serverStaticRootFolder) != 0) {
        response.status(401).send();

        //sendErrorResponse(401, socket, closeConnection);
        writeLog("hujiwebserver", "staticResourceHandler", "unauthorized access to: " + request.path, true);
        return;
    }


    fs.stat(fullPath, function (err, stats) {

        if (err || !stats.isFile()) {
            response.status(404).send();
            writeLog("hujiwebserver", "staticResourceHandler", fullPath + " is not a file or doesn't exist", true);

            //sendErrorResponse(404, socket, closeConnection);
            return;
        }

        fs.readFile(fullPath, 'utf8', function (err, data) {

            if (err) {
                response.status(404).send();
            }

            // TODO - to tal: I think you have a mistake here. shouldn't it be:
            // TODO - why do you set response.closeConnection to false?
            var closeConnection = response.shouldCloseConnection;
            //response.closeConnection(false);

            // send header part

            response.set("content-type", server.identifyType(request.path));
            response.set("content-length", stats.size);
            response.send(data);

            //console.log("closeConnection: " + closeConnection + ", content of file: " + request.path + ", is: " + data);

            if (closeConnection)
                request.clientSocket.end();

        });

        // opens the file as a readable stream
        //var fileAsAStream = fs.createReadStream(fullPath);
        //
        //console.log("aaa 3");
        //
        //// waits until we know the readable stream is actually valid before piping
        //fileAsAStream.on("open", function() {
        //
        //
        //    // TODO - to tal: I think you have a mistake here. shouldn't it be:
        //    // TODO - why do you set response.closeConnection to false?
        //    var closeConnection = response.shouldCloseConnection;
        //    response.closeConnection(false);
        //
        //    // send header part
        //    response.set("content-type", server.identifyType(request.path));
        //    response.set("content-length", stats.size);
        //    response.send();
        //
        //    //var response = httpObjects.createHttpResponse(version, "200", reasonPharseContent[200],
        //    //    {"Content-Type" : identifyType(request.path), "Content-Length" : stats.size},"");
        //    //
        //    //socket.write(parser.stringify(response));
        //
        //    // send 'body' content
        //    fileAsAStream.pipe(request.clientSocket, {end: false});
        //
        //    if (closeConnection)
        //        request.clientSocket.end();
        //});

        // catches any errors that happen while creating the readable stream (usually invalid names)
        //fileAsAStream.on("error", function(err) {
        //    response.status(404).send();
        //    writeLog("hujiwebserver", "staticResourceHandler", "An error had occurred: " + err, true);
        //
        //    //sendErrorResponse(404, socket, closeConnection);
        //})
    })
};



exports.myUse = function (resource) {

    this.toString = function() {
        return "EX"; // TODO THIS IS NOT GOOD
    };

    server.put(resource, myUseResourceHandler);
};


var myUseResourceHandler = function (request, response, next) {

    // opens the file as a writable stream
    var fullPath = getFullPath(request.path);

    var writeToFile = fs.createWriteStream(fullPath); //TODO we jave a problem since we don't no the 'path'

    // waits until we know the writable stream is actually valid before piping
    writeToFile.on("open", function() {

        writeToFile.write(request.body, function () {

            writeToFile.end();

            // we always close connection once a file has being uploaded
            response.closeConnection(true);
            response.status(200).send("File uploaded successfully.");

            next();

        });
    });

    // catches any errors that happen while creating the readable stream (usually invalid names)
    writeToFile.on("error", function(err) {
        response.status(500).send("Unable to upload the file.");
        writeLog("hujiwebserver", "myUseResourceHandler", "An error had occurred: " + err, true);

        next();
    });
};










exports.start = function (port, callBack) { // callBack which defines usage of server

    try {

        server = new hujiDynamicServer(port);
        setTimeout( callBack(undefined, server), 500);     // This will allow the server to set up properly
    }
    catch(e) {
        setTimeout( callBack(e.message), 500);
    }
};


