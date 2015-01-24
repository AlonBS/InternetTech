/**
 * Created by Alon And Tal on 06/01/2015.
 */



var errBody = {
    400 : "Error 400: Bad Request",
    401 : "Error 401: Unauthorized",
    404 : "Error 404: Not Found",
    413 : "Error 413: Request Entity Too Large",
    414 : "Error 414: Request-URI Too Large",
    500 : "Error 500: Internal Server Error",
    505 : "Error 505: HTTP Version not supported",

    def:  "Error 500: Internal Server Error"

};


function HttpResponse(clientSocket) {

    this.statusCode = 200;
    this.header= {};

    this.parser = require('./hujiparser');
    this.body = null;

    this.clientSocket = clientSocket;

    this.shouldCloseConnection = false;
    this.isSent = false;

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
        this.header[field.toLowerCase()] = value;
    }
    else {
        for (var val in field ) {
            this.header[val.toLowerCase()] = field[val];
        }
    }


    return this;
};


HttpResponse.prototype.get = function(attr) {

    return this.header[attr.toLowerCase()]
};


HttpResponse.prototype.cookie = function (name, value, options) {

    options = options ? options : {};
    var chValue;
    if (typeof value === 'object') {
        value = JSON.stringify(value);
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

    if (options.secure) chValue.push('secure');

    if (options.expires) chValue.push('expires=' + options.expires.toUTCString());

    if (options.maxAge) {

        options.expires = new Date(Date.now() + options.maxAge);
        chValue.push('max-age=' + options.maxAge);
    }

    if (options.httpOnly) chValue.push('httponly');

    // according to forum we should not support signed-cookie

    chValue = chValue.join('; ');
    if (this.header['set-cookie'] === undefined) {
        this.header['set-cookie'] = [];
    }
    this.header['set-cookie'].push(chValue);

    return this;
};


HttpResponse.prototype.send = function(body) {

    if (this.statusCode !== 200 && (body === undefined || body === null)) {
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

                this.body = body; //.toString();
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
    var socket = this.clientSocket;
    var closeConnection = this.shouldCloseConnection;
    socket.write(msg);
    if (body !== null && body !== undefined && Buffer.isBuffer(body)) { // If it is not, than it is already embedded in msg
        socket.write(body, function() {
            if (closeConnection) {
                socket.end();
            }
        });
    }

    this.isSent = true;
    this.set("content-type", undefined);
    return this;
};


HttpResponse.prototype.json = function(body) {

    var msg = JSON.stringify(body);
    this.set('content-type', 'application/json');

    this.isSent = true;

    return this.send(msg);
};


module.exports = HttpResponse;