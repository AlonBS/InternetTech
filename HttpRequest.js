/**
 * Created by Alon on 06/01/2015.
 */


// square.js
function HttpRequest(method, version, header,
                     body, leftData, query,
                     cookies, path, host, protocol) {

    if (leftData === undefined || leftData === null) {
        leftData = ""
    }

    this.method = method;
    //this.requestURI = requestURI;
    this.params = {}; // TODO
    this.version = version;
    this.header = header;
    this.body = body; // TODO verify default is null
    this.leftData = leftData;

    this.query = query; //TODO should be map
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

    //return shit; TODO check what is the default value this function gets

};


HttpRequest.prototype.is = function(type) {

    if (this.header['content-type'] === type.toLowerCase()) {
        return true;
    }

    return false;
};




module.exports = HttpRequest;

