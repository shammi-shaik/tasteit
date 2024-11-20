import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  // base-url.ts
BASE_URL = 'http://127.0.0.1:5000';

  

  private apiUrlLogin = `http://127.0.0.1:5000/loginuser/login`;  // Login API

  constructor(private http: HttpClient) { }

  
  // Login  
  login(userData: any): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(this.apiUrlLogin ,userData, {headers,observe:'response'})
      .pipe(
        tap((response:any) => {
          console.log(response.body.message)
          if (response.body.access_token) {
            localStorage.setItem('access_token', response.body.access_token);  // Store JWT token
            // localStorage.setItem('userRole', response.body.role);  // Store user role
          }
        })
      );
  }  


  sendOtp(email: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/send-otp`, email);
  }
 
  // Verify OTP endpoint
  verifyOtp(data: any): Observable<any> {
    console.log(data)
    return this.http.post(`${this.BASE_URL}/verify-otp`, data);
  }
 
  // Reset Password endpoint
  resetPassword(data: any): Observable<any> {
    console.log(data)
    return this.http.post(`${this.BASE_URL}/reset-password`, data);
  }
  



}
