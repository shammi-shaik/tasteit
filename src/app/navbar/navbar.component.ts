import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Import router to navigate to different routes
import { NavbarService } from '../navbar.service';  // Import your navbar service
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],

})

export class NavbarComponent  {
  isMenuOpen = false; // Tracks the menu state
  // searchQuery: string = '';
  userName: string = '';  // Variable to hold the user's name

  constructor(private ProfileService: ProfileService,private navbarService: NavbarService, private router: Router) { }

  ngOnInit(): void {
    this.getUserProfile();  // Fetch user profile when the component initializes
  }

  getUserProfile(): void {
    this.ProfileService.getProfile().subscribe(
      (profileData:any) => {
        this.userName = profileData?.user_name || 'Profile';  // Set user name or default to 'Profile'
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  get userRole(): string | null {
    return this.navbarService.getUserRole();  // Retrieve the current user role
  }

  logout(): void {
    this.navbarService.logout();
    this.router.navigate(['/login']);  // Redirect to login page after logout
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

}
