import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DishService } from '../dish.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BasketBottomSheetComponent } from '../basket-bottom-sheet/basket-bottom-sheet.component';
import { FavoriteService } from '../favorite.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css']
})
export class DishesComponent implements OnInit {
  dishes: any[] = []; 
  restaurantName: string = '';
  dishesInBasket: any[] = []; // Array to hold added dishes
  restaurantId:any
  isVisible:boolean=true
  text:string = 'Add To fav';
  isFavorite:boolean=false
  // error:boolean=false
  errorMessage:string|null=null
  isButtonDisable:boolean=false
  filteredDishes:any[] = [];
  noResultsMessage: string = ''; 
  searchQuery: string = '';
  dishTypeFilter: string = 'All';

  
  constructor(
    private route: ActivatedRoute,
    private dishService: DishService,
    private bottomSheet: MatBottomSheet,
    private router: Router ,
    private favoriteService:FavoriteService
  ) {}

  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('id'); // Get the restaurant ID from the route
    this.restaurantName = this.route.snapshot.paramMap.get('name') || 'Restaurant'; // Get the restaurant name

    if (this.restaurantId) {
      this.fetchDishes(this.restaurantId);

    } else {
      console.error('Restaurant ID is undefined');
    }
  }   

  fetchDishes(restaurantId: string): void {
    this.dishService.getDishesByRestaurant(restaurantId).subscribe(
      (response) => {
       this.dishes = response.dishes;
       console.log(this.dishes);
       
       this.filteredDishes = [...this.dishes];
       if(response.dishes.inventory===0){
       }
        this.favoriteService.getRestaurantFromFavorite().subscribe(
          data=>{
            for(let fav of data){
              if(restaurantId===fav.restaurant_id){
                this.text = 'Remove from favorites'
                this.isVisible = false
              }
            }
        })
      },
      (error) => {
        console.error('Error fetching dishes:', error);
      }
    );
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();

      // Filter restaurants based on the search query
      const results = this.dishes.filter(dish =>
        dish.dish_name.toLowerCase().includes(query)  // Filter by name
      );

      if (results.length > 0) {
        this.filteredDishes = results;
        this.noResultsMessage = '';
      } else {
        this.filteredDishes = [];
        this.noResultsMessage = 'No restaurants found matching your search criteria.';
        console.log(this.noResultsMessage);
      }
    } else {
      // If search query is empty, reset to the full restaurant list
      this.filteredDishes = [...this.dishes];
      this.noResultsMessage = '';
    }
  }

  // Method to toggle dish types
  toggleDishType(Type: string): void {
    this.dishTypeFilter = Type;
    if (Type === 'All') { 
      this.filteredDishes = [...this.dishes]; // Show all dishes
    } else {
      this.filteredDishes = this.dishes.filter(dish => dish.dish_type === Type);
    }
  }

  // Add button click: Set initial quantity to 1 and add dish to the basket if not already added
  // Add or update the dish in the basket
addDish(dish: any): void {  
  const existingDish = this.dishesInBasket.find(d => d.dish_id === dish.dish_id);
  if (existingDish) { 
    if (existingDish.quantity >= dish.inventory) {
    this.errorMessage = `Only ${dish.inventory} units available in stock for ${dish.dish_price}`;
    alert(this.errorMessage); // Show an alert or display a message to the user
    return;
  }
    existingDish.quantity += 1;
  } else {
    if (dish.inventory < 1) {
      this.errorMessage = `${dish.dish_name} is out of stock`;
      alert(this.errorMessage); // Show an alert or display a message to the user
      return;
    }
    dish.quantity = 1; // Initialize with 1 if not already added
    this.dishesInBasket.push(dish);
  }

  // Send the dish and its quantity to the backend
  const basketEntry = {
    dish_id: dish.dish_id,
    quantity: dish.quantity 
  };

  console.log('Sending data to backend:', basketEntry);

  this.dishService.updateDishInBasket(basketEntry).subscribe(
    (response: any) => {
      console.log('Successfully added/updated in backend:', response);
    },
    (error: HttpErrorResponse) => {
      if(error.status===400){
        this.errorMessage=error.error.message
        console.log(error.error.message)
      }
      console.error('Error updating backend:', error);
    }
  );

  // Open the bottom sheet
  this.openBottomSheet();
}

// Increment button click: Increase quantity by 1
incrementQuantity(dish: any): void {
   // Check if the quantity can be incremented based on inventory
   if (dish.quantity >= dish.inventory) {
    this.errorMessage = `Only ${dish.inventory} units available in stock for ${dish.dish_name}`;
    alert(this.errorMessage); // Show an alert or display a message to the user
    return;
  }
  dish.quantity += 1;

  // Update backend with new quantity
  this.dishService.updateDishInBasket({ dish_id: dish.dish_id, quantity: dish.quantity }).subscribe(
    (response: any) => {
      console.log('Updated quantity in backend:', response);
    },
    (error) => {
    
      console.error('Error updating quantity:', error);
    }
  );
}

// Decrement button click: Decrease quantity by 1, remove from basket if quantity is 0
decrementQuantity(dish: any): void {
  if (dish.quantity > 0) {
    dish.quantity -= 1;
    
    // Update or remove from backend based on new quantity
    if (dish.quantity === 0) {
      this.dishesInBasket = this.dishesInBasket.filter(d => d.dish_id !== dish.dish_id);

      this.dishService.removeDishFromBasket(dish.dish_id).subscribe(
        (response: any) => {  
          console.log('Successfully removed from backend:', response);
        },
        (error: any) => {
          console.error('Error removing from backend:', error);
        }
      );
    } else {
      this.dishService.decreaseDishInBasket({ dish_id: dish.dish_id, quantity: dish.quantity }).subscribe(
        (response: any) => {
          console.log('Updated quantity in backend:', response);
        },
        (error: any) => {
          console.error('Error updating quantity:', error);
        }
      );
    }
  }
}
addToFavorites(): void {
  this.favoriteService.addRestaurantToFavorites(this.restaurantId).subscribe(
    (response) => {
      console.log(`${this.restaurantName} added to favorites successfully`, response);
      this.text = 'Remove From fav';
      this.isVisible = false
    },
    (error) => {
      // if(error.status === )
      console.error('Error adding restaurant to favorites:', error);
    }
  );
}

removeFromFavorite():void{
  this.favoriteService.removeRestaurantFromFavorites(this.restaurantId).subscribe(
    (response) =>{
      console.log(`${this.restaurantName} removed from favorites successfully`,response);
      this.text = 'Add to Fav';
      this.isVisible= true
    },
    (error) =>{
      console.error('Error removing restaurant to favorites:', error);
    }    
  );
}



openBottomSheet(): void {
  // Check if there are any dishes in the basket before opening the bottom sheet
  if (this.dishesInBasket.length > 0) {
    this.bottomSheet.open(BasketBottomSheetComponent, {
      data: { totalDishes: this.dishesInBasket.length },
      disableClose: true, // Allow closing only through explicit action (e.g., close button in the bottom sheet)
      hasBackdrop: false,  // Display a backdrop to prevent interaction with the rest of the screen
      backdropClass: 'custom-backdrop', // Optional: Customize backdrop class
      panelClass: 'custom-bottom-sheet' // Optional: Add custom style to the bottom sheet
    }).afterDismissed().subscribe(() => {
      // Handle any actions after the bottom sheet is dismissed, if needed
    });
  }
}
}

