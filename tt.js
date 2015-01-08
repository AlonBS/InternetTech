// user/:name/y
function transformToRegex(r, request) {

    var endsWithSlash = r.indexOf('/', r.length - 1) !== -1;
    var suffix = endsWithSlash ? '?.*$' : '/?.*$';
    var regex = new RegExp( '^' + r.replace(/(:[a-zA-Z0-9]+|\*)/g, ".*") + suffix);

    console.log(regex)
    console.log(request)

    console.log(regex.test(request))

}





function temp1(req) {

    var requestLine = req.substring(0, req.regexIndexOf(/[\r\n]/));
    console.log(requestLine);

    var requestLineRegex = /^[\s]*([\w]+)[\s]+(([^\s]+?)[\s]+|([^\s]*?))([\w]+\/[0-9\.]+)[\s]*$/g;
    var requestLineMatch = requestLineRegex.exec(requestLine);

    console.log(requestLineMatch[0]);
    console.log(requestLineMatch[1]);
    console.log(requestLineMatch[2]);
    console.log(requestLineMatch[3]);
    console.log(requestLineMatch[4]);
    console.log(requestLineMatch[5]);



}

var msg = "POST /name=tobi HTTP/1.1\n" +
    "Content-Type: text/xml\n" +
    "Host: http://www.example.com:3000\n" +
    "Content-Length: 10\n\n" +
    "This is the body!!!";


temp1(msg);









