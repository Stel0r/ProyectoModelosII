"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var _a = require('canvas'), createCanvas = _a.createCanvas, loadImage = _a.loadImage, Image = _a.Image, context = _a.context;
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
            sala.canvasUrl = response["canvasUrl"];
            sala.canvas = createCanvas(1920, 1080);
            var img_1 = new Image;
            var ctx_1 = sala.canvas.getContext('2d');
            var source = sala.canvasUrl;
            ctx_1.clearRect(0, 0, sala.canvas.width, sala.canvas.height);
            img_1.onload = function () {
                ctx_1.drawImage(img_1, 0, 0);
            };
            img_1.src = source;
            sala.integrantes.set(response["user"], ws);
            listaSalas.push(sala);
            var message_1 = {
                "action": "open",
                "res": "success",
                "code": sala.id,
                "integrantes": Array.from(sala.integrantes.keys())
            };
            ws.send(JSON.stringify(message_1));
            //al buscar una sala
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
            //al conectarse a una sala
        }
        else if (response["action"] == "connect") {
            listaSalas[response["idsala"]].integrantes.set(response["user"], ws);
            var msg = {
                "action": "connect",
                "res": "success",
                "canvasUrl": listaSalas[response["idsala"]].canvas.toDataURL(),
                "integrantes": Array.from(listaSalas[response["idsala"]].integrantes.keys())
            };
            ws.send(JSON.stringify(msg));
            //enviar aviso de que un nuevo miembro ingresa
            listaSalas[response["idsala"]].integrantes.forEach(function (socket) {
                if (socket != ws) {
                    var res = {
                        "action": "newMember",
                        "integrantes": Array.from(listaSalas[response["idsala"]].integrantes.keys()),
                    };
                    socket.send(JSON.stringify(res));
                }
            });
            //al enviar un trazo
        }
        else if (response["action"] == "stroke") {
            //envia la info a todos los conectados a la sala
            drawUpdate(response["data"], listaSalas[response["idsala"]].canvas.getContext('2d'));
            listaSalas[response["idsala"]].integrantes.forEach(function (socket) {
                if (socket != ws) {
                    var res = {
                        "action": "stroke",
                        "user": response["user"],
                        "data": response["data"]
                    };
                    socket.send(JSON.stringify(res));
                }
            });
        }
    });
    ws.on('close', function () {
        listaSalas.forEach(function (sala) {
            sala.integrantes.forEach(function (v, k) {
                if (v == ws) {
                    sala.integrantes.delete(k);
                    sala.integrantes.forEach(function (socket) {
                        var res = {
                            "action": "newMember",
                            "integrantes": Array.from(sala.integrantes.keys()),
                        };
                        socket.send(JSON.stringify(res));
                    });
                }
            });
        });
    });
});
//Iniciar el Servidor
server.listen(process.env.PORT || 8999, function () {
    console.log("Servidor esta escuchando en el puerto ".concat(server.address().port, " :)"));
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
function drawUpdate(update, context) {
    for (var _i = 0, update_1 = update; _i < update_1.length; _i++) {
        var list = update_1[_i];
        context.beginPath();
        context.moveTo(list[0], list[1]);
        context.lineTo(list[2], list[3]);
        context.strokeStyle = list[4];
        context.lineWidth = list[5];
        context.stroke();
    }
}
