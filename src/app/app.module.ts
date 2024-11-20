import { Component, NgModule } from '@angular/core';
import { FormRecord, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule,Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import  {HttpClientModule}  from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPwdComponent } from './forgot-pwd/forgot-pwd.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NavbarService } from './navbar.service';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { BasketComponent } from './basket/basket.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { LogoutComponent } from './logout/logout.component';
import { FooterCustomerComponent } from './footer-customer/footer-customer.component';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { RoleService } from './role.service';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { DishesComponent } from './dishes/dishes.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { BasketBottomSheetComponent } from './basket-bottom-sheet/basket-bottom-sheet.component';
import { ReviewRatingsComponent } from './review-ratings/review-ratings.component';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { AdminDashComponent } from './admin-dash/admin-dash.component';
import { SellerOrdersComponent } from './seller-orders/seller-orders.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ForgotPwdComponent,
    NavbarComponent,
    RestaurantsComponent,
    BasketComponent,
    MyOrdersComponent,
    FavoritesComponent,
    LogoutComponent,
    HomeComponent,
    FooterCustomerComponent,
    SellerDashboardComponent,
    DishesComponent,
    BasketBottomSheetComponent,
    ReviewRatingsComponent,
    ProfileComponent,
    UserComponent,
    AdminDashComponent,
    SellerOrdersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,  // Required for animations
    ToastrModule.forRoot(),    // ToastrModule added
    MatBottomSheetModule,
    MatButtonModule,
    
  ],
  providers: [NavbarService,AuthService,TokenService,RoleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
