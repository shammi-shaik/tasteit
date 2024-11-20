// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoleService } from '../role.service';
import { TokenService } from '../token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private roleService: RoleService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];  // Get expected role from route
    const userRole = this.roleService.getUserRole();  // Get current user role

    // Check if the user has a valid token
    if (!this.tokenService.hasToken()) {
      this.router.navigate(['/login']);  // Redirect to login if not authenticated
      return false;
    }

    // If a role is expected, check if the user's role matches the expected role
    if (expectedRole && userRole !== expectedRole) {
      this.router.navigate(['/unauthorized']);  // Redirect to an unauthorized page or wherever you handle unauthorized access
      return false;
    }

    return true;  // User is authenticated and authorized
  }
}
