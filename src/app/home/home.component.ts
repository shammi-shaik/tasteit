import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestaurantService } from '../restaurant.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  searchQuery: string = '';
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];  // Holds the filtered results
  noResultsMessage: string = '';  

  constructor(private restaurantService: RestaurantService ,private router: Router) {}

  ngOnInit(){
    this.loadRestaurants();
  }
  
  loadRestaurants(): void {
    // Fetch the list of restaurants when the component is initialized
    this.restaurantService.getRestaurants().subscribe(
      (response) => {
        this.restaurants = response.restaurants.filter(
          (restaurant: any) => restaurant.status_name === 'Approved' 
        ); 
        this.filteredRestaurants = [...this.restaurants]; // Initialize filteredRestaurants with all restaurants
      },
      (error) => {
        console.error('Failed to fetch restaurants', error);
      }
    );
  }

  // Method to handle restaurant selection
  selectRestaurant(restaurant: any): void {
    this.router.navigate(['/dishes'], {
      state: { restaurantId: restaurant.restaurant_id } // Pass the restaurant ID
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();

      // Filter restaurants based on the search query
      const results = this.restaurants.filter(restaurant =>
        restaurant.restaurant_name.toLowerCase().includes(query)  // Filter by name
      );

      if (results.length > 0) {
        this.filteredRestaurants = results;
        this.noResultsMessage = '';
      } else {
        this.filteredRestaurants = [];
        this.noResultsMessage = 'No restaurants found matching your search criteria.';
      }
    } else {
      // If search query is empty, reset to the full restaurant list
      this.filteredRestaurants = [...this.restaurants];
      this.noResultsMessage = '';
    }
  }
} 