import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  formulario:FormGroup

  constructor(private fb:FormBuilder,private http:HttpClient){

  }

  ngOnInit(){
    this.crearFormulario();
  }

  enviarRegistro(){
    
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
