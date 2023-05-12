"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var app = express();
//initialize a simple http server
var server = http.createServer(app);
//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server: server });
var User = /** @class */ (function () {
    function User(n, w) {
        this.nombre = n;
        this.webSocket = w;
    }
    return User;
}());
var Sala = /** @class */ (function () {
    function Sala() {
        this.integrantes = new Map();
        this.updateList = [];
    }
    return Sala;
}());
var listaSalas = [];
wss.on('connection', function (ws) {
    console.log("connection created");
    //connection is up, let's add a simple simple event
    ws.on('message', function (message) {
        console.log("received: " + message);
        var response = JSON.parse(message.toString());
        //al abrir una sala
        if (response["action"] == "open") {
            var sala = new Sala();
            sala.id = listaSalas.length;
            sala.owner = [response["user"], ws];
            sala.canvas = response["canvasUrl"];
            sala.integrantes.set(response["user"], ws);
            listaSalas.push(sala);
            var message_1 = {
                "action": "open",
                "res": "success",
                "code": sala.id
            };
            ws.send(JSON.stringify(message_1));
        }
        else if (response["action"] == "exist") {
            var msg = void 0;
            if (encontrarSala(response["idsala"])) {
                msg = {
                    "res": "found"
                };
            }
            else {
                msg = {
                    "res": "not found"
                };
            }
            ws.send(JSON.stringify(msg));
        }
        else if (response["action"] == "connect") {
            listaSalas[response["idsala"]].integrantes.set(response["user"], ws);
        }
        else {
            ws.send("y yo te odio a ti :)");
        }
    });
});
//start our server
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port ".concat(server.address().port, " :)"));
});
function encontrarSala(id) {
    for (var _i = 0, listaSalas_1 = listaSalas; _i < listaSalas_1.length; _i++) {
        var s = listaSalas_1[_i];
        if (s.id == id) {
            return true;
        }
    }
    return false;
}
