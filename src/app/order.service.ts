import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BASE_URL } from './base_url';


@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private postOrderUrl = `${BASE_URL}/post_order_details`; // Use BASE_URL
  private getOrderUrl = `${BASE_URL}/get_order_details`;  // Use BASE_URL
  private getSellerUrl = `${BASE_URL}/get_sellers_orders`;

  constructor(private http: HttpClient) {}

  // Method to place an order
  placeOrder(orderData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.postOrderUrl, orderData, { headers }).pipe(
      catchError((error) => {
        console.error('Error placing order:', error);
        return throwError(() => new Error('Failed to place order. Please try again.'));
      })
    );
  }

  // Method to get orders for the user
  getOrders(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.getOrderUrl, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders. Please try again.'));
      })
    );
  }

  //Method to get the sellers orders 

  getSellerOrders(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.getSellerUrl, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to fetch orders. Please try again.'));
      })
    );
  }




}
