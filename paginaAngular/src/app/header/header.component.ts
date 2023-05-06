import { Component } from '@angular/core';
import { UsuarioService } from '../Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(public usuarioService:UsuarioService){
  }
  
}
