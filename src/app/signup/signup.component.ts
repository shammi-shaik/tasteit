import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SignupService } from '../signup.service';
import { HttpErrorResponse } from '@angular/common/http';


function passwordLengthValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.value;
  return password && (password.length < 8 || password.length > 16) ? { 'passwordLength': true } : null;
}
 
function passwordComplexityValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.value;
  return password && (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password) || !/(?=.*\d)/.test(password))
    ? { 'passwordComplexity': true }
    : null;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  customerSignupForm!: FormGroup;
  restaurantSignupForm!: FormGroup;
  selectedRole: string = 'customer';
  errorMessage: string|null=null;
  selectedFile: File | null = null;
  fileErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private toastr: ToastrService,
    private signupService: SignupService
  ) {
    // Initialize both form groups
   
  }

  ngOnInit(): void {
    // Optional initialization logic can go here
    this.customerSignupForm = this.fb.group({
      userName: ['', [Validators.required,Validators.minLength(3)]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required,passwordLengthValidator,passwordComplexityValidator]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    this.restaurantSignupForm = this.fb.group({
      userName: ['', [Validators.required,Validators.minLength(3)]],
      restaurantName: ['', [Validators.required,Validators.minLength(3)]],
      restaurantAddress: ['', [Validators.required,Validators.minLength(5)]],
      restaurantPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      restaurantEmail: ['', [Validators.required, Validators.email]],
      restaurantPassword: ['', [Validators.required,passwordLengthValidator,passwordComplexityValidator]],
      restaurantImageUrl: ['']
    });
  }

 

  // Method to navigate to login page
  navigateToLogin(): void {
    this.router.navigate(['/login']); 
  }

  // Handle role change to dynamically switch between forms
  onRoleChange(): void {
    this.customerSignupForm.reset();
    this.restaurantSignupForm.reset();
  }

  onFileChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.fileErrorMessage = null;
    } else {
      this.fileErrorMessage = 'Please select a valid image file.';
    }
  }
  // Submit Customer Registration
  onCustomerSubmit(): void {
    console.log(1)
    if(this.customerSignupForm.invalid){
      this.errorMessage='Please fill the form before submitting'
    }
    if (this.customerSignupForm.valid) {
      const customerData = {
        user_name: this.customerSignupForm.value.userName,
        email: this.customerSignupForm.value.userEmail,
        user_pwd: this.customerSignupForm.value.userPassword,
        phone_number: this.customerSignupForm.value.phoneNumber,
        role_name: 'customer'
      };

      this.signupService.signupUser(customerData).subscribe(
        data=> {
          this.toastr.success('Customer registration successful!', 'Success');
          this.router.navigate(['/login']);
        },
        (error: HttpErrorResponse) => {
          if(error.status===400){
            this.errorMessage=error.error.message
            this.toastr.error('Registration failed. Please try again.', 'Error');
          }
        }
      );
    }
  }

  // Submit Restaurant Registration
  onRestaurantSubmit():void {
    if (this.restaurantSignupForm.invalid){
        this.errorMessage ='Please fill the form before submitting'
    }
    if (this.restaurantSignupForm.valid && this.selectedFile) {
      const userData = {
        user_name: this.restaurantSignupForm.value.userName,
        email: this.restaurantSignupForm.value.restaurantEmail,
        phone_number: this.restaurantSignupForm.value.restaurantPhone,
        user_pwd: this.restaurantSignupForm.value.restaurantPassword,
        role_name: 'seller'
      };
      const restaurantData = new FormData();
      restaurantData.append('restaurant_name', this.restaurantSignupForm.value.restaurantName);
      restaurantData.append('email', this.restaurantSignupForm.value.restaurantEmail);
      restaurantData.append('restaurant_address', this.restaurantSignupForm.value.restaurantAddress);
        // restaurant_image_url: this.restaurantSignupForm.value.restaurantImageUrl

      if (this.selectedFile) {
        restaurantData.append('file', this.selectedFile, this.selectedFile.name);        
      } else {
        this.errorMessage = 'Please select an image file.';
        this.toastr.error('No file selected', 'Error');
        return;
      }
      this.signupService.signupUser(userData).subscribe(
        response=>{
          this.signupService.signuprestaurant(restaurantData).subscribe(
            data=>{
              this.toastr.success('Restaurant registration successful! Awaited Admin approval', 'Success');
              this.router.navigate(['/login']);
            },
            (error: HttpErrorResponse) =>{               
              if (error.status===400){
              this.errorMessage = error.error.message
              this.toastr.error('Registration failed. Please try again.', 'Error');
              }
            } 
          )
        },
      (error: HttpErrorResponse) =>{
        if(error.status===400){
          this.errorMessage = error.error.message
          this.toastr.error('Registration failed. Please try again.', 'Error');
        }
       }
      )
     
    }
  }
}
