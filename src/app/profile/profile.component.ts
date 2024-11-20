import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  errorMessage: string | null = null;
  isEditing: boolean = false;

  constructor(private profileService: ProfileService, private fb: FormBuilder) {
    // Initialize the form group with empty controls
    this.profileForm = this.fb.group({
      user_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getProfileDetails();
  }

  // Method to fetch user profile details and populate the form
  getProfileDetails(): void {
    this.profileService.getProfile().subscribe(
      (response: any) => {
        this.profileForm.patchValue({
          user_name: response.user_name,
          email: response.email,
          phone_number: response.phone_number
        });
      },
      (error) => {
        console.error('Failed to fetch user profile:', error);
        this.errorMessage = 'Failed to load profile details. Please try again later.';
      }
    );
  }

  // Method to toggle edit mode
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form values if editing is canceled
      this.getProfileDetails();
    }
  }

  // Method to handle form submission and save profile data
  saveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Form data:', this.profileForm.value);
      this.profileService.saveProfile(this.profileForm.value).subscribe(
        (response) => {
          console.log('Profile saved successfully:', response);
          this.errorMessage = null;
          this.isEditing = false; // Exit editing mode after saving
        },
        (error) => {
          console.error('Failed to save user profile:', error);
          this.errorMessage = 'Failed to save profile details. Please try again later.';
        }
      );
    }
  }
}
