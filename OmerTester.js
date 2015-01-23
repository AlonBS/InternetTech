
var HOST = 'localhost';
var PORT = 8080;

var passed_counter = 0;
var failed_counter = 0;
var test_counter = 0;
var index =0;
var timeout=200;
var DEBUG = true;
var http = require('http');
var net = require('net');
http.globalAgent.maxSockets = 250;
var hujiwebserver = require('./hujiwebserver');
hujiwebserver.start(PORT, function(err, server) {
    if (err) {
        console.log("test failed : could not revive server " + err);
        return;
    }

    console.log("server successfully listening to port " + PORT);
    console.log("starting test");

    server.use('/test/cookie', function (req, res, next) {
        res.status(200);
        res.send(req.cookies);
    });

    server.use('/x/y', function (req, res, next) {
        res.status(200);
        res.send(req.path);
    });

    server.use('/params/:id/gabi/:num', function (req, res, next) {
        res.status(200);
        res.send(req.path + '->' + JSON.stringify(req.params));
    });


    server.use(function (req, res, next) {
        //if (req.path == '/catchme/foo/boo/style.css') {
        if (req.path == '\\catchme\\foo\\boo\\style.css') {
            res.status(200);
            res.send("catch /*");
            return;
        }
        next();
    });


    server.use('/request/test/params/:param', function (req, res, next) {

        res.status(200);
        res.send(JSON.stringify(req.params));
    });


    server.use('/request/test/query', function (req, res, next) {
        res.status(200);
        res.send(JSON.stringify(req.query));
    });


    server.use('/request/test/cookie', function (req, res, next) {
        res.status(200);
        res.send(JSON.stringify(req.cookies));
    });


    server.use('/request/test/path', function (req, res, next) {
        res.status(200);
        res.send(req.path);
    });

    server.use('/request/test/host', function (req, res, next) {
        res.status(200);
        res.send(req.host);
    });


    server.use('/request/test/protocol', function (req, res, next) {
        res.status(200);
        res.send(req.protocol);
    });

    server.use('/request/test/get/Content-Type', function (req, res, next) {
        res.status(200);
        res.send(req.get("Content-Type"));
    });

    server.use('/request/test/get/content-type', function (req, res, next) {
        res.status(200);
        res.send(req.get("content-type"));
    });

    server.use('/request/test/get/Something', function (req, res, next) {
        res.status(200);
        res.send(req.get("Something"));
    });


    server.use('/request/test/param', function (req, res, next) {
        res.status(200);
        res.send(req.param('name'));
    });

    server.use('/request/test/params_input/user/:name', function (req, res, next) {
        res.status(200);
        res.send(req.param('name'));
    });


    server.use('/request/test/is', function (req, res, next) {
        var t = req.is(req.body);
        t = ( t ) ? "true" : "false";
        res.status(200);
        res.send(t);
    });


    server.use('/response/test/set', function (req, res, next) {
        res.set('Content-Type', 'response_test_set');
        res.status(200).send();
    });

    server.use('/response/test/set2', function (req, res, next) {
        res.set({'Content-Type': 'response_test_set'});
        res.status(200).send();
    });


    server.use('/response/test/status', function (req, res, next) {
        res.status(404).send("gabi was here");
    });

    server.use('/response/test/get', function (req, res, next) {
        res.set({'Content-Type': 'response_test_set'});
        res.status(200);
        res.send(res.get('Content-Type'))
    });

    server.use('/response/test/cookie', function (req, res, next) {
        res.cookie('name', 'tobi', {domain: '.example.com', path: '/admin', secure: true});
        res.status(200).send();
    });

    server.use('/response/test/send/:id', function (req, res, next) {
        res.status(200);

        switch (req.params.id) {
            case '1':
                res.send(new Buffer('whoop'))
                break;
            case '2':
                res.send({some: 'json'});
                break;
            case '3':
                res.send('some html');
                break;
            case '4':
                res.status(404).send('Sorry, we cannot find that!');
                break;
            case '5':
                res.status(500).send({error: 'something blew up'});
                break;
            case '6':
                res.send();
                break;
            default :
                res.status(404).send();
        }
    });

    server.use('/response/test/json/:id', function (req, res, next) {
        res.status(200);

        switch (req.params.id) {
            case '1':
                res.json(null);
                break;
            case '2':
                res.json({user: 'tobi'});
                break;
            case '3':
                res.status(500);
                res.json({error: 'message'});
                break;
            default :
                res.status(404).send();
        }
    });


    server.use('/response/test/next', function (req, res, next) {
        res.body = 'next1;'
        next();
    });

    server.use('/response/test/next', function (req, res, next) {
        res.body += 'next2;'
        next();
    });

    server.use('/response/test/next', function (req, res, next) {
        res.body += 'next3;'
        res.status(200).send(res.body);
    });


    server.use('/test/exceptions_handling', function (req, res, next) {

        // cause an exceptions
        throw "server internal exception...";

    });

    server.get('/test/get', function (req, res, next) {
        res.status(200).send();
    });

    server.post('/test/post', function (req, res, next) {
        res.status(200).send();
    });

    server.put('/test/put', function (req, res, next) {
        res.status(200).send();
    });


    server.delete('/test/delete', function (req, res, next) {
        res.status(200).send();
    });

    server.use("/static", hujiwebserver.static("ex2"));


    setTimeout(function() {server.stop();console.log("server shutdown")},5000);
    run_server_tests();
});



/*
 * send a msg to the server with options and making sure the response is as expected
 *
 * options = {
 *              path:<path>,
 *              method:<method>,
 *              data:<data>,
 *              test_name:<test name>
 *            }
 * expected = {
 *              status:<status>,
 *              data:<data>
 *             }
 */
function single_server_test(options, expected){
    var req_options = {
        hostname: HOST,
        port: PORT,
        path: options.path,
        method: options.method
    };

    if(options.headers){
        req_options.headers = options.headers;
    }

    var req = http.request(req_options, function(res) {
        var buffer = '';

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            buffer += chunk;
        });

        res.on('end', function () {
            test_counter++;
            res.buffer = buffer;
            if(res.statusCode != expected.status || (expected.data && (expected.data != buffer)) ||
                (expected.func && !expected.func(res))){

                console.warn("test #"+test_counter+":  "+options.test_name + " ... FAILED");
                failed_counter++;
                if(DEBUG){
                    console.warn("--------------------------------------------------");
                    if(res.statusCode != expected.status){
                        console.warn("got ", res.statusCode," but expected", expected.status);
                    }
                    if(buffer != expected.data){
                        console.warn("got ",buffer," but expected",expected.data);
                    }

                    if(expected.func && !expected.func(res)){
                        console.warn("func failed");
                        console.warn(expected.func.toString());
                    }
                    console.warn("--------------------------------------------------");
                }

            } else {
                console.log("test #"+test_counter + ":  "+options.test_name + " ... PASSED");
                passed_counter++;
            }

            if(test_counter >= test_l.length){
                report_test_results();
            }
        });

    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    if(options.data){
        req.write(options.data);
    }
    req.end();
    if(index<test_l.length-1) {
        index += 1;
        setTimeout(function () {
            single_server_test(test_l[index].options, test_l[index].expected)
        }, 10);
    }
}

function report_test_results(){
    console.log("--------------------------------------------------");
    console.log("total of ", passed_counter,"/",passed_counter+failed_counter, " tests were passed");
    console.log("--------------------------------------------------");
}
function run_server_tests() {
    setTimeout(function() {single_server_test(test_l[0].options, test_l[0].expected)}, 1000);
}
var test_l = [
    {
        options: {
            path:"/test/cookie",
            method:"GET",
            test_name:"testing the cookieParser middleware",
            headers:{"Cookie": "name=value; name2=value2" }
        },
        expected:{
            status:200,
            data:"{\"name\":\"value\",\"name2\":\"value2\"}"
        }
    },
    {
        options: {
            path:"/blibla/bukuki",
            method:"GET",
            test_name:"simple get test"
        },
        expected:{
            status:404,
            data:"Error 404: Not Found" // data:"The requested resource not found"
        }
    },
    {
        options: {
            path:"/x/y/test.txt",
            method:"GET",
            test_name:"testing that use(/x/y, ... ) catches /x/y/*"
        },
        expected:{
            status:200,
            data:"\\x\\y\\test.txt"
        }
    },
    {
        options: {
            path:"/params/201582723/gabi/25/gabi.txt",
            method:"GET",
            test_name:"testing path with parameters e.g /params/:id/gabi/:num/"
        },
        expected:{
            status:200,
            data:"\\params\\201582723\\gabi\\25\\gabi.txt->{\"id\":\"201582723\",\"num\":\"25\"}"
            //todo ask gabi about change
        }
    },
    {
        options: {
            path:"/catchme/foo/boo/style.css",
            method:"GET",
            test_name:"testing the use(func(){..}) will catch /* paths, ( resource is optional )"
        },
        expected:{
            status:200,
            data:"catch /*"
        }
    }, // request
    {
        options: {
            path:"/request/test/params/param123",
            method:"GET",
            test_name:"testing the request params object"
        },
        expected:{
            status:200,
            data:"{\"param\":\"param123\"}"
        }
    },
    {
        options: {
            path:"/request/test/query?q=omer+ornan",
            method:"GET",
            test_name:"testing the request query object for ?q=omer+ornan"
        },
        expected:{
            status:200,
            data:"{\"q\":\"omer ornan\"}"
        }
    },
    {
        options: {
            path:"/request/test/cookie",
            method:"GET",
            test_name:"testing the request Cookie object for Cookie: name=tj",
            headers:{Cookie: "name=tj"}
        },
        expected:{
            status:200,
            data:"{\"name\":\"tj\"}"
        }
    },
    {
        options: {
            path:"/request/test/cookie",
            method:"GET",
            test_name:"testing the request Cookie object for Cookie: name=tj; class=sponge bob",
            headers:{Cookie: "name=tj; class=sponge bob"}
        },
        expected:{
            status:200,
            data:"{\"name\":\"tj\",\"class\":\"sponge bob\"}"
        }
    },
    {
        options: {
            path:"/request/test/path/gabi?order=desc&shoe[color]=blue&shoe[type]=converse",
            method:"GET",
            test_name:"testing the request path"
        },
        expected:{
            status:200,
            data:"\\request\\test\\path\\gabi"
        }
    },
    {
        options: {
            path:"/request/test/host/omer.txt",
            method:"GET",
            test_name:"testing the request host"
        },
        expected:{
            status:200,
            data:"localhost"   // data:"localhost:8080"
        }
    },
    {
        options: {
            path:"/request/test/protocol/omer.txt",
            method:"GET",
            test_name:"testing the request protocol"
        },
        expected:{
            status:200,
            data:"http"
        }
    },
    {
        options: {
            path:"/request/test/get/Content-Type",
            method:"POST",
            test_name:"testing request get('Content-Type')",
            headers:{"Content-Type": "text/html", "Content-Length":"hello world!".length},
            data:"hello world!"

        },
        expected:{
            status:200,
            data:"text/html"
        }
    },
    {
        options: {
            path:"/request/test/get/content-type",
            method:"POST",
            test_name:"testing request get('content-type')",
            headers:{"Content-Type": "text/html", "Content-Length":"hello world!".length},
            data:"hello world!"
        },
        expected:{
            status:200,
            data:"text/html"
        }
    },
    {
        options: {//todo gabi return "/" handler
            path:"/request/test/get/Something",
            method:"POST",
            test_name:"testing request get('Something')",
            headers:{"Content-Type": "text/html", "Content-Length":"hello world!".length},
            data:"hello world!"

        },
        expected:{
            status:200,
            data:""
        }
    },
    {
        options: {
            path:"/request/test/param?name=gabi",
            method:"GET",
            test_name:"testing request param('name') for path ?name=gabi"

        },
        expected:{
            status:200,
            data:"gabi"
        }
    },
    {//todo gabi return wrong handler
        options: {
            path:"/request/test/params_input/user/gabi",
            method:"GET",
            test_name:"testing request param('name') for user/:name"
        },
        expected:{
            status:200,
            data:"gabi"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('html') for \"Content-Type: text/html; charset=utf-8\"",
            headers:{"Content-Type": "text/html; charset=utf-8", "Content-Length":"html".length },
            data:"html"
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('text/html') for \"Content-Type: text/html; charset=utf-8\"",
            headers:{"Content-Type": "text/html; charset=utf-8", "Content-Length":'text/html'.length },
            data:'text/html'
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('text/*') for \"Content-Type: text/html; charset=utf-8\"",
            headers:{"Content-Type": "text/html; charset=utf-8", "Content-Length":'text/*'.length },
            data:'text/*'
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('json') for \"Content-Type: application/json\"",
            headers:{"Content-Type": "application/json", "Content-Length":'json'.length },
            data:'json'
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('application/json') for \"Content-Type: application/json\"",
            headers:{"Content-Type": "application/json", "Content-Length":'application/json'.length },
            data:'application/json'
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('application/*') for \"Content-Type: application/json\"",
            headers:{"Content-Type": "application/json", "Content-Length":'application/*'.length },
            data:'application/*'
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/request/test/is",
            method:"POST",
            test_name:"testing req.is('html') for \"Content-Type: application/json\" is false",
            headers:{"Content-Type": "application/json", "Content-Length":'html'.length },
            data:'html'
        },
        expected:{
            status:200,
            data:"false"
        }
    },
    {
        options: {
            path:"/response/test/set",
            method:"GET",
            test_name:"testing response.set('Content-Type','response_test_set')"
        },
        expected:{
            status:200,
            data:"",
            func: function(res){
                return (JSON.stringify(res.headers["content-type"]) == "\"response_test_set\"");
            }
        }
    },
    {
        options: {
            path:"/response/test/set2",
            method:"GET",
            test_name:"testing response.set({'Content-Type':'response_test_set'})"
        },
        expected:{
            status:200,
            data:"",
            func: function(res){
                return (JSON.stringify(res.headers["content-type"]) == "\"response_test_set\"");
            }
        }
    },
    {
        options: {
            path:"/response/test/status",
            method:"GET",
            test_name:"testing res.status(404)"
        },
        expected:{
            status:404,
            data:"gabi was here"
        }
    },
    {
        options: {
            path:"/response/test/get",
            method:"GET",
            test_name:"testing res.get('Content-Type')"
        },
        expected:{
            status:200,
            data:"response_test_set"
        }
    },
    {
        options: {
            path:"/response/test/send/2",
            method:"GET",
            test_name:"testing res.send({ some: 'json' })"
        },
        expected:{
            status:200,
            data:"{\"some\":\"json\"}"
        }
    },
    {
        options: {
            path:"/response/test/send/3",
            method:"GET",
            test_name:"testing res.send('some html')"
        },
        expected:{
            status:200,
            data:"some html"
        }
    },
    {
        options: {
            path:"/response/test/send/4",
            method:"GET",
            test_name:"testing res.send(404, 'Sorry, we cannot find that!')"
        },
        expected:{
            status:404,
            data:"Sorry, we cannot find that!"
        }
    },
    {
        options: {
            path:"/response/test/send/4",
            method:"GET",
            test_name:"testing res.send(500, { error: 'something blew up' })"
        },
        expected:{
            status:404,
            data:"Sorry, we cannot find that!"
        }
    },
    {
        options: {
            path:"/response/test/send/5",
            method:"GET",
            test_name:"testing res.send(500, { error: 'something blew up' })"
        },
        expected:{
            status:500,
            data:"{\"error\":\"something blew up\"}"
        }
    },
    {
        options: {
            path:"/response/test/send/6",
            method:"GET",
            test_name:"testing res.send(200)"
        },
        expected:{
            status:200,
            data:""
        }
    },
    {
        options: {
            path:"/response/test/json/1",
            method:"GET",
            test_name:"testing res.json(null)"
        },
        expected:{
            status:200,
            data:"null"
        }
    },
    {
        options: {
            path:"/response/test/json/2",
            method:"GET",
            test_name:"testing res.json({ user: 'tobi' })"
        },
        expected:{
            status:200,
            data:"{\"user\":\"tobi\"}"
        }
    },
    {
        options: {
            path:"/response/test/json/3",
            method:"GET",
            test_name:"testing 500, { error: 'message' })"
        },
        expected:{
            status:500,
            data:"{\"error\":\"message\"}"
        }
    },
    {
        options: {
            path:"/response/test/next",
            method:"GET",
            test_name:"testing that the next() method works"
        },
        expected:{
            status:200,
            data:"next1;next2;next3;"
        }
    },
    {
        options: {
            path:"/no/such/path",
            method:"GET",
            test_name:"testing 404 not found error"
        },
        expected:{
            status:404,
            data:"The requested resource not found"
        }
    },
    {
        options: {
            path:"/test/exceptions_handling",
            method:"GET",
            test_name:"testing exceptions handling"
        },
        expected:{
            status:500,
            data: "Error 500: Internal Server Error"    // data:"Internal Server Error"
        }
    },
    {
        options: {
            path:"/test/get",
            method:"GET",
            test_name:"testing server.get()"
        },
        expected:{
            status:200,
            data:""
        }
    },
    {
        options: {
            path:"/test/get",
            method:"POST",
            test_name:"testing server.get() won\'t work for non get requests"
        },
        expected:{
            status:404,
            data:"The requested resource not found"
        }
    },
    {
        options: {
            path:"/test/post",
            method:"POST",
            test_name:"testing server.post()"
        },
        expected:{
            status:200,
            data:""
        }
    },
    {
        options: {
            path:"/test/post",
            method:"GET",
            test_name:"testing server.post() won\'t work for non post requests"
        },
        expected:{
            status:404,
            data:"The requested resource not found"
        }
    },
    {
        options: {
            path:"/test/put",
            method:"PUT",
            test_name:"testing server.put()"
        },
        expected:{
            status:200,
            data:""
        }
    },
    {
        options: {
            path:"/test/put",
            method:"GET",
            test_name:"testing server.put() won\'t work for non post requests"
        },
        expected:{
            status:404,
            data:"The requested resource not found"
        }
    },
    {
        options: {
            path:"/test/delete",
            method:"DELETE",
            test_name:"testing server.delete()"
        },
        expected:{
            status:200,
            data:""
        }
    },
    {
        options: {
            path:"/test/delete",
            method:"GET",
            test_name:"testing server.delete() won\'t work for non post requests"
        },
        expected:{
            status:404,
            data:"The requested resource not found"
        }
    }

];