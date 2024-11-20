import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../favorite.service';
import { HttpClient } from '@angular/common/http';
import { RestaurantService } from '../restaurant.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  favoriteRestaurants: any[] = []; // Array to store favorite restaurants
  errorMessage: string = '';
  restaurantId: string ='';
  restaurantName: string ='';
  text: string ='';
  isVisible: boolean = true;

  constructor(private favoriteService: FavoriteService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getFavoriteRestaurants();
  }

  // Method to fetch favorite restaurants
  getFavoriteRestaurants(): void {
    this.favoriteService.getRestaurantFromFavorite().subscribe(
      (response: any) => {
        console.log('Response from backend:', response);
        if (response) {
          // Map the fetched favorites to display restaurant details
          this.favoriteRestaurants = response.map((favorite: any) => ({
            favorite_id: favorite.favorite_id,
            restaurant_id: favorite.restaurant_id,
            name: favorite.restaurant_name,
            imageUrl: favorite.restaurant_image_url 
              ? `assets/restaurant_images/${favorite.restaurant_image_url}` 
              : 'assets/biryani.webp', // Default image if not available
          }));
        }
      },
      (error) => {
        console.error('Failed to fetch favorite restaurants', error);
        this.errorMessage = 'Failed to load favorite restaurants. Please try again later.';
      }
    );
  }

  // Updated method to remove a specific restaurant from favorites
  removeFromFavorite(restaurantId: string, restaurantName: string): void {
    this.favoriteService.removeRestaurantFromFavorites(restaurantId).subscribe(
      (response) => {
        console.log(`${restaurantName} removed from favorites successfully`, response);

        // Update the favoriteRestaurants array to remove the restaurant
        this.favoriteRestaurants = this.favoriteRestaurants.filter(
          (restaurant) => restaurant.restaurant_id !== restaurantId
        );
      },
      (error) => {
        console.error('Error removing restaurant from favorites:', error);
      }
    );
  }


}
