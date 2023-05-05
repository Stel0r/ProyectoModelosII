import { Component, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MonoTypeOperatorFunction, fromEvent } from 'rxjs';
import { map, tap, switchMap, takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @ViewChild('myCanvas', {static: true}) canvas: ElementRef;

  context:CanvasRenderingContext2D
  drawing:boolean
  lastX:number
  lastY:number
  canvass:HTMLCanvasElement

  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.canvass = canvasEl;
    console.log(this.canvas)
    this.context = canvasEl.getContext('2d')!;
  
    if(window.innerWidth < 1300){
      canvasEl.width = 720;
    canvasEl.height = 405;
    }else{
      canvasEl.width = 1040;
      canvasEl.height = 585;
    }
    this.context.lineWidth = 5;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000000';
  
    canvasEl.addEventListener('mousedown', (e: MouseEvent) => {
      this.drawing = true;
      this.lastX = e.clientX - canvasEl.offsetLeft;
      this.lastY = e.clientY - canvasEl.offsetTop;
    });
  
    canvasEl.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.drawing) {
        this.draw(this.lastX, this.lastY, e.clientX - canvasEl.offsetLeft, e.clientY - canvasEl.offsetTop);
        this.lastX = e.clientX - canvasEl.offsetLeft;
        this.lastY = e.clientY - canvasEl.offsetTop;
      }
    });
  
    canvasEl.addEventListener('mouseup', () => {
      this.drawing = false;
    });
  
    canvasEl.addEventListener('mouseleave', () => {
      this.drawing = false;
    });
  }


  draw(x1:number, y1:number, x2:number, y2:number) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }
  
}
