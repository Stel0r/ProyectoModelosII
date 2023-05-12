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
var Sala = /** @class */ (function () {
    function Sala() {
        this.integrantes = [];
        this.updateList = [];
    }
    return Sala;
}());
var listaSalas = new Array();
wss.on('connection', function (ws) {
    console.log("connection created");
    //connection is up, let's add a simple simple event
    ws.on('message', function (message) {
        var response = JSON.parse(message.toString());
        //al abrir una sala
        if (response["action"] == "open") {
            var sala = new Sala();
            sala.id = listaSalas.length;
            sala.owner = response["user"];
            sala.canvas = response["canvasUrl"];
            sala.integrantes.push(sala.owner);
            listaSalas.push(sala);
            var message_1 = {
                "action": "open",
                "res": "success",
                "code": sala.id
            };
            ws.send(JSON.stringify(message_1));
        }
    });
    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});
//start our server
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port ".concat(server.address().port, " :)"));
});
