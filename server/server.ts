import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const { createCanvas, loadImage, Image, context } = require('canvas')

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

class User {
    nombre: string
    webSocket: WebSocket
    constructor(n: string, w: WebSocket) {
        this.nombre = n
        this.webSocket = w
    }
}

class Sala {
    id: number
    owner: [string, WebSocket]
    canvasUrl: string
    canvas: HTMLCanvasElement
    lastUpdate: number
    integrantes: Map<string, WebSocket> = new Map()
}

let listaSalas: Array<Sala> = []

wss.on('connection', (ws: WebSocket) => {

    console.log("connection created")

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
        console.log("received: " + message)
        let response = JSON.parse(message.toString())
        //al abrir una sala
        if (response["action"] == "open") {
            let sala = new Sala()
            sala.id = listaSalas.length
            sala.owner = [response["user"], ws]
            sala.canvasUrl = response["canvasUrl"]
            sala.canvas = createCanvas(1920, 1080)
            let img = new Image
            let ctx = sala.canvas.getContext('2d')!
            let source = sala.canvasUrl
            ctx.clearRect(0, 0, sala.canvas.width, sala.canvas.height)
            img.onload = function () {
                ctx.drawImage(img, 0, 0);
            };
            img.src = source

            sala.integrantes.set(response["user"], ws)
            listaSalas.push(sala)
            let message: any = {
                "action": "open",
                "res": "success",
                "code": sala.id,
                "integrantes": Array.from(sala.integrantes.keys())
            }
            ws.send(JSON.stringify(message))
            //al buscar una sala
        } else if (response["action"] == "exist") {
            let msg: any
            if (encontrarSala(response["idsala"])) {
                if (!listaSalas[response["idsala"]].integrantes.has(response["user"])){
                    msg = {
                        "res": "found"
                    }
                }else{
                    msg = {
                        "res": "Already in"
                    }
                }
                
            } else {
                msg = {
                    "res": "not found"
                }
            }
            ws.send(JSON.stringify(msg))
            //al conectarse a una sala
        } else if (response["action"] == "connect") {
            listaSalas[response["idsala"]].integrantes.set(response["user"], ws)
            let msg: any =
            {
                "action": "connect",
                "res": "success",
                "canvasUrl": listaSalas[response["idsala"]].canvas.toDataURL(),
                "integrantes": Array.from(listaSalas[response["idsala"]].integrantes.keys())
            }
            ws.send(JSON.stringify(msg))
            //enviar aviso de que un nuevo miembro ingresa
            listaSalas[response["idsala"]].integrantes.forEach((socket) => {
                if (socket != ws) {
                    let res: any = {
                        "action": "newMember",
                        "integrantes": Array.from(listaSalas[response["idsala"]].integrantes.keys()),
                    }
                    socket.send(JSON.stringify(res))
                }
            })
            //al enviar un trazo
        } else if (response["action"] == "stroke") {
            //envia la info a todos los conectados a la sala
            drawUpdate(response["data"] as Array<[number, number, number, number, string, number]>, listaSalas[response["idsala"]].canvas.getContext('2d')!)
            listaSalas[response["idsala"]].integrantes.forEach((socket) => {
                if (socket != ws) {
                    let res: any = {
                        "action": "stroke",
                        "user": response["user"],
                        "data": response["data"]
                    }
                    socket.send(JSON.stringify(res))
                }
            })
            
        }
    });
    ws.on('close', () => {
        listaSalas.forEach((sala) => {
            sala.integrantes.forEach((v, k) => {
                if (v == ws) {
                    sala.integrantes.delete(k)
                    sala.integrantes.forEach((socket) => {
                        let res: any = {
                            "action": "newMember",
                            "integrantes": Array.from(sala.integrantes.keys()),
                        }
                        socket.send(JSON.stringify(res))
                    })
                }
            })
        })
    })

});

//Iniciar el Servidor
server.listen(process.env.PORT || 8999, () => {
    console.log(`Servidor esta escuchando en el puerto ${(server.address() as WebSocket.AddressInfo).port} :)`);
});

function encontrarSala(id: number) {

    for (let s of listaSalas) {
        if (s.id == id) {
            return true
        }
    }
    return false
}

function drawUpdate(update: Array<[number, number, number, number, string, number]>, context: CanvasRenderingContext2D) {
    for (let list of update) {
        context.beginPath();
        context.moveTo(list[0], list[1]);
        context.lineTo(list[2], list[3]);
        context.strokeStyle = list[4]
        context.lineWidth = list[5]
        context.stroke();
    }
}