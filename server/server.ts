import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

class User{
    nombre:string
    webSocket:WebSocket
    constructor(n:string,w:WebSocket){
        this.nombre = n
        this.webSocket = w
    }
}

class Sala{
    id:number
    owner:[string,WebSocket]
    canvas:string
    lastUpdate:number
    integrantes: Map<string,WebSocket> = new Map<string,WebSocket>()
    updateList:Array<[number,number,number]> = []
}

let listaSalas : Array<Sala> = []

wss.on('connection', (ws: WebSocket) => {

    console.log("connection created")

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
        console.log("received: "+message)
        let response = JSON.parse(message.toString())
        //al abrir una sala
        if(response["action"] == "open"){
            let sala = new Sala()
            sala.id = listaSalas.length
            sala.owner = [response["user"],ws]
            sala.canvas = response["canvasUrl"]
            sala.integrantes.set(response["user"],ws)
            listaSalas.push(sala)
            let message : any = {
                "action":"open",
                "res": "success",
                "code": sala.id
                
            }
            ws.send(JSON.stringify(message))
        }else if(response["action"] == "exist"){
            let msg:any
            if(encontrarSala(response["idsala"])){
                msg = {
                    "res": "found"
                }
            }else{
                msg = {
                    "res": "not found"
                }
            }
            ws.send(JSON.stringify(msg))
        }else if(response["action"] == "connect"){
            listaSalas[response["idsala"]].integrantes.set(response["user"],ws)
            let msg:any =
            {
                "action":"connect",
                "res":"success",
                "canvasUrl": listaSalas[response["idsala"]].canvas
            }
            ws.send(JSON.stringify(msg))
        }
    });

});

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as WebSocket.AddressInfo).port} :)`);
});

function encontrarSala(id:number){

    for (let s of listaSalas){
        if(s.id == id){
            return true
        }
    }
    return false
}