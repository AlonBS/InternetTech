/**
 * Created by Alon And Tal on 06/01/2015.
 */


function HttpRequest(method, version, header,
                     body, bodyParams, leftData, query,
                     cookies, path, host, protocol) {

    if (leftData === undefined || leftData === null) {
        leftData = ""
    }

    this.method = method;
    this.params = {};
    this.version = version;
    this.header = header;
    this.body = body;
    this.bodyParams = bodyParams;
    this.leftData = leftData;

    this.query = query;
    this.cookies = cookies;
    this.path = path;
    this.host = host;
    this.protocol = protocol;
};


HttpRequest.prototype.get = function(attr) {

    return this.header[attr.toLowerCase()];
};


HttpRequest.prototype.param = function(pName) {

    if (this.params[pName.toLowerCase()] !== undefined) {
        return this.params[pName.toLowerCase()]
    }
    else if (this.bodyParams[pName.toLowerCase()] !== undefined) {
        return this.bodyParams[pName.toLowerCase()]
    }
    else if (this.query[pName.toLowerCase()] !== undefined) {
        return this.query[pName.toLowerCase()]
    }
};


HttpRequest.prototype.is = function(type) {

    if (this.header['content-type'].match(type.toLowerCase()) !== null) {
        return true;
    }

    return false;
};


HttpRequest.prototype.updateParams = function(matches, paramsNames) {

    for (var name in paramsNames) {
        var index = paramsNames[name];
        this.params[name] = matches[index];
    }
};


module.exports = HttpRequest;

