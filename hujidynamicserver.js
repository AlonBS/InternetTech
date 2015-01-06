/**
 * Created by Alon and Tal on 06/01/2015.
 */

// square.js
function Server(socket) {

    this.socket = socket;

    this.stop = function() {

        socket.stop();

        console.log("Stop called!")
    }

    this.use = function(resource , requestHndler(rq,rs, next)) {

        console.log("use Called");
    }
};




module.exports = Server;