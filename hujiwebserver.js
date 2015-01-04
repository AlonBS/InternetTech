/**
 * Created by Alon & Tal on 21/12/2014.
 */

var parser = require('./hujiparser');
var hujiNet = require('./hujinet');
var httpObjects = require('./HttpObjects');

var fs = require('fs');
var path = require ('path');

var serverRootFolder = "";
var serversNextId = 0;
var servers = {};

var reasonPharseContent = {
    200 : "OK",
    400 : "Bad Request",
    401 : "Unauthorized",
    404 : "Not Found",
    413 : "Request Entity Too Large",
    414 : "Request-URI Too Large",
    505 : "HTTP Version not supported",

    def: "Internal Error"
};

var errBody = {
    400 : "Error 400: Bad Request",
    401 : "Error 401: Unauthorized",
    404 : "Error 404: Not Found",
    413 : "Error 413: Request Entity Too Large",
    414 : "Error 414: Request-URI Too Large",
    505 : "Error 505: HTTP Version not supported",

    def:  "Error 500: Undefined Error"

};

var methodOptions = ["options", "get", "head", "post", "put", "delete", "trace", "connect"];


function sendErrorResponse(errCode, socket, closeConnection) {
    var errResponse = httpObjects.createHttpResponse("HTTP/1.1", errCode, reasonPharseContent[errCode],
        {"Content-Type" : "text/plain", "Content-Length" : errBody[errCode].length}, errBody[errCode]);

    socket.write(parser.stringify(errResponse));

    if (closeConnection)
        socket.end();
}

function writeLog(moduleName, funcName, content, isErr) {
    var message = "at " + moduleName + "." + funcName + ": " + content;
    if (isErr) {
        message = "ERROR: " + message;
    }

    console.log(message);
}

function sendFileResponse(filePath, version, socket, closeConnection) {

    // checks for unauthorized access: if the file path starts with the given server root folder.
    if (filePath.indexOf(serverRootFolder) != 0) {
        sendErrorResponse(401, socket, closeConnection);
        writeLog("hujiwebserver", "sendFileResponse", "unauthorized access to: " + filePath, true);
        return;
    }

    fs.stat(filePath, function (err, stats) {
        if (err || !stats.isFile()) {
            writeLog("hujiwebserver", "sendFileResponse", filePath + " is not a file or doesn't exist", true);
            sendErrorResponse(404, socket, closeConnection);
            return;
        }

        // opens the file as a readable stream
        var fileAsAStream = fs.createReadStream(filePath);

        // waits until we know the readable stream is actually valid before piping
        fileAsAStream.on("open", function() {

            // send header part
            var response = httpObjects.createHttpResponse(version, "200", reasonPharseContent[200],
                {"Content-Type" : identifyType(filePath), "Content-Length" : stats.size},"");

            socket.write(parser.stringify(response));

            // send 'body' content
            fileAsAStream.pipe(socket, {end: false});

            if (closeConnection)
                socket.end();
        });

        // catches any errors that happen while creating the readable stream (usually invalid names)
        fileAsAStream.on("error", function(err) {
            writeLog("hujiwebserver", "sendFileResponse", "An error had occurred: " + err, true);
            sendErrorResponse(404, socket, closeConnection);
        })
    })
}


function onRequestArrival(request, socket) {
    var httpRequest = parser.parse(request);

    // if the request is missing or in bad format, return (the error response was already sent)
    if (httpRequest === null || httpRequest === undefined) {
        return;
    }

    // since the request isn't missing, update socket.buffer to holds the data received after reading the received data
    socket.buffer = httpRequest.leftData;

    var closeConnection = shouldCloseConnection(httpRequest);

    if (!isValidRequest(httpRequest, socket, closeConnection)) {
        return;
    }

    var filePath = prepareURI(httpRequest.requestURI);
    if (filePath === null) {
        sendErrorResponse(400, socket, closeConnection);
        return;
    }

    sendFileResponse(filePath, httpRequest.version, socket, closeConnection);
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

// for static request, we need to append the requested uri to the server root path
function prepareURI(requestURI) {
    // supports spaces inside the uri
    requestURI = requestURI.replace(/%20/g,' ');

    // adds '/' to the start (if necessary)
    if (requestURI.indexOf('/') !== 0)
        requestURI = "/" + requestURI;

    try {
        return path.resolve(serverRootFolder + requestURI);
    } catch (e) {
        return null;
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


function identifyType(uri) {

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

exports.start = function (port, rootFolder, callBack) {

    rootFolder = rootFolder.toLowerCase();

    try {
        serverRootFolder = path.resolve(rootFolder);

        // verify that the received root folder is exists
        if (!fs.existsSync(serverRootFolder)) {
            writeLog("hujiwebserver", "start", "invalid server root folder", true);
            callBack("invalid server root folder");
            return -1;
        }
    } catch (e) {
        callBack("invalid server root folder");
        return -1;
    }

    var server = hujiNet.createServer(port, onRequestArrival, callBack);

    servers[serversNextId] = server;

    return serversNextId++;
};


exports.stop = function (serverID, callBack) {

    var asInt = parseInt(serverID);

    if (!asInt in servers) return;

    servers[asInt].close();
    delete servers[asInt];

    // This will allow our server to close any left connections until it can be closed completely.
    setTimeout(function() {
        callBack();
    }, 2000);
};
