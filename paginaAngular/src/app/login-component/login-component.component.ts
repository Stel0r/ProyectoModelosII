import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent {

  formulario: FormGroup;

  constructor(private http : HttpClient,private  fb:FormBuilder){

  }

  ngOnInit(){
    this.crearFormulario();
  }
  revisarLogIn(){
    this.http.post("http://127.0.0.1:8000/validate",this.formulario.value).subscribe((res)=> {
      console.log(res)
    })
  }

  crearFormulario(){
    this.formulario = this.fb.group({
      correo:['', Validators.compose([Validators.required,Validators.email])],
      password:['',Validators.required]
    })
  }

}
