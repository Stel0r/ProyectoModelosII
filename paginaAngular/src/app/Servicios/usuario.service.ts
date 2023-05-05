import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  UsuarioLogeado:string = "diego.felipe.gamez@gmail.com"
  constructor() { }

  hayUsuarioLogeado(){
    if(this.UsuarioLogeado != ""){
      return true
    }
    return false
  }

}
