/**
 * Created by Alon & Tal on 21/12/2014.
 */

var hujiDynamicServer = require('./hujidynamicserver.js');

var fs = require('fs');
var path = require ('path');

var serverStaticRootFolder = "";
var shortServerStaticRootFolder = "";

var server; // this dynamic server instance


function getFullPath(shortPath, isStatic) {

    if (isStatic === true)
        shortPath = serverStaticRootFolder + shortPath;

    if (shortPath.indexOf('\\') === 0) {
        shortPath = "." + '\\' + shortPath;
    }

    return path.resolve(shortPath);
}


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

    try {
        serverStaticRootFolder = getFullPath(rootFolder, false);

        // verify that the received root folder  exists
        if (!fs.existsSync(serverStaticRootFolder)) {
            writeLog("hujiwebserver", "static", "invalid root folder", true);

            return;
        }
    } catch (e) {}

    return staticResourceHandler;
};


var staticResourceHandler = function (request, response, next) {

    var fullPath = getFullPath(request.path, true);

    // checks for unauthorized access: if the file path starts with the given server root folder.
    if (fullPath.indexOf(serverStaticRootFolder) != 0) {
        response.status(401).send();

        writeLog("hujiwebserver", "staticResourceHandler", "unauthorized access to: " + request.path, true);
        return;
    }


    fs.stat(fullPath, function (err, stats) {

        if (err || !stats.isFile()) {
            response.status(404).send();
            writeLog("hujiwebserver", "staticResourceHandler", fullPath + " is not a file or doesn't exist", true);

            return;
        }

        fs.readFile(fullPath, 'utf8', function (err, data) {

            if (err) {
                response.status(404).send();
            }

            var closeConnection = response.shouldCloseConnection;

            // send header part
            response.set("content-type", server.identifyType(request.path));
            response.set("content-length", stats.size);
            response.send(data);

            if (closeConnection)
                request.clientSocket.end();

        });
    })
};



exports.myUse = function (resource) {

    this.toString = function() {
        return "This function registers a resource which will allow users to upload\n" +
            "a file. The file is kept in a safe directory of which the caller of this function has\n" +
            "no control of (for safety reasons). Over all, this allows rather easy way to\n" +
            "upload a file to the server's disk.";
    };

    // if no resource is given, we assume that this was called in order to call the 'toString()' function,
    // so we don't register the server.
    if (resource !== undefined && resource !== null) {
        server.put(resource, myUseResourceHandler);
    }

    return this;
};


var myUseResourceHandler = function (request, response, next) {

    // opens the file as a writable stream
    var fullPath = getFullPath(request.path, false);

    var writeToFile = fs.createWriteStream(fullPath);

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


exports.start = function (port, callBack) {

    try {

        server = new hujiDynamicServer(port);
        setTimeout( callBack(undefined, server), 500);
    }
    catch(e) {
        setTimeout( callBack(e.message), 500);
    }
};


