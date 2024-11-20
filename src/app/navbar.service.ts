// navbar.service.ts
import { Injectable } from '@angular/core';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  constructor(private roleService: RoleService) {}

  // Check the current user role for navbar display
  getUserRole(): string | null {
    return this.roleService.getUserRole();  // Retrieve role from RoleService
  }

  // Handle logout and reset
  logout(): void {
    this.roleService.removeUserRole();  // Clear role information
    localStorage.removeItem('access_token');
  }
}
