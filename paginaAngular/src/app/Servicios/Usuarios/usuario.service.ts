import { Injectable } from '@angular/core';
import { FirebaseService } from '../Firebase/firebase.service';
import { DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  UsuarioLogeado:string = ""
  bocetos:Map<string,Map<string,string>>
  constructor(private firebase:FirebaseService) { }

  hayUsuarioLogeado(){
    if(this.UsuarioLogeado != ""){
      return true
    }
    return false
  }


  async LogearUsuario(user:string){
    this.UsuarioLogeado = user
    return "completado"
  }

  existeBoceto(nombre:string){
    return this.bocetos.has(nombre)
  }

  async obtenerBocetos(){
    this.bocetos = await this.firebase.recuperarBocetos(this.UsuarioLogeado)
    return this.bocetos;
  }

}
