import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { AuthService, UserInfo } from '../../services/auth.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: 'profile.html',
  styleUrls: ['../../../styles.css'],
})

export class Profile implements OnInit {
  user: UserInfo | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}