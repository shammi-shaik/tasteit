import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPwdComponent } from './forgot-pwd/forgot-pwd.component';
import { HomeComponent } from './home/home.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { BasketComponent } from './basket/basket.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AboutComponent } from './about/about.component';
import { LogoutComponent } from './logout/logout.component';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { DishesComponent } from './dishes/dishes.component';
import { ReviewRatingsComponent } from './review-ratings/review-ratings.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { AdminDashComponent } from './admin-dash/admin-dash.component';
import { SellerOrdersComponent } from './seller-orders/seller-orders.component';


const routes: Routes = [
  { path : 'login',         component: LoginComponent,canActivate:[ ] },
  { path : 'signup',        component: SignupComponent },
  { path : 'forgot-pwd',    component: ForgotPwdComponent },
  { path : 'seller' ,       component:SellerDashboardComponent , canActivate: [AuthGuard],   data: { role: 'seller' }},
  { path : 'home',          component: HomeComponent ,canActivate: [AuthGuard]},
  { path : 'restaurants',   component: HomeComponent,canActivate: [AuthGuard]},
  { path : 'dishes/:id/:name',component: DishesComponent,canActivate: [AuthGuard]},
  { path : 'basket' ,       component : BasketComponent,canActivate: [AuthGuard]},
  { path : 'my-orders' ,    component : MyOrdersComponent,canActivate: [AuthGuard]},
  { path : 'favorites',     component : FavoritesComponent,canActivate: [AuthGuard]},
  { path : 'seller-dashboard',component:SellerDashboardComponent,canActivate: [AuthGuard]},
  { path : 'about' ,        component : AboutComponent,canActivate: [AuthGuard]},
  { path : 'logout' ,       component : LoginComponent,canActivate: [AuthGuard]},
  { path :  'review-ratings',component : ReviewRatingsComponent,canActivate: [AuthGuard]},
  { path :  'profile',       component:ProfileComponent,canActivate: [AuthGuard]},
  { path :  'seller-orders', component:SellerOrdersComponent},
  { path :  'Admin',        component:AdminDashComponent},
  { path : '', redirectTo: '/login', pathMatch: 'full' },
  { path : '**', redirectTo: '/login' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthService],

})
export class AppRoutingModule { }
