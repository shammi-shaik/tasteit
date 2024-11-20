// role.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // Get the user role from localStorage
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // Set the user role in localStorage
  setUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  // Remove the user role
  removeUserRole(): void {
    localStorage.removeItem('userRole');
  }
}
