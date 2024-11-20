import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpInterceptor, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Initialize the form with form controls and validators
    this.loginForm = this.fb.group({
      contact: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void { }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in your contact and password before submitting';
      return;
    }
    const { contact, password } = this.loginForm.value;
    this.authService.login(contact, password).subscribe(
      (response: HttpResponse<any>) => {
        if (response && response.body.access_token) {
          // Store token if needed
          localStorage.setItem('access_token', response.body.access_token);
          localStorage.setItem('userRole', response.body.role);

          // Redirect based on the role
          if (response.body.role === 'seller') {
            this.toastr.success('Seller login successful! Redirecting to Seller Dashboard...');
            this.router.navigate(['/seller']); // Navigate to seller component
          } else if (response.body.role === 'customer') {
            this.toastr.success('Customer login successful! Redirecting to Customer Dashboard...');
            this.router.navigate(['/home']); // Navigate to home component
          } else if (response.body.role === 'Admin') {
            this.toastr.success('Admin login successful! Redirecting to Admin Dashboard...');
            this.router.navigate(['/Admin']); // Navigate to Admin component
          }
        }

      },
      (error) => {
        if (error.status === 404|| error.status === 401 || error.status === 400 ||error.status ===422){
          this.errorMessage = error.error.message;
        }
        else {
          // Set error message on HTTP error response
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
        this.toastr.error(this.errorMessage);
      }
    );
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-pwd']);
  }
}
