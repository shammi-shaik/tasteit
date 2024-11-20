import { Injectable } from '@angular/core';
import { HttpClient ,HttpHeaders, HttpParams} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { BASE_URL } from './base_url';

// FavoriteService code
@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private postFavUrl       = `${BASE_URL}/post_favorite`;
  private removeFavUrl     =`${BASE_URL}/remove_favorite`;
  private submitReviewUrl  = `${BASE_URL}/post_review`;
  private submitRatingUrl  = `${BASE_URL}/post_rating`;
  private getrestaurantUrl = `${BASE_URL}/get_favorite`;
  private getreviewUrl     = `${BASE_URL}/get_review`;
  private getcustomerreview = `${BASE_URL}/get_review_customer`;
  private getratingUrl     = `${BASE_URL}/get_rating`;

  

  constructor(private http: HttpClient) {}

  // Method to add a restaurant to the user's favorites list
  addRestaurantToFavorites(restaurantId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
   
    return this.http.post(this.postFavUrl, { restaurant_id: restaurantId}, { headers }).pipe(
      catchError((error) => {
        console.error('Error adding restaurant to favorites:', error);
        return throwError(() => new Error('Failed to place order. Please try again.'));
      })
    );
  }
  // Method to add a restaurant to the user's favorites list
  removeRestaurantFromFavorites(restaurantId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    let params = new HttpParams().set('restaurant_id', restaurantId);

    return this.http.delete(this.removeFavUrl, { headers,observe:'response',params }).pipe(
      catchError((error) => {
        console.error('Error adding restaurant to favorites:', error);
        return throwError(() => new Error('Failed to place order. Please try again.'));
      })
    );
  }

  //method to get favorite restaurants 
  getRestaurantFromFavorite():Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(this.getrestaurantUrl ,{headers}).pipe(
      catchError((error) =>{
        console.error('Error retriving Restaurant from favorites:' , error);
        return throwError(() => new Error('Failed to get Restaurants. Please try again.'));
      })
    )

  }

  // Method to submit a review for a restaurant
  submitReview(orderId: string,restaurant_id:string, reviewDescription: string, like: boolean): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const reviewData = {
      restaurant_id:restaurant_id,
      order_id: orderId, 
      review_description: reviewDescription, 
      likes: like 
    };
      
    return this.http.post(this.submitReviewUrl, reviewData, { headers }).pipe(
      catchError((error) => {
        console.error('Error submitting review or liking restaurant:', error);
        return throwError(() => new Error('Failed to submit review or like. Please try again.'));
      })
    );
  }

  // Method to submit restaurant rating
  submitRestaurantRating(orderId: string,restaurant_id:string, rating: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const ratingData = {
      order_id: orderId,
      rating_value: rating,
      restaurant_id:restaurant_id
    };

    return this.http.post(this.submitRatingUrl, ratingData, { headers }).pipe(
      catchError((error) => {
        console.error('Error submitting restaurant rating:', error);
        return throwError(() => new Error('Failed to submit rating. Please try again.'));
      })
    );
  }

  
  //method to get review of restaurants 
  getReviewOfRestaurant():Observable<any> {    
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(this.getreviewUrl ,{headers}).pipe(
      catchError((error) =>{
        console.error('Error retriving Review of  Restaurant :' , error);
      return throwError(() => new Error('Failed to get restaurant ratings. Please try again.'));
    })
  );
  }

  //method to get review of restaurants customer
  getReviewOfCustomer():Observable<any> {    
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(this.getcustomerreview ,{headers}).pipe(
      catchError((error) =>{
        console.error('Error retriving Review of  Restaurant :' , error);
      return throwError(() => new Error('Failed to get restaurant ratings. Please try again.'));
    })
  );
  }

    //method to get review of restaurants 
  getRatingOfRestaurant():Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(this.getratingUrl ,{headers}).pipe(
      catchError((error) =>{
        console.error('Error retriving Review of  Restaurant :' , error);
      return throwError(() => new Error('Failed to get restaurant ratings. Please try again.'));
    })
  );

}
}