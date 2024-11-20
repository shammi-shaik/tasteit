import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { ForgotComponent } from './forgot/forgot.component';

const routes: Routes = [
  {path:'signup',component:SignupComponent},
  {path:'forgot',component:ForgotComponent},
  { path: '', redirectTo: 'signup', pathMatch: 'full' }, // Redirect to signup by default
  { path: '**', redirectTo: 'signup' } // Fallback for undefined routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
