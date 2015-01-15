/**
 * Created by Alon And Tal on 06/01/2015.
 */



var errBody = {
    400 : "Error 400: Bad Request",
    401 : "Error 401: Unauthorized",
    404 : "Error 404: Not Found",
    413 : "Error 413: Request Entity Too Large",
    414 : "Error 414: Request-URI Too Large",
    505 : "Error 505: HTTP Version not supported",

    def:  "Error 500: Undefined Error"

};


function HttpResponse(clientSocket) {

    this.statusCode = 200;
    this.header= {};

    this.parser = require('./hujiparser');
    this.body = null;

    this.clientSocket = clientSocket;

    this.shouldCloseConnection = false;

    return this;
};




HttpResponse.prototype.status = function status(statusCode) {

    this.statusCode = statusCode;
    return this;
};


HttpResponse.prototype.closeConnection = function closeConnection(shouldClose) {

    this.shouldCloseConnection = shouldClose;
    return this;
};


HttpResponse.prototype.set = function(field, value) {

    if (value !== undefined) {
        this.header[field] = value;
    }
    else {
        for (var val in field ) {
            this.header[val] = field[val];
        }
    }


    return this;
};


HttpResponse.prototype.get = function(attr) {

    return this.header[attr]
};


HttpResponse.prototype.cookie = function (name, value, options) {

    options = options ? options : {};
    var chValue;
    if (typeof value === 'object') {
        value = 'j:' + JSON.stringify(value);
    }

    chValue =  [name + '=' + value];

    if (options.domain) chValue.push('domain=' + options.domain);

    if (options.path === undefined) {
        options.path = '/';
        chValue.push('path=' + options.path);
    }
    else {
        chValue.push('path=' + options.path);
    }

    if (options.secure) chValue.push('secure=true');

    if (options.expires) chValue.push('expires=' + options.expires.toUTCString());

    if (options.maxAge) {

        options.expires = new Date(Date.now() + options.maxAge);
        options.maxAge /= 1000; // in seconds
        chValue.push('max-age=' + options.maxAge);
    }

    if (options.httpOnly) chValue.push('httponly=true');
    // according to forum we should not support signed-cookie

    chValue = chValue.join('; ');
    this.set('set-cookie', chValue);

    return this;
};


HttpResponse.prototype.send = function(body) {

    if (this.statusCode !== 200) {
        body = errBody[this.statusCode];
    }

    switch (typeof(body)) {

        case 'string':
            if (this.get('content-type') === undefined) {
                this.set('content-type', 'text/html');
            }
            this.set('content-length', body.length);
            this.body = body;
            break;

        case 'object':
            if (Buffer.isBuffer(body)) {
                if (this.get('content-type') === undefined) {
                    this.set('content-type', 'application/octet-stream');
                }

                this.body = body.toString();
                this.set('content-length', body.length);
            }
            else {
                this.json(body);
            }
            break;
    }

    if (this.get('content-length') === undefined) {
        this.set('content-length', 0);
    }

    var msg = this.parser.stringify(this);
    this.clientSocket.write(msg, function() {
        if (this.shouldCloseConnection) {
            this.clientSocket.end();
        }
    });

    return this;
};


HttpResponse.prototype.json = function(body) {

    var msg = JSON.stringify(body);
    this.set('content-type', 'application/json');

    return this.send(msg);
};


module.exports = HttpResponse;