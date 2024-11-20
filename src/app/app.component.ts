import { asNativeElements, Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tasteit';
  
  // Inject Router to check the current route
  constructor(private router: Router) {}

  //  // Check if the current route is in the list of routes where navbar/footer should be hidden
  shouldHideNavAndFooter(): boolean {
    return this.router.url === '/login' ||
     this.router.url === '/signup' || 
     this.router.url === '/forgot-pwd' ||
     this.router.url === '/Admin';
  }
}
 



  



  