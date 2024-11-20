import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../order.service';
import { FavoriteService } from '../favorite.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  errorMessage: string = '';
  showForm: { [key: string]: boolean } = {};  // Track review form visibility by restaurant ID
  reviewDescription: { [key: string]: string } = {};  // Track review description by restaurant ID
  reviewRating: { [key: string]: any } = {};  // Track review rating by restaurant ID 
  stars = Array(5).fill(0);  // Array for 5-star rating
  restaurantId: string = '';  // Store restaurant ID dynamically
  reviewLiked: { [key: string]: boolean } = {}; // Tracks the like status for each restaurant
  restaurantLikes: { [key: string]: number } = {}; // Track likes count for each restaurant
  rating:number=0
  Reviews:any[]=[]
  myOrders:Order[]=[]


  constructor(private router: Router, private ordersService: OrdersService, private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders():void{
    this.ordersService.getOrders().subscribe(
      response =>{
       this.myOrders=response.orders.sort((a: any, b: any) => 
        new Date(b.order_time).getTime() - new Date(a.order_time).getTime()
      );
       console.log(this.myOrders);
       
      },
      error =>{
        console.error('error is ',error)
      }
    )
  }

  // Helper function to format the date
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Toggle the review form for a specific restaurant
  toggleReviewForm(orderId: string): void {
    this.showForm[orderId] = !this.showForm[orderId];
  }

  // Select rating by clicking on a star
  selectRating(orderId: string, rating: number): void {
    this.reviewRating[orderId] = rating;
  }
  updateRating(rating:number){
    this.rating=rating
  }

  toggleLike(orderId: string): void {
    console.log(this.reviewLiked[orderId])
    this.reviewLiked[orderId] = !this.reviewLiked[orderId];
   
  }

  // Submit the review and rating for a specific restaurant
  submitReview(orderId: string,restaurant_id:string): void {
    
    const reviewDescription = this.reviewDescription[orderId];
    const rating = this.reviewRating[orderId];
    const liked = this.reviewLiked[orderId];
    this.myOrders.forEach(order=>{
      if(order.order_id==orderId){
        order.is_reviewed=true
      }
    })
    
    this.favoriteService.submitReview(orderId, restaurant_id,reviewDescription, liked).subscribe(
      (response) => {
        this.fetchOrders( )
        
        this.favoriteService.submitRestaurantRating(orderId,restaurant_id, rating).subscribe(
          (ratingResponse) => {
            console.log('Rating submitted successfully:', ratingResponse);
            this.showForm[orderId] = false;  // Hide the form after successful submission
            this.reviewDescription[orderId] = ''; // Reset the review description
            this.reviewRating[orderId] = undefined; // Reset the rating
            this.reviewLiked[orderId] = false; // Reset the like status
          },
          (ratingError) => {
            console.error('Error submitting rating:', ratingError);
          }
        );
      },
      (reviewError) => {
        console.error('Error submitting review:', reviewError);
      }
    );
  }
 
}
interface OrderDish {
  dish_id: string;
  dish_name: string;
  dish_quantity: number;
}
interface  ReviewData{
  review_description:string;
  like:number;
  rating_value:string;
}

interface Order {
  order_id: string;
  order_price: string;
  is_reviewed:boolean;
  order_quantity: string;
  order_time: string;
  restaurant_id:string;
  restaurant_address: string;
  restaurant_image_url: string;
  restaurant_name: string;
  review_data:ReviewData
  order_dishes: OrderDish[];
}

