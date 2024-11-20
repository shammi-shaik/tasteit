// token.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {  
  // Get the access token from localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Set the access token to localStorage
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // Remove the access token
  removeToken(): void {
    localStorage.removeItem('access_token');
  }

  // Check if the token exists
  hasToken(): boolean {
    return !!this.getToken();
  }
}
