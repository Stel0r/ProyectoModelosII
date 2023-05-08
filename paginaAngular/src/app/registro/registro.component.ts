import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogResponse } from '../Modelos/Response';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  formulario:FormGroup
  mensaje:string = "esto es un mensaje de prueba"
  exito:boolean = false
  error:boolean = false

  constructor(private fb:FormBuilder,private http:HttpClient){

  }

  ngOnInit(){
    this.crearFormulario();
  }

  enviarRegistro(){
    this.http.post<LogResponse>("http://127.0.0.1:8000/register",this.formulario.value).subscribe(
      {
        next: res => this.mostrarMensaje(res.codigo,res.message),
        error: err => this.mostrarMensaje(404,"Hubo un Error con el servidor, Intentalo nuevamente")
      })
  }

  mostrarMensaje(code:number,message:string){
    console.log(message)
    this.exito = false
    this.error = false
    this.mensaje = message
    if (code === 404){
      this.error = true
    }else{
      this.exito = true
    }
  }

  crearFormulario(){
    this.formulario = this.fb.group({
      correo:['', Validators.compose([Validators.required,Validators.email])],
      password:['',Validators.required],
      nombre:['',Validators.required],
      apellido:['',Validators.required],
      documento:['',Validators.required],
      direccion:['',Validators.required]
    })
  }
}
