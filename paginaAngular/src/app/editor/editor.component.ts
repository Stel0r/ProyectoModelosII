import { ThisReceiver } from '@angular/compiler';
import { Component, Input, ViewChild, ElementRef, HostListener, Directive } from '@angular/core';
import { MonoTypeOperatorFunction, fromEvent } from 'rxjs';
import { Storage, StorageReference, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { doc, updateDoc, getFirestore, Firestore, DocumentReference, addDoc, setDoc, or } from '@angular/fire/firestore';
import { UsuarioService } from '../Servicios/Usuarios/usuario.service';
import { FirebaseService } from '../Servicios/Firebase/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @ViewChild('myCanvas', { static: true }) canvas: ElementRef;

  context: CanvasRenderingContext2D
  drawing: boolean
  lastX: number
  lastY: number
  canvass: HTMLCanvasElement
  canvasBackup: Array<string> = new Array<string>
  canvasState: string = ""

  //variables de conexion al servidor
  //donde [x1,y2,x2,y2]
  lastStrokes: Array<[number, number,number,number,string,number]> = []
  ws: WebSocket
  idSala: number
  haySala: boolean = false;
  integrantes: Array<string> = []
  esOwner: boolean = false
  canvasCompartido: string


  //variables del editor
  tool: string = "pencil"
  lineWPincel: number = 5;
  lineWEraser: number = 10;
  lineColor: string = '#000000'
  name: string
  firestore: Firestore
  cargando: boolean = true;
  puedeGuardar:boolean = true;

  constructor(private usuarioService: UsuarioService, private firebaseService: FirebaseService, private activatedRoute: ActivatedRoute, private router: Router) {
  }


  ngOnInit() {
    if (!this.usuarioService.hayUsuarioLogeado()) {
      this.router.navigate(['/'])
    }
    this.activatedRoute.params.subscribe((params) => {
      if (params['name']) {
        this.name = params['name']
        this.puedeGuardar = true
      } else if (params['id']) {
        this.haySala = true;
        this.esOwner = false;
        this.idSala = params["id"]
        this.puedeGuardar = false
      }
    })
  }


  ngOnDestroy(){
    if(this.ws){
      this.ws.close()
    }
  }

  ngAfterViewInit() {
    this.firestore = getFirestore();
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.canvass = canvasEl;
    this.context = canvasEl.getContext('2d')!;
    canvasEl.width = 1920;
    canvasEl.height = 1080;
    if (!this.haySala) {
      if (this.usuarioService.existeBoceto(this.name)) {
        let img = new Image
        let can = this.canvass
        let ctx = can.getContext('2d')!
        let source = this.usuarioService.bocetos.get(this.name)?.get('dataURL')!;
        ctx.clearRect(0, 0, this.canvass.width, this.canvass.height)
        img.onload = function () {
          ctx.drawImage(img, 0, 0);
        };
        img.src = source
      } else {
        this.context.fillStyle = "white"
        this.context.fillRect(0, 0, canvasEl.width, canvasEl.height)
      }
    } else {
      this.ws = new WebSocket("ws://localhost:8999")
      this.ws.onopen = () => {
        let message: any = {
          "action": "connect",
          "user": this.usuarioService.UsuarioLogeado,
          "idsala": this.idSala
        }
        this.ws.send(JSON.stringify(<JSON>message))
      }
      this.ws.onmessage = (event) => {
        let response = JSON.parse(event.data)
        //solicitar conexion a sala
        if (response["action"] == "connect") {
          if (response["res"] == "success") {
            this.canvasCompartido = response["canvasUrl"]
            let img = new Image
            let can = this.canvass
            let ctx = can.getContext('2d')!
            ctx.clearRect(0, 0, this.canvass.width, this.canvass.height)
            img.onload = function () {
              console.log("dibujando")
              ctx.drawImage(img, 0, 0);
            };
            console.log(this.canvasCompartido)
            img.src = this.canvasCompartido
            this.integrantes = response["integrantes"] as Array<string>
            console.log(this.integrantes)
          }
        }else if(response["action"] == "stroke"){
          console.log("stroke received")
          console.log(response["data"])
          this.drawUpdate(response["data"] as Array<[number,number,number,number,string,number]>)
        }else if(response["action"] == "newMember"){
          this.integrantes = response["integrantes"] as Array<string>
        }
      }

    }

    this.context.lineWidth = this.lineWPincel;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = this.lineColor;





    canvasEl.addEventListener('mousedown', (e: MouseEvent) => {
      this.drawing = true;
      if (this.canvasState === "") {
        console.log("primer contacto")
        this.canvasState = this.canvass.toDataURL()
      }
      this.lastX = e.clientX - canvasEl.offsetLeft;
      this.lastY = e.clientY - canvasEl.offsetTop;
      this.draw(this.translatedX(this.lastX), this.translatedY(this.lastY), this.translatedX(e.clientX - canvasEl.offsetLeft), this.translatedY(e.clientY - canvasEl.offsetTop));
    });

    canvasEl.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.drawing) {
        this.draw(this.translatedX(this.lastX), this.translatedY(this.lastY), this.translatedX(e.clientX - canvasEl.offsetLeft), this.translatedY(e.clientY - canvasEl.offsetTop));
        
        this.lastX = e.clientX - canvasEl.offsetLeft;
        this.lastY = e.clientY - canvasEl.offsetTop;
      }
    });

    canvasEl.addEventListener('mouseup', () => {
      this.drawing = false
      let c = this.canvass.toDataURL();
      this.canvasBackup.push(this.canvasState);
      this.canvasState = c;
      if(this.haySala){
        let msg:any ={
          "action":"stroke",
          "user":this.usuarioService.UsuarioLogeado,
          "data": this.lastStrokes,
          "idsala":this.idSala
        } 
        this.ws.send(JSON.stringify(<JSON>msg))
        this.drawUpdate(this.lastStrokes)
        this.lastStrokes.splice(0)
      }
    });

    canvasEl.addEventListener('mouseleave', () => {
      this.drawing = false;
      let c = this.canvass.toDataURL();
      this.canvasBackup.push(this.canvasState);
      this.canvasState = c;
    });

    setTimeout(() => { this.cargando = false }, 2000)
  }


  translatedX(x: number) {
    var rect = this.canvass.getBoundingClientRect();
    var factor = this.canvass.width / rect.width;
    return factor * (x);
  }

  translatedY(y: number) {
    var rect = this.canvass.getBoundingClientRect();
    var factor = (this.canvass.height / rect.height);
    return factor * (y);
  }

  draw(x1: number, y1: number, x2: number, y2: number) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    if(this.tool == 'pencil'){
      this.context.lineWidth = this.lineWPincel
      this.context.strokeStyle = this.lineColor
    }else if(this.tool == 'eraser'){
      this.context.lineWidth = this.lineWEraser
      this.context.strokeStyle = "#ffffff"
    }
    this.context.stroke();
    if(this.haySala){
      if(this.tool == 'pencil'){
        this.lastStrokes.push([x1,y1,x2,y2,this.lineColor,this.lineWPincel])
      }else if(this.tool == 'eraser'){
        this.lastStrokes.push([x1,y1,x2,y2,"#ffffff",this.lineWEraser])
      }
      
    }
  }

  drawUpdate(update: Array<[number,number,number,number,string,number]>) {
    for (let list of update){
      this.context.beginPath();
      this.context.moveTo(list[0], list[1]);
      this.context.lineTo(list[2], list[3]);
      this.context.strokeStyle = list[4]
      this.context.lineWidth = list[5]
      this.context.stroke();
    }
  }

  cambiarColor() {
    this.context.strokeStyle = this.lineColor;
  }

  subirTamanoPincel() {
    this.lineWPincel++
    this.context.lineWidth = this.lineWPincel
  }

  bajarTamanoPincel() {
    this.lineWPincel--
    this.context.lineWidth = this.lineWPincel
  }

  subirTamanoEraser() {
    this.lineWEraser++
    this.context.lineWidth = this.lineWEraser
  }

  bajarTamanoEraser() {
    this.lineWEraser--
    this.context.lineWidth = this.lineWEraser
  }

  revisarHerramienta(herr: string) {
    return herr == this.tool
  }

  cambiarHerramienta(herr: string) {
    this.tool = herr
    if (herr == 'pencil') {
      this.context.strokeStyle = this.lineColor
      this.context.lineWidth = this.lineWPincel
    } else if (herr == 'eraser') {
      this.context.strokeStyle = '#ffffff'
      this.context.lineWidth = this.lineWEraser
    }
  }

  undo() {
    let c = this.canvasBackup.pop()
    console.log(c)
    if (c != undefined) {
      let img = new Image
      let ctx = this.canvass.getContext('2d')!
      this.canvasState = c
      ctx.clearRect(0, 0, this.canvass.width, this.canvass.height)
      img.onload = function () {
        ctx.drawImage(img, 0, 0); // Or at whatever offset you like
      };
      img.src = c;
    }
  }

  guardarCambios() {
    this.cargando = true;
    new Promise((resolve, reject) => {
      this.canvass.toBlob(async (blob) => {
        if (blob) {
          await this.firebaseService.guardarCambios(blob, this.name, this.usuarioService.UsuarioLogeado, this.canvasState)
          resolve(true)
        }
      })
    }).then((result) => [
      this.cargando = false
    ])
  }

  abrirSala() {
    this.ws = new WebSocket("ws://localhost:8999")
    this.ws.onopen = () => {
      let openRequest: any = {
        "action": "open",
        "user": this.usuarioService.UsuarioLogeado,
        "canvasUrl": this.canvass.toDataURL()
      }
      this.cargando = true;
      this.ws.send(JSON.stringify(<JSON>openRequest))
    }
    this.ws.onmessage = (event: MessageEvent) => {
      let response = JSON.parse(event.data)
      //abrir sala
      console.log(response["res"])
      if (response["action"] == "open") {
        console.log("detecto action open")
        if (response["res"] == "success") {
          console.log("abriendo sala")
          this.idSala = response["code"]
          this.integrantes = response["integrantes"] as Array<string>
          console.log(this.integrantes)
          this.haySala = true;
          this.esOwner = true;
          this.cargando = false;
          console.log("se ha iniciado la sesion usando el id " + this.idSala)
          this.empezarSala()
        }
      }else if(response["action"] == "stroke"){
        console.log("stroke received")
        console.log(response["data"])
        this.drawUpdate(response["data"] as Array<[number,number,number,number,string,number]>)
      }else if(response["action"] == "newMember"){
        this.integrantes = response["integrantes"] as Array<string>
      }
    }
  }

  empezarSala() {

  }
}
