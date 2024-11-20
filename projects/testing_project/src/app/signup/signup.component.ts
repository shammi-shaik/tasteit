import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { AuthService } from 'projects/auth.service';
import { SignupService } from 'projects/signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  customerSignUpForm!: FormGroup;
  customerLoginForm!:FormGroup;
  errorMessage:string=''
  users!:any
  user_id :any
  listusers: any[] = [];
  isDisplay:boolean = false

  constructor( private fb :FormBuilder, private signupService:SignupService ,private authService:AuthService,private router:Router) { }

  ngOnInit(): void {
    this.customerSignUpForm = this.fb.group({
      userName :['',[Validators.required]],
      userEmail:['',[Validators.required]],
      userPassword:['',[Validators.required]],
      userPhone:['',[Validators.required]],
      userAddress:['',[Validators.required]]
    })
    this.customerLoginForm = this.fb.group({
      userEmail:['',[Validators.required]],
      userPassword:['',[Validators.required]]
    })
  }

  onCustomerSubmit():void{
    if(this.customerSignUpForm.valid){
      const customerData ={
        user_name:this.customerSignUpForm.value.userName,
        email : this.customerSignUpForm.value.userEmail,
        password:this.customerSignUpForm.value.userPassword,
        phone:this.customerSignUpForm.value.userPhone,
        address:this.customerSignUpForm.value.userAddress
      };
      this.signupService.signUp(customerData).subscribe(
        ()=>{
          console.log(customerData);
          
          console.log("data sent successfully");
          
        },
       (error)=>{
        if(error.status===400){
          this.errorMessage= error.error.message
          console.log("failed signup");
          
        }
      }
        );
        
       }

    }


    onCustomerLogin():void{
      if(this.customerLoginForm.valid){
        const customerData ={
          email : this.customerLoginForm.value.userEmail,
          password:this.customerLoginForm.value.userPassword,
        };
        this.authService.login(customerData).subscribe(
          ()=>{
            console.log(customerData);
            
            console.log("login successfully");
            
          },
         (error)=>{
          if(error.status===400){
            this.errorMessage= error.error.message
            console.log("failed signup");
            
          }
        }
          );
          
         }
  
      }
      navigateToLogin():void{
        this.router.navigate(['/forgot']);
      }
  

    getDetails():void{
      this.isDisplay= true
      this.signupService.getUser().subscribe(
      data=>{
        this.users=data
      console.log(this.users  .email);
      },
      error=>console.error(error)
      )
      }

      getlistUser():void{
        this.isDisplay= true
        this.signupService.getlistUser().subscribe(
        data=>{
          this.listusers=data
          console.log(this.users);
          
        },
        error=>console.error(error)
        )
        }
}
  
// interface User{
//   user_id:string;
//   user_name:string;
//   email:string;
//   phone:string;
//   address:string;
// }




