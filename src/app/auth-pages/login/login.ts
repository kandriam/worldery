import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { AuthService, LoginData, TokenResponse } from '../../services/auth.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: 'login.html',
  styleUrls: ['../auth-pages.css', '../../../styles.css'],
})

export class Login implements OnInit {
  loginForm: FormGroup;
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      username: new FormControl(''),
      password: new FormControl(''),
    });
  }

  ngOnInit() {}

  onSubmit() {
    const data: LoginData = this.loginForm.value;
    console.log('Logging in with data:', data);
    this.authService.login(data).subscribe((res: TokenResponse | any) => {
      if (res && res.access) {
        localStorage.setItem('access_token', res.access);
        this.router.navigate(['/profile']);
      } else {
        this.error = res?.detail || 'Login failed.';
      }
    });
  }
}