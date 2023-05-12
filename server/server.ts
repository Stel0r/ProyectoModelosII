import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

class Sala{
    id:number
    owner:string
    canvas:string
    lastUpdate:number
    integrantes: Array<string> = []
    updateList:Array<[number,number,number]> = []
}

let listaSalas : Array<Sala> = new Array<Sala>()

wss.on('connection', (ws: WebSocket) => {

    console.log("connection created")

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
        let response = JSON.parse(message.toString())
        //al abrir una sala
        if(response["action"] == "open"){
            let sala = new Sala()
            sala.id = listaSalas.length
            sala.owner = response["user"]
            sala.canvas = response["canvasUrl"]
            sala.integrantes.push(sala.owner)
            listaSalas.push(sala)
            let message : any = {
                "action":"open",
                "res": "success",
                "code": sala.id
                
            }
            ws.send(JSON.stringify(message))
        }
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as WebSocket.AddressInfo).port} :)`);
});