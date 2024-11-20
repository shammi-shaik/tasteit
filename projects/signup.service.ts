import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private signupurl ='http://127.0.0.1:5000/signup_api/signup'
  private geturl ='http://127.0.0.1:5000/getuser_api/getuser'
  private getlisturl ='http://127.0.0.1:5000/listusers'


  constructor(private http:HttpClient) { }

  signUp(userData:any):Observable<any>{
    const headers = new HttpHeaders({
      'Content-Type':'application/json'
    })
    return this.http.post(this.signupurl,userData,{headers})
  }

  getUser():Observable<any>{
    const token = localStorage.getItem('access_token');
    console.log(token)
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get(this.geturl,{headers})
  }
  
  getlistUser():Observable<any>{
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get(this.getlisturl,{headers})
  }
}
