import { Component, OnInit } from '@angular/core';
import { DishService } from '../dish.service';
import { OrdersService } from '../order.service';
import { Router } from '@angular/router';
import { FavoriteService } from '../favorite.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  dishesInBasket: any[] = []; // Array to hold unique dishes in the basket
  totalPrice: number = 0;     // Variable to hold total price
  orderPlaced = false;
  restaurantId: string =''; // Store restaurant ID dynamically
  isProcessingOrder = false; // New flag for order processing


  constructor(private dishService: DishService ,
              private ordersService:OrdersService ,
              ) {}

  ngOnInit(): void {
    this.fetchBasket(); // Fetch basket on initialization
  }

  // Fetch the current basket and calculate the total price
  fetchBasket(): void {
    this.dishService.getBasket().subscribe(
      (response: any) => {
        console.log('response',response)
        if (response && response.dishes) {
          this.dishesInBasket = this.mergeDuplicateDishes(response.dishes);
          this.fetchDishDetailsAndCalculateTotal();
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching basket:', error);
      }
    );
  }

  // Merge duplicate dishes and calculate total quantity for each dish
  mergeDuplicateDishes(dishes: any[]): any[] {
    const mergedDishes: { [key: string]: any } = {};

    dishes.forEach((dish) => {
      if (mergedDishes[dish.dish_id]) {
        // mergedDishes[dish.dish_id].quantity = dish.quantity;
      } else {
        mergedDishes[dish.dish_id] = { ...dish };
      }
    });
    return Object.values(mergedDishes);
  }

  // Fetch dish details for each dish in the basket and calculate the total price
  fetchDishDetailsAndCalculateTotal(): void {
    let remainingDishes = this.dishesInBasket.length;
    this.dishesInBasket.forEach((dish) => {
      this.dishService.getDishById(dish.dish_id).subscribe(
        (dishDetails: any) => {
          if (dishDetails && dishDetails.dish_price) {
            dish.dish_price = dishDetails.dish_price;
              // Capture the restaurant ID from the dish details
              if (!this.restaurantId && dishDetails.restaurant_id) {
                this.restaurantId = dishDetails.restaurant_id;
                console.log("Restaurant ID set:", this.restaurantId);  // Ensure we capture the restaurant ID
              }
          } else {
            console.error(`Dish details for ID ${dish.dish_id} do not have price information.`);
          }

          remainingDishes--;
          if (remainingDishes === 0) {
            this.calculateTotalPrice();
          }
        },
        (error: any) => {
          console.error(`Error fetching details for dish ID ${dish.dish_id}:`, error);
          remainingDishes--;
          if (remainingDishes === 0) {
            this.calculateTotalPrice();
          }
        }
      );
    });
  }
  // Calculate total price based on the dishes in the basket
  calculateTotalPrice(): void {
    this.totalPrice = this.dishesInBasket.reduce((acc, dish) => {
      const price = Number(dish.dish_price) || 0;
      const quantity = Number(dish.quantity) || 0;
      return acc + (price * quantity);
    }, 0);
  }

  // Increment the quantity of a dish in the basket
  incrementQuantity(dish: any): void {
    dish.quantity += 1;
    this.updateDishInBasket(dish);
  }

   // Decrement the quantity of a dish in the basket
   decrementQuantity(dish: any): void {
    if (dish.quantity > 1) {
      dish.quantity -= 1;
      this.updateDishInBasket(dish);
    } else {
      // Remove the dish from the basket if quantity is 0
      this.dishesInBasket = this.dishesInBasket.filter(d => d.dish_id !== dish.dish_id);
      this.dishService.removeDishFromBasket(dish.dish_id).subscribe(
        (response: any) => {
          console.log('Successfully removed from backend:', response);
        },
        (error: any) => {
          console.error('Error removing from backend:', error);
        }
      );
    }
    this.calculateTotalPrice();
  }

  // Update the dish quantity in the backend
  updateDishInBasket(dish: any): void {
    this.dishService.updateDishInBasket({ dish_id: dish.dish_id, quantity: dish.quantity }).subscribe(
      (response: any) => {
        console.log('Updated quantity in backend:', response ,response.quantity);
        this.calculateTotalPrice();
      },
      (error: any) => {
        console.error('Error updating quantity:', error);
      }
    );
  }

  placeOrder(): void {
    const orderData = {
      totalPrice: this.totalPrice,
      dishes: this.dishesInBasket.map(dish => ({
        dishId: dish.dish_id,
        quantity: dish.quantity,
        price: dish.dish_price,
        dish_image_url: dish.dish_image_url,
      }))
    };


    this.ordersService.placeOrder(orderData).subscribe(
      response => {
        this.orderPlaced = true;
        console.log(response)
        // this.restaurantId = response.restaurantId; // Capture the restaurant ID dynamically
        this.dishesInBasket.forEach((dish) => {
          this.dishService.updateDishInventory(dish.dish_id, dish.quantity).subscribe(
            () => {
              console.log(`Inventory updated for dish ID ${dish.dish_id}`);
            },
            (error: any) => {
              console.error(`Error updating inventory for dish ID ${dish.dish_id}:`, error);
            }
          );
        });

        this.dishesInBasket = []; // Clear basket
        this.totalPrice = 0;      // Reset total price
      },
      error => {
        this.isProcessingOrder = false;
        console.error('Error placing order:', error);
      }
    );
  }

}

