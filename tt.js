/**
* Created by Alon on 04/01/2015.
*/

var webServer = require('./hujiwebserver.js');


function callBack(err, server) {

    server.use();
    server.stop();

}



webServer.start(8888, callBack)




//
//
//
//}