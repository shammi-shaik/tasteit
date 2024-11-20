import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../favorite.service';

@Component({
  selector: 'app-review-ratings',
  templateUrl: './review-ratings.component.html',
  styleUrls: ['./review-ratings.component.css']
})
export class ReviewRatingsComponent implements OnInit {

  reviews: any[] = [];
  ratings: any[] = [];
  averageRating: number = 0;
  totalRatings: number = 0;
  ratingCounts: number[] = [0, 0, 0, 0, 0]; // Array to hold counts of each rating from 1 to 5
  errorMessage: string = '';
  totalLikes:number =0

  constructor(private favoriteService: FavoriteService) { }

  ngOnInit(): void {
    this.getReviewOfRestaurant();
    this.getRatingOfRestaurant();
    
  }

  // Method to fetch all reviews
  getReviewOfRestaurant(): void {
    this.favoriteService.getReviewOfRestaurant().subscribe(
      (response: any) => {
        this.reviews = response.reviews;
        this.totalLikes= response.total_likes
      },
      (error) => {
        console.error('Failed to fetch reviews', error);
        this.errorMessage = 'Failed to load reviews. Please try again later.';
      }
    );
  }

  // Method to fetch all ratings and average rating
  getRatingOfRestaurant(): void {
    this.favoriteService.getRatingOfRestaurant().subscribe(
      (response: any) => {
        this.averageRating = response.average_rating; 
        this.totalRatings = response.total_ratings;        
        this.ratingCounts = [0, 0, 0, 0, 0];

        console.log('Fetched ratings:', response);

        response.ratings.forEach((rating:any)=> {
          if (rating.rating_value >= 1 && rating.rating_value <= 5) {
            this.ratingCounts[rating.rating_value - 1] += 1;
          }
        });

        console.log('Updated ratingCounts:', this.ratingCounts);
            },
      (error) => {
        console.error('Failed to fetch ratings', error);
        this.errorMessage = 'Failed to load ratings. Please try again later.';
      }
    );
  }

  // Generate array to show full, half, and empty stars based on fetched average rating
  getStars(): string[] {
    const stars = [];
    let rating = this.averageRating;

    for (let i = 0; i < 5; i++) {
      if (rating >= 1) {
        stars.push('full');
      } else {
        stars.push('empty');
      }
      rating -= 1;
    }
    return stars;
  }

  getuserStars(rating:number): string[] {
    rating=Math.round(rating)
    const stars = [];
    for (let i = 1; i <=5; i++) {
      if (rating >= i) {
        stars.push('fa-solid');
      } 
      else {
        stars.push('fa-regular');
      }
    }
    return stars;
  }

  // Calculate bar width for each rating level based on total ratings
  getBarWidth(ratingLevel: number): string {
    return this.totalRatings > 0 ? `${(this.ratingCounts[ratingLevel] / this.totalRatings) * 100}%` : '0%';
  }
}
