import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogResponse } from '../Modelos/Response';


@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent {

  formulario: FormGroup;
  error:boolean = false;
  mensajeError:string;

  constructor(private http : HttpClient,private  fb:FormBuilder){

  }

  ngOnInit(){
    this.crearFormulario();
  }
  revisarLogIn(){
    this.http.post<LogResponse>("http://127.0.0.1:8000/validate",this.formulario.value).subscribe((res:LogResponse)=> {
      this.error = false;
      console.log(res.codigo);
      if(res.codigo ==404){
        this.error = true
        this.mensajeError = res.message
      }
    })
  }

  crearFormulario(){
    this.formulario = this.fb.group({
      correo:['', Validators.compose([Validators.required,Validators.email])],
      password:['',Validators.required]
    })
  }

}
