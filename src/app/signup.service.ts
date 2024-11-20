import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BASE_URL } from './base_url'; // Import the BASE_URL

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private signupUrl = `${BASE_URL}/usersignup`;  
  private signupsellerUrl = `${BASE_URL}/postrestaurant`

  constructor(private http: HttpClient) {}

  // Method to handle the signup process
  signupUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.signupUrl, userData, { headers })
  }


  // Method to handle the restaurant signup process
  signuprestaurant(registrationData: any): Observable<any> {
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json'
    });

    return this.http.post(this.signupsellerUrl, registrationData, { headers }).pipe(
      catchError((error) => {
        console.error('Error during signup:', error);
        return throwError(() => new Error('Signup failed. Please try again.'));
      })
    );
  }
}
