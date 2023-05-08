import { Component } from '@angular/core';
import { UsuarioService } from '../Servicios/Usuarios/usuario.service';
import { Router } from '@angular/router';
import { DocumentData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { FirebaseService } from '../Servicios/Firebase/firebase.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  activeItem:number = 0;
  bocetos:Map<string,Map<string,string>>
  noSelection : boolean = true;
  nuevoError:string;
  nuevoErrorB:boolean = false
  usuario:string;
  cargando:boolean = true;
  constructor(private usuarioServicio: UsuarioService,private router:Router){
  }



  ngOnInit(){
    if(!this.usuarioServicio.hayUsuarioLogeado()){
      this.router.navigate(['/'])
    }else{
      this.usuarioServicio.obtenerBocetos().then((result)=>{
        this.cargando = false;
        this.bocetos = result
      }
      )
    }
    this.usuario = this.usuarioServicio.UsuarioLogeado
  }


  changeItem(i:number){
    let active = document.querySelector('.bocetos > button:nth-of-type('+this.activeItem+')')?.classList.remove('active')
    let n = document.querySelector('.bocetos > button:nth-of-type('+i+')')!
    n.classList.add('active')
    document.getElementById('preview')?.setAttribute('src',this.bocetos.get(n.innerHTML)?.get('img')!)
    this.noSelection = false;
    this.activeItem = i
  }

  crearBoceto(){
    this.nuevoErrorB = false;
    let input : HTMLInputElement = document.getElementById("nombreNuevoBoceto")! as HTMLInputElement
    let value = input.value!
    value = value.trim()
    value = value.replace(/\s/g,'-')
    console.log(value)
    if (value === ''){
      this.nuevoErrorB = true;
      this.nuevoError = 'introduce un nombre para el nuevo boceto'
    }else if(this.usuarioServicio.existeBoceto(value)){
      this.nuevoErrorB = true;
      this.nuevoError = 'Este nombre ya lo usaste, escoge otro'
    }else{
      this.router.navigate(['/editor',value])
    }
  }

  abrirBoceto(){
    let n = document.querySelector('.bocetos > button:nth-of-type('+this.activeItem+')')!
    this.router.navigate(['/editor',n.innerHTML])
  }

  eliminarBoceto(){
    this.cargando = true
    let n = document.querySelector('.bocetos > button:nth-of-type('+this.activeItem+')')!
    this.usuarioServicio.eliminarBoceto(n.innerHTML).then((response)=>{
      if(response === 1){
        document.getElementById('preview')?.setAttribute('src',"https://img.wattpad.com/804c8738be736f9967303107b2e70ae6938dfd18/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f4b336e744647353044724b4c56513d3d2d3133352e313537316565386535366237353137303839363736353935303134322e6a7067?s=fit&w=720&h=720")
        this.bocetos.delete(n.innerHTML)
        this.activeItem = 0
        this.noSelection = true
        this.cargando = false
      }
    })
    
  }
}
