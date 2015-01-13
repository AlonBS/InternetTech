/**
 * Created by Alon & Tal on 21/12/2014.
 */

//TODO the request module is here, but the respone is in dynamicServer. Maybe unite them?
var httpRequestModule = require('./HttpRequest');

var pathModule = require('path');

var reasonPharseContent = {
    200 : "OK",
    400 : "Bad Request",
    401 : "Unauthorized",
    404 : "Not Found",
    413 : "Request Entity Too Large",
    414 : "Request-URI Too Large",
    500 : "Internal Error",
    505 : "HTTP Version not supported",

    def: "Internal Error"
};

exports.parse = function (dataAsString) {

    var lines = dataAsString.split(/[\r\n][\r\n]?/);

    var i=0;

    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
    var requestLineMatch = requestLineRegex.exec(lines[i++]);

    var method, path, host, query = {}, version, protocol, header = {}, body, leftData;

    // parse the request line
    if (requestLineMatch != null) {
        method = requestLineMatch[1].toLowerCase();

        requestLineMatch[2] = pathModule.normalize(requestLineMatch[2].toLowerCase().trim());

        var uriRegex = '^[^\\\\\\.]*([\\\\][\\\\])?[^\\\\]*([\\\\][^\\?#]*)(\\?|#)?(.*)';
        var matches = requestLineMatch[2].match(uriRegex);

        path = matches[2];
        if (matches[3] === '?') {
            query = fillQueryParams(matches[4])
        }


        //var index = path.indexOf('?');
        //if (index !== -1) {
        //    var queryParams = path.substr(index+1);
        //    query = fillQueryParams(queryParams);
        //    path = path.substr(0, index);
        //    //path = path.normalize(path);
        //}

        version = requestLineMatch[5].toUpperCase();

        if (version.indexOf("HTTP\/") == 0) {
            protocol = "HTTP";
        }
        else if (version.indexOf("HTTPS\/") == 0) {
            protocol = "HTTPS";
        }

    }

    // parse the header lines (if exist)


    while (i < lines.length && lines[i] !== "") {
        var headerRegex = /[\s]*([^:\s]+)[\s]*:[\s]*(.*)/g;
        var headerMatch = headerRegex.exec(lines[i++]);

        if (headerMatch != null) {
            var headerVal = headerMatch[2].toLowerCase();

            if (headerMatch[1].toLowerCase() === "host") {
                var colonIndex = headerVal.lastIndexOf(':');

                if (colonIndex !== -1)
                    headerVal = headerVal.substr(0, colonIndex);

                host = headerVal;
            }

            header[headerMatch[1].toLowerCase()] = headerVal;
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
    // TODO: right now we don't support request line: "POST /name=tobi HTTP/1.1\n"... that let return "tobi" for req.param('name')

    // TODO: complete implemnatation !!

    return new httpRequestModule(method, version, header, body, leftData, query, null /* cookies*/, path, host, protocol);
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
    var httpResponseAsString = "HTTP/1.1 " + httpResponse.statusCode + " " +
        reasonPharseContent[httpResponse.statusCode] + "\r\n";

    for (var headerKey in httpResponse.header) {
        httpResponseAsString += headerKey + ": " + httpResponse.header[headerKey] + "\r\n";
    }

    httpResponseAsString += "\r\n";
    if (httpResponse.body !== null)
        httpResponseAsString += httpResponse.body;

    return httpResponseAsString;
};