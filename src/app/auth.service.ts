// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError, throttleTime } from 'rxjs/operators';
import { BASE_URL } from './base_url';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrlLogin = `${BASE_URL}/userlogin`;  // Login API
  private apiUrlSignup = `${BASE_URL}/usersignup`;  // Signup API

  constructor(private http: HttpClient, private router: Router) { }

  // Login  
  login(contact: string, password: string): Observable<any> {

     const payload = {
      email: this.isEmail(contact) ? contact : null,
      phone_number: this.isPhoneNumber(contact) ? contact : null,
      user_pwd: password
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(this.apiUrlLogin, payload, {headers,observe:'response'})
      .pipe(
        tap((response) => {
          console.log(response.body.message)
          if (response.body.access_token) {
            localStorage.setItem('access_token', response.body.access_token);  // Store JWT token
            localStorage.setItem('userRole', response.body.role);  // Store user role
          }
        })
      );
  }

    // Helper functions to identify email or phone number format
  private isEmail(contact: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(contact);
  }

  private isPhoneNumber(contact: string): boolean {
    const phonePattern = /^\d{10}$/; // Adjust pattern as per requirements
    return phonePattern.test(contact);
  }

  // Signup function
  signup(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrlSignup, userData)
      .pipe(catchError(this.handleError<any>('signup', {})));
  }

  // Logout function
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);  // Redirect to login after logout
  }

  // Helper to check login status
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
  

  // Helper to get the user's role
  get userRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // Error handler function
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
  
  sendOtp(email: any): Observable<any> {
    return this.http.post(`${BASE_URL}/send-otp`, email);
  }
 
  // Verify OTP endpoint
  verifyOtp(data: any): Observable<any> {
    console.log(data)
    return this.http.post(`${BASE_URL}/verify-otp`, data);
  }
 
  // Reset Password endpoint
  resetPassword(data: any): Observable<any> {
    console.log(data)
    return this.http.post(`${BASE_URL}/reset-password`, data);
  }
  



}
