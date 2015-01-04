/**
 * Created by Alon & Tal on 21/12/2014.
 */

var httpRequestModule = require('./HttpObjects');
var path = require('path');

exports.parse = function (dataAsString) {

    var lines = dataAsString.split(/[\n\r]/);

    var i=0;

    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
    var requestLineMatch = requestLineRegex.exec(lines[i++]);

    var method, requestURI, params, version, header = {}, body, leftData;

    // parse the request line
    if (requestLineMatch != null) {
        method = requestLineMatch[1].toLowerCase();

        // For a static request the URL path specified by the client is relative to the web server's root directory.
        requestURI = requestLineMatch[2].toLowerCase().trim();
        //requestURI = path.normalize(requestURI);

        var index = requestURI.indexOf('?');
        if (index === -1) {
            params = 0;
        }
        else {
            params = requestURI.substr(index+1);
            requestURI = requestURI.substr(0, index);
        }

        version = requestLineMatch[5].toUpperCase();
    }

    // parse the header lines (if exist)
    var headerRegex = /[\s]*([^:\s]+)[\s]*:[\s]*(.*)/g;

    while (i < lines.length && lines[i] !== "") {
        var headerMatch = headerRegex.exec(lines[i++]);

        if (headerMatch != null) {
            header[headerMatch[1].toLowerCase()] = headerMatch[2].toLowerCase();
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

    return httpRequestModule.createHttpRequest(method, requestURI, params, version, header, body, leftData);
};


exports.stringify = function(httpResponse) {
    var httpResponseAsString = httpResponse.version + " " + httpResponse.status + " " + httpResponse.reasonPhrase + "\r\n";

    for (var headerKey in httpResponse.header) {
        httpResponseAsString += headerKey + ": " + httpResponse.header[headerKey] + "\r\n";
    }

    httpResponseAsString += "\r\n";
    httpResponseAsString += httpResponse.body;

    return httpResponseAsString;
};