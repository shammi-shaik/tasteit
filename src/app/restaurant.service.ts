// restaurant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from './base_url';
import { matBottomSheetAnimations } from '@angular/material/bottom-sheet';


@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  restaurant:any

  private apiUrl = `${BASE_URL}/listrestaurant`;

  constructor(private http: HttpClient) {}

  // Method to fetch the list of restaurants
  getRestaurants(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Method to fetch a specific restaurant by ID
  getRestaurantById(restaurantId: string): Observable<any> {
    const restaurantUrl = `${BASE_URL}/restaurant/${restaurantId}`; // Update this URL according to your API endpoint
    return this.http.get<any>(restaurantUrl);
  }

  // restaurant.service.ts
  updateRestaurantStatus(restaurantId: string, status: string): Observable<any> {
    const statusUpdateUrl = `${BASE_URL}/updaterestaurant`; // URL without restaurantId in the path
    return this.http.put<any>(statusUpdateUrl, { 
        restaurant_id: restaurantId, // Include restaurant_id in the request body
        status_name: status           // Include status_name in the request body
    });
    }
    getMyRestaurant():Observable<any>{
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.get<any>(`${BASE_URL}/getrestaurant`,{headers})
    }

    deleteRestaurant(restaurantId:string):Observable<any>{
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      const body = { restaurant_id: restaurantId };
      return this.http.delete<any>(`${BASE_URL}/deleterestaurant`,{headers,body})
    }



  }
    