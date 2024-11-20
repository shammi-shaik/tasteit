import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { empty } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = new AuthService();
  });
  service =TestBed.inject(AuthService); //di to get instance of auth service


  afterEach(() => {
    localStorage.removeItem('token')
  });

  it('should return true  if therre is no token ',() =>{
    localStorage.setItem('token','12134')
    expect(service.isAuthenticated()).toBeTruthy();

  });

  it('should return false if therre is no token ',() =>{
    localStorage.removeItem('token'); // Ensure token is removed  
    expect(service.isAuthenticated()).toBeFalsy ();

  });
});
