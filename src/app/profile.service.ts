import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BASE_URL } from './base_url';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private getProfileUrl = `${BASE_URL}/getdetails`;  // Use BASE_URL
  private getProfileList = `${BASE_URL}/listusers`;
  private saveProfileUrl = `${BASE_URL}/updatedetails`;


  constructor(private http: HttpClient) { }


  // Method to get profile details for the user
  getProfile(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.getProfileUrl, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders. Please try again.'));
      })
    );
  }
  
  //Method to  list users in admin 
  getProfileUsers():Observable<any>{
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.getProfileList, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders. Please try again.'));
      })
    );
  }

  // Method to Update profile data 
  saveProfile(profileData:any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(this.saveProfileUrl, profileData,{ headers }).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders. Please try again.'));
      })
    );
  }

}
