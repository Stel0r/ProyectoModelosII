import { Component } from '@angular/core';
import { UsuarioService } from '../Servicios/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  activeItem:number = 1;

  constructor(private usuarioServicio: UsuarioService,private router:Router){
    
  }
  ngOnInit(){
    if(!this.usuarioServicio.hayUsuarioLogeado()){
      this.router.navigate(['/'])
    }
  }

  changeItem(i:number){
    let active = document.querySelector('.bocetos > button:nth-of-type('+this.activeItem+')')?.classList.remove('active')
    let n = document.querySelector('.bocetos > button:nth-of-type('+i+')')?.classList.add('active')
    this.activeItem = i
  }

  usuario:string = this.usuarioServicio.UsuarioLogeado

}
