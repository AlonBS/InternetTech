/**
 * Created by Alon & Tal on 21/12/2014.
 */

var httpRequestModule = require('./HttpRequest');
var httpResponseModule = require('./HttpResponse');
var path = require('path');

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

exports.parse = function (dataAsString) {

    var lines = dataAsString.split(/[\n\r]/);

    var i=0;

    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
    var requestLineMatch = requestLineRegex.exec(lines[i++]);

    var method, path, host, query = {}, version, protocol, header = {}, body, leftData;

    // parse the request line
    if (requestLineMatch != null) {
        method = requestLineMatch[1].toLowerCase();

        // For a static request the URL path specified by the client is relative to the web server's root directory.
        path = requestLineMatch[2].toLowerCase().trim();
        //requestURI = path.normalize(requestURI);

        var index = path.indexOf('?');
        if (index !== -1) {
            var queryParams = path.substr(index+1);
            query = fillQueryParams(queryParams);
            path = path.substr(0, index);
        }

        version = requestLineMatch[5].toUpperCase();

        if (version.contains("http\/")) {
            protocol = "http";
        }
        else if (version.contains("https\/")) {
            protocol = "https";
        }

    }

    // parse the header lines (if exist)
    var headerRegex = /[\s]*([^:\s]+)[\s]*:[\s]*(.*)/g;

    while (i < lines.length && lines[i] !== "") {
        var headerMatch = headerRegex.exec(lines[i++]);

        if (headerMatch != null) {
            header[headerMatch[1].toLowerCase()] = headerMatch[2].toLowerCase();

            if (headerMatch[1].toLowerCase() === "host") {
                var hostVal = headerMatch[2].toLowerCase();
                var colonIndex = hostVal.lastIndexOf(':');

                if (colonIndex === -1)
                    host = hostVal;
                else
                    host = hostVal.substr(0, colonIndex);
            }
        }
    }

    // the next line supposed to be the CRLF line that separates the request and header lines from the body.
    i++;

    // this condition holds only in case that the CRLF line wasn't received
    if (i >= lines.length) {
        return null;
    }

    // check if body is received ("content-length" header is part of the header lines).
    // if yes, it check if it's value is legal.
    if (header["content-length"] !== undefined && parseInt(header["content-length"]) > 0){

        var temp = lines.slice(i).join('\n');

        // check if all the body message is received. if not, returns null.
        if (parseInt(header["content-length"]) > temp.length) {
            return null;
        }

        body = temp.substr(0, parseInt(header["content-length"]));
        leftData = temp.substr(parseInt(header["content-length"]));
    }

    // TODO: complete implemnatation !!
    return new httpRequestModule(method, version, header, body, leftData, query /*, cookies*/, path, host, protocol);
};

function fillQueryParams(queryParams) {
    var query = {};
    var splittedQueryParams = queryParams.split("&");

    for (var i=0; i< splittedQueryParams.length; i++) {
        var equalIndex = splittedQueryParams[i].indexOf('=');

        if (equalIndex != -1) {
            var key = splittedQueryParams[i].substr(0, equalIndex);
            var val = splittedQueryParams[i].substr(equalIndex + 1);
            addToQuery(key, val, query);
        }
    }

    return query;
}

function addToQuery(key, val, query) {
    var leftBracketIndex = key.indexOf('[');

    if (leftBracketIndex !== -1) {
        var rightBracketIndex = key.lastIndexOf(']');
        var newKey = key.substr(0, leftBracketIndex);
        var leftStr = key.substr(leftBracketIndex+1, (rightBracketIndex - leftBracketIndex - 1));

        query[newKey] = addToQuery(leftStr, val, query);

        return query;
    }

    query[key] = val;

    return query;
}



exports.stringify = function(httpResponse) {
    var httpResponseAsString = "HTTP/1.1 " + httpResponse.statusCode + " " + reasonPharseContent[httpResponse.statusCode] + "\r\n";

    for (var headerKey in httpResponse.header) {
        httpResponseAsString += headerKey + ": " + httpResponse.header[headerKey] + "\r\n";
    }

    httpResponseAsString += "\r\n";
    if (httpResponse.body !== null)
        httpResponseAsString += httpResponse.body;

    return httpResponseAsString;
};