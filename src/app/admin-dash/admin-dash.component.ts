import { Component,  OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestaurantService } from '../restaurant.service';
import { ProfileService } from '../profile.service';


@Component({
  selector: 'app-admin-dash',
  templateUrl: './admin-dash.component.html',
  styleUrls: ['./admin-dash.component.css']
})
export class AdminDashComponent implements OnInit {
  pendingRestaurants: any[] = [];
  currentView: string = 'pendingRequests';  // Tracks the current view
  Restaurants:any[] = [];
  Listusers:any[] = [];
  constructor(private restaurantService : RestaurantService, private http: HttpClient, private profileService:ProfileService) {}

  ngOnInit() {
    this.loadPendingRestaurants();
    this.loadRestaurants();
  }
  
  // Method to load restaurants with "pending" status
  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe(
      (response) => {
        this.Restaurants = response.restaurants.filter(
          (restaurant: any) => restaurant.status_name === 'Approved'
        );
        console.log(response)
      },
      (error) => {
        console.error('Error fetching restaurants:', error);
      }
    );
}
   // Method to load restaurants with "pending" status
   loadPendingRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe(
      (response) => {
        this.pendingRestaurants = response.restaurants.filter(
          (restaurant: any) => restaurant.status_name === 'Pending'
        );
      },
      (error) => {
        console.error('Error fetching restaurants:', error);
      }
    );
}
  // Method to set the view based on user selection
  setView(view: string): void {
    this.currentView = view;
    if (view === 'pendingRequests') {
      this.loadPendingRestaurants(); // Load data when pending requests is selected
    }
    // this.currentView = view;
    if(view === 'Restaurants'){
      this.loadRestaurants();
    } 
    if(view === 'Listusers'){
      this.loadcustomers();
    } 
  }


  approveRestaurant(restaurantId: string): void {
    this.restaurantService.updateRestaurantStatus(restaurantId, 'Approved').subscribe(
      () => {
        console.log('Restaurant approved successfully');
        this.loadPendingRestaurants(); // Refresh the list after approval
      },
      (error) => {
        console.error('Error approving restaurant:', error);
      }
    );
  }

  rejectRestaurant(restaurantId: string): void {
    this.restaurantService.updateRestaurantStatus(restaurantId, 'Rejected').subscribe(
      () => {
        console.log('Restaurant rejected successfully');
        this.loadPendingRestaurants(); // Refresh the list after rejection
      },
      (error) => {
        console.error('Error rejecting restaurant:', error);
      }
    );
  }

  loadcustomers():void{
    this.profileService.getProfileUsers().subscribe(
      (response) =>{
        this.Listusers = response.users
        console.log(response)
      },
      (error) => {
        console.error('Error fetching restaurants:', error);
      }
    )
  }

  deleteRestaurant(restaurantId: string):void{
    this.restaurantService.deleteRestaurant(restaurantId).subscribe(
      () =>{
        console.log('deleted successfully',restaurantId)
        this.loadRestaurants();
      },
      (error) => {
        console.error('Error fetching restaurants:', error);
      }
    )
  }

}