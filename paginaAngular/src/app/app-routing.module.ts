import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegistroComponent } from './registro/registro.component';
import { InicioComponent } from './inicio/inicio.component';
import { EditorComponent } from './editor/editor.component';

const routes: Routes = [
  {
    path:'', component:LoginComponentComponent
  },
  {
    path:'registro', component:RegistroComponent
  },
  {
    path:'inicio', component:InicioComponent
  },
  {
    path:'editor', component:EditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
