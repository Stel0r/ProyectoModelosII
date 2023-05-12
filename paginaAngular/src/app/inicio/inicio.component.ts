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
    document.querySelector('.bocetos > button:nth-of-type('+this.activeItem+')')?.classList.remove('active')
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
    }else if(value.length > 20){
      this.nuevoErrorB = true;
      this.nuevoError = 'El nombre tiene un maximo de 20 caracteres'
    }
    else{
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
        document.getElementById('preview')?.setAttribute('src',"assets/img/placeholder.jpg")
        this.bocetos.delete(n.innerHTML)
        this.activeItem = 0
        this.noSelection = true
        this.cargando = false
      }
    })
    
  }

  conectarSala(){
    
  }
}
