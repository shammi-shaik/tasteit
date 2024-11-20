import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Toast } from 'ngx-toastr';
import { Route, Router } from '@angular/router';



@Component({
  selector: 'app-forgot-pwd',
  templateUrl: './forgot-pwd.component.html',
  styleUrls: ['./forgot-pwd.component.css']
})
export class ForgotPwdComponent implements OnInit {
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;
  errorMessage: string | null = null;
  isOtpSent = false;
  isPasswordReset = false;
  countdown: number = 300;
  displayTime: string = '05:00';
  showModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router:Router
  ) {}

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  openForgotPasswordModal() {
    this.showModal = true;
  }

  navigateToLogin():void{
    this.router.navigate(['/login']);
  }

 
  closeForgotPasswordModal() {
    this.showModal = false;
    this.isOtpSent = false;
    this.isPasswordReset = false;
    this.emailForm.reset();
    this.otpForm.reset();
    this.passwordForm.reset();
    this.errorMessage = null;
  }

  onEmailSubmit() {
    console.log(this.emailForm.value)
  
    this.authService.sendOtp(this.emailForm.value).subscribe(
      data => {
        this.toastr.show('Otp Sent Successfully', '', {
          toastClass: 'user-toast',
        });
        this.isOtpSent = true;
        this.errorMessage = '';
        this.startTimer();
      },
      (error: HttpErrorResponse) => {
        if (error.status === 404 || error.status === 400) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    );
  }

  startTimer(): void {
    const timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        const minutes = Math.floor(this.countdown / 60).toString().padStart(2, '0');
        const seconds = (this.countdown % 60).toString().padStart(2, '0');
        this.displayTime = `${minutes}:${seconds}`;
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }

  onOtpSubmit() {
    console.log(this.otpForm.value)
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      this.errorMessage = 'Please enter  OTP';
      return;
    }

    const payload = { ...this.emailForm.value, ...this.otpForm.value };
    // console.log(t)
    this.authService.verifyOtp(payload).subscribe(
      data => {
        this.toastr.show('Otp Verified Successfully', '', {
          toastClass: 'user-toast',
        });
        this.isOtpSent = false;
        this.isPasswordReset=true
        this.errorMessage = '';
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    );
  }

  onPasswordSubmit() {
    console.log(1111)
    if (this.passwordForm.value.newPassword!=this.passwordForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match or are invalid.';
      console.log(2222)
      return;
    }

    const payload = { ...this.emailForm.value, new_password: this.passwordForm.value.newPassword };
    this.authService.resetPassword(payload).subscribe(
      response => {
        this.toastr.show('Password changed successfully','suceess')
        this.closeForgotPasswordModal();
        this.router.navigate(['/login']);
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to reset password. Please try again.';
        }
      }
    );
  }
}
