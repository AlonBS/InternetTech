/**
 * Created by Alon And Tal on 06/01/2015.
 */


function HttpRequest(method, version, header,
                     body, leftData, query,
                     cookies, path, host, protocol) {

    if (leftData === undefined || leftData === null) {
        leftData = ""
    }

    this.method = method;
    this.params = {};
    this.version = version;
    this.header = header;
    this.body = body;
    this.leftData = leftData;

    this.query = query;
    this.cookies = cookies;
    this.path = path;
    this.host = host;
    this.protocol = protocol;
};


HttpRequest.prototype.get = function(attr) {

    return this.header[attr];
};


HttpRequest.prototype.param = function(pName) {

    if (this.params[pName] !== undefined) {
        return this.params[pName]
    }
    else if (this.query[pName] !== undefined) {
        return this.query[pName]
    }
};


HttpRequest.prototype.is = function(type) {

    if (this.header['content-type'] === type.toLowerCase()) {
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

