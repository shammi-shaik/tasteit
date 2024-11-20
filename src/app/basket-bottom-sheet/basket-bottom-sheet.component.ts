import { Component, OnInit,Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';


@Component({
  selector: 'app-basket-bottom-sheet',
  templateUrl: './basket-bottom-sheet.component.html',
  styleUrls: ['./basket-bottom-sheet.component.css']
})

export class BasketBottomSheetComponent {
    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<BasketBottomSheetComponent>,
    private router: Router) {}
  
    // The data will contain the items in the basket
    get totalDishes(): number {
      return this.data.totalDishes || 0;  
    }

      // Navigate to the basket page
  navigateToBasket(): void {
    this.bottomSheetRef.dismiss(); // Close the bottom sheet
    console.log('this.data.dishesInBasket',this.data.dishesInBasket)
    this.router.navigate(['/basket'],{ state: {dishesInBasket: this.data.dishesInBasket, restaurantId: this.data.restaurantId } }); // Navigate to the basket page (adjust route as needed)
  }

 
}
