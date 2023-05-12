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
    integrantes: Map<string,WebSocket> = new Map()
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
        //al buscar una sala
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
        //al conectarse a una sala
        }else if(response["action"] == "connect"){
            listaSalas[response["idsala"]].integrantes.set(response["user"],ws)
            let msg:any =
            {
                "action":"connect",
                "res":"success",
                "canvasUrl": listaSalas[response["idsala"]].canvas
            }
            ws.send(JSON.stringify(msg))
        //al enviar un trazo
        }else if(response["action"] == "stroke"){
            
        }
    });

});

//Iniciar el Servidor
server.listen(process.env.PORT || 8999, () => {
    console.log(`Servidor esta escuchando en el puerto ${(server.address() as WebSocket.AddressInfo).port} :)`);
});

function encontrarSala(id:number){

    for (let s of listaSalas){
        if(s.id == id){
            return true
        }
    }
    return false
}