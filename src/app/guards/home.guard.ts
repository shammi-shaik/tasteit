import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RoleService } from '../role.service';
import { TokenService } from '../token.service';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private roleService: RoleService,
    private router: Router
  ) {}
  canActivate(){
    // Get expected role from route
    const userRole = this.roleService.getUserRole();  // Get current user role
    // Check if the user has a valid token
    if (!this.tokenService.hasToken()) {// Redirect to login if not authenticated
      return true; 
    }
    else{
      if (userRole === 'seller') {
        this.router.navigate(['/seller']); // Navigate to seller component
      } else if (userRole === 'customer') {
        this.router.navigate(['/home']); // Navigate to home component
      } else if (userRole === 'Admin') {
        this.router.navigate(['/Admin']); // Navigate to Admin component
      }
    return false
    }
    }
  
}
