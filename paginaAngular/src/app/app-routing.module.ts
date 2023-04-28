import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegistroComponent } from './registro/registro.component';

const routes: Routes = [
  {
    path:'', component:LoginComponentComponent
  },
  {
    path:'registro', component:RegistroComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
