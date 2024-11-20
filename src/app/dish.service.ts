// dish.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Ensure catchError is imported
import { BASE_URL } from './base_url';


@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = `${BASE_URL}/list_dishes`;
  private basketApiUrl = `${BASE_URL}/post_dish_basket`;
  // private fetchBasketApiUrl = `${BASE_URL}/get_dish_basket`;
  private postDishUrl = `${BASE_URL}/post_dish_details`;
  private  updateDishUrl = `${BASE_URL}/update_dish`;
  private deleteDishUrl = `${BASE_URL}/remove_dish`;

  constructor(private http: HttpClient, private httpClient: HttpClient) {}

  getDishesByRestaurant(restaurantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/dishes?restaurant_id=${restaurantId}`);
  }

  // Add or update a dish in the basket
  updateDishInBasket(basketEntry: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    console.log("Sending data to backend:", basketEntry);
    return this.http.post(this.basketApiUrl, basketEntry, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  // decrease or update a dish in the basket
  decreaseDishInBasket(basketEntry: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const decrementApiUrl = `${this.basketApiUrl}/decrement`;
    console.log("Sending data to backend:", basketEntry);
    return this.http.post(decrementApiUrl, basketEntry, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  // Remove a dish from the basket
  removeDishFromBasket(dishId: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log("Removing dish with ID:", dishId);
    const url = `${BASE_URL}/remove_dish_basket`;
    const body = { dish_id: dishId };

    return this.http.delete(url, { headers, body }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error removing from backend:', error);
        return throwError(() => new Error('Backend error occurred'));
      })
    );
  }

  // Fetch the current basket
  getBasket(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${BASE_URL}/get_dish_basket`, { headers }).pipe(
      tap((response: any) => {
        console.log('Basket data:', response);
        console.log('Request Headers:', headers);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching basket:', error);
        return throwError(() => new Error('Backend error occurred'));
      })
    );
  }

  // Fetch dish details by ID
  getDishById(dishId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${BASE_URL}/get_dish_details?dish_id=${dishId}`;
    console.log(`Fetching details for dish ID: ${dishId}`);

    return this.httpClient.get<any>(url, { headers }).pipe(
      tap((response: any) => {
        console.log(`Dish details for ID ${dishId}:`, response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching dish details:', error);
        return throwError(() => new Error('Backend error occurred'));
      })
    );
  }

  updateDishInventory(dishId: string, quantity: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = { dish_id: dishId, inventory: quantity };
    return this.http.put<any>(`${BASE_URL}/dish_inventory`, payload, { headers }).pipe(
      tap((response: any) => {
        console.log(`Inventory updated for dish ID ${dishId}:`, response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error updating inventory:', error);
        return throwError(() => new Error('Backend error occurred'));
      })
    );
  }
  postDish(dishData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'application/json'
    });
  
    return this.http.post(this.postDishUrl, dishData, { headers });
  }
  

 // Function to update an existing dish
 editDish(dishId: string, dishData: any): Observable<any> {
  const token = localStorage.getItem('access_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.put(this.updateDishUrl, {dish_id: dishId, dishData}, { headers })
}

// Function to update an existing dish
deleteDish(dishId: string): Observable<any> {
  const token = localStorage.getItem('access_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const body = {dish_id :dishId};
  return this.http.delete(this.deleteDishUrl, {body ,headers} ).pipe(
    catchError((error) => {
      console.error('Error Removing Dish:', error);
      return throwError(() => new Error('Updating dish failed. Please try again.'));
    })
  );
}
  
}
