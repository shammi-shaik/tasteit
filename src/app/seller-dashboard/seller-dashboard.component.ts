import { Component, OnInit } from '@angular/core';
import { DishService } from '../dish.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantService } from '../restaurant.service';
import { FormBuilder ,Validators,FormGroup} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrdersService } from '../order.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  restaurantId:any
  Mydishes: any[] = [];
  restaurantName: string =''
  dishRegisterForm: FormGroup;
  dishEditForm!:FormGroup
  showDishForm: boolean = false;
  showEditForm: boolean = false; 
  showLowInventoryModal: boolean = false; // Controls modal display
  selectedDish: any; // To keep track of the dish with low inventory
  selectedFile: File | null = null;
  fileErrorMessage: string | null = null;
  errorMessage: string|null=null;


  constructor(private restaurantService:RestaurantService ,
            private fb: FormBuilder, 
            private router: Router, 
            private dishService:DishService,
            private toastr:ToastrService,
            private orderService:OrdersService
  ) { 
    // Initialize both form groups
    this.dishRegisterForm = this.fb.group({
      dishName: ['', Validators.required],
      dishDescription: ['', [Validators.required]],
      dishPrice: ['', Validators.required],
      inventory: ['', [Validators.required,]],
      available: ['', [Validators.required,]],
      dishImageurl: ['', [Validators.required,]],
      dishType:['veg',[Validators.required,]]


    });
    this.dishEditForm = this.fb.group({
      dishId:['',Validators.required],
      dishName: ['', Validators.required],
      dishDescription: ['', [Validators.required]],
      dishPrice: ['', Validators.required],
      inventory: ['', [Validators.required,]],
      available: ['', [Validators.required,]],
      dishImageurl: ['', [Validators.required,]],
      dishType:['',[Validators.required,]]
    });
  }

  ngOnInit(): void {
  this.getRestaurant();

  }
  // Show the dish form
  displayForm(): void {
    this.showDishForm = !this.showDishForm;
    this.showEditForm = false; 
  }


  cancelForm(): void {
    this.dishRegisterForm.reset();
    this.showDishForm = false;
  }

  getRestaurant():void{
    this.restaurantService.getMyRestaurant().subscribe(
      (response) =>{
        this.Mydishes = response.dishes
        console.log('jhkjh',this.Mydishes)
      },
      (error) => {
        console.error('Error fetching dishes:', error);
      }
    )
  }

  deleteDish(dishID:string):void{
    this.dishService.deleteDish(dishID).subscribe(
      () =>{
        console.log('Dish removed successfully');
        this.getRestaurant();
      },
      (error :HttpErrorResponse) =>{
        if(error.status ===400){
          this.errorMessage = error.error.message
          this.toastr.error('Dish removing failed. Please try again.', 'Error');
        }

      }
    )
  }

  onFileChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      console.log(this.selectedFile);
      this.fileErrorMessage = null;
    } else {
      this.fileErrorMessage = 'Please select a valid image file.';
    }
  }

  onDishSubmit():void{
    if (this.dishRegisterForm.valid && this.selectedFile) {
      const dishData = new FormData();
        dishData.append('dish_name',this.dishRegisterForm.value.dishName);
        dishData.append('dish_description',this.dishRegisterForm.value.dishDescription);
        dishData.append('dish_price',this.dishRegisterForm.value.dishPrice)
        dishData.append('inventory', this.dishRegisterForm.value.inventory);
        dishData.append('available',this.dishRegisterForm.value.available);
        dishData.append('dish_type',this.dishRegisterForm.value.dishType);
        console.log('sending',dishData)
        
        if(this.selectedFile){
          dishData.append('file',this.selectedFile, this.selectedFile.name);
        console.log('sendingjsjvhgvaukdag',this.selectedFile)

        }else{
          this.fileErrorMessage = 'Please select an image file.';
          this.toastr.error('No file selected', 'Error');
          return;
        }
      
      this.dishService.postDish(dishData).subscribe(
        response => {
          this.toastr.success('Dish added successfully!', 'Success');
          this.dishRegisterForm.reset();
          this.showDishForm = false; // Hide the form on successful submission
          this.getRestaurant();      // Refresh the dish list
          console.log(response)
        },
        (error)=> {     
          if (error.status === 403|| error.status === 400 || error.status === 404){
            console.log(2)
          this.errorMessage = error.error.message
          this.toastr.error('Dish Adding failed. Please try again.', 'Error');
          }
        } 
      );
    }
  (error: HttpErrorResponse)=> {
    if(error.status===400){
      this.errorMessage = error.error.message
      this.toastr.warning('Please fill in all required fields.', 'Form Incomplete');
    }
  }
  }

  edit(dish:any):void{
    console.log(this.dishEditForm.value);
    
    this.dishEditForm.patchValue({
        dishId:dish.dish_id,
        dishName:dish.dish_name,
        dishDescription:dish.dish_description,
        dishPrice:dish.dish_price,
        inventory:dish.inventory,
        available:dish.available,
        dishImageurl:dish.dish_image_url,
        dishType:dish.dish_type
      }
    )
    console.log(this.dishEditForm.value); 
    this.showEditForm = true; // Show the edit form when a dish is selected for editing
    this.showDishForm = false;
  }


  saveDish(): void {
    if (this.dishEditForm.valid) {
      const dishData = {
        dish_id :this.dishEditForm.value.dishId,
        dish_name: this.dishEditForm.value.dishName,
        dish_description: this.dishEditForm.value.dishDescription,
        dish_price: this.dishEditForm.value.dishPrice,
        inventory: this.dishEditForm.value.inventory,
        available: this.dishEditForm.value.available,
        dish_image_url: this.dishEditForm.value.dishImageurl,
        dish_type:this.dishEditForm.value.dishType
      };
      this.dishService.editDish(this.dishEditForm.value.dishId, dishData).subscribe(
          (response) => {
            this.toastr.success('Dish updated successfully!', 'Success');
            this.showEditForm = false;
              console.log(response)

            this.getRestaurant();      // Refresh the dish list
          },
          (error) => {
            this.toastr.error('Failed to update dish. Please try again.', 'Error');
            console.error('Failed to update dish', error);
          }
        );
    } else {
      this.toastr.warning('Please fill in all required fields.', 'Form Incomplete');
    }
  }

  cancelEditForm(): void {
    this.dishEditForm.reset();
    this.showEditForm = false; // Hide the edit form modal
  }



}

