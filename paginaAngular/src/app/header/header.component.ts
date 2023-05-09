import { Component } from '@angular/core';
import { UsuarioService } from '../Servicios/Usuarios/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(public usuarioService:UsuarioService,private router:Router){
  }

  hayUser(){
    return this.usuarioService.hayUsuarioLogeado()
  }
  

  desloguear(){
    this.usuarioService.desloguear()
    this.router.navigate(["/"])
  }
}
