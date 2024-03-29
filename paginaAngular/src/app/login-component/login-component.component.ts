import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogResponse } from '../Modelos/Response';
import { Router } from '@angular/router';
import { UsuarioService } from '../Servicios/Usuarios/usuario.service';
import { interval } from 'rxjs';


@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent {

  formulario: FormGroup;
  hayError:boolean = false;
  mensajeError:string;
  responseCode:number;
  bocetos:Map<string,Map<string,string>>;

  constructor(private http : HttpClient,private  fb:FormBuilder, private router:Router, private usarioServicio:UsuarioService){

  }

  ngOnInit(){
    if(this.usarioServicio.hayUsuarioLogeado()){
      this.router.navigate(['/inicio'])
    }
    this.crearFormulario();
    this.bocetos = this.usarioServicio.bocetos
  }
  revisarLogIn(){
    this.hayError = false;
    this.http.post<LogResponse>("http://127.0.0.1:8000/validate",this.formulario.value).subscribe(
      {
        next: res => this.completarLogIn(res.codigo,res.message),
        error: err => this.completarLogIn(404,"Hubo un Error con el servidor, Intentalo nuevamente")
      })
  }

  async completarLogIn(code:number,message:string){
    this.responseCode = code
    this.mensajeError = message
    if(this.responseCode ==404){
      this.hayError = true
    }else{
      console.log(this.formulario.controls['correo'].value)
      this.usarioServicio.LogearUsuario(this.formulario.controls['correo'].value).then((value:any)=>{
        this.router.navigate(['/inicio'])
      })
      
    }
  }



  crearFormulario(){
    this.formulario = this.fb.group({
      correo:['', Validators.compose([Validators.required,Validators.email])],
      password:['',Validators.required]
    })
  }

}
function next(value: LogResponse): void {
  throw new Error('Function not implemented.');
}

