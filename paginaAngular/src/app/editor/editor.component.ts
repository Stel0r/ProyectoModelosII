import { ThisReceiver } from '@angular/compiler';
import { Component, Input, ViewChild, ElementRef, HostListener, Directive } from '@angular/core';
import { MonoTypeOperatorFunction, fromEvent } from 'rxjs';
import { Storage, StorageReference, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { doc, updateDoc, getFirestore, Firestore, DocumentReference, addDoc, setDoc } from '@angular/fire/firestore';
import { UsuarioService } from '../Servicios/Usuarios/usuario.service';
import { FirebaseService } from '../Servicios/Firebase/firebase.service';


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
  canvasState: string = ''

  //variables del editor
  tool: string = "pencil"
  lineWPincel: number = 5;
  lineWEraser: number = 10;
  lineColor: string = '#000000'
  name: string = 'boceto2'
  firestore: Firestore

  constructor(private storage: Storage, private usuarioService: UsuarioService,private firebaseService:FirebaseService) {

  }

  ngAfterViewInit() {
    this.firestore = getFirestore();
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.canvass = canvasEl;
    console.log(this.canvas)
    this.context = canvasEl.getContext('2d')!;
    this.canvasState = canvasEl.toDataURL();

    canvasEl.width = 1920;
    canvasEl.height = 1080;

    this.context.fillStyle = "white"
    this.context.fillRect(0,0,canvasEl.width,canvasEl.height)

    this.context.lineWidth = this.lineWPincel;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = this.lineColor;

    canvasEl.addEventListener('mousedown', (e: MouseEvent) => {
      this.drawing = true;
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

    });

    canvasEl.addEventListener('mouseleave', () => {
      this.drawing = false;
    });
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
    this.context.stroke();
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
    this.canvass.toBlob((blob) =>{
      if(blob){
        this.firebaseService.guardarCambios(blob,this.name)
      }
    })

  }
}
