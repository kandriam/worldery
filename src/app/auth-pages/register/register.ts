import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { AuthService, RegisterData } from '../../services/auth.service';
import { OnInit } from '@angular/core';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: 'register.html',
  styleUrls: ['../auth-pages.css', '../../../styles.css'],
})

export class Register implements OnInit {
  registerForm: FormGroup;
  error: string = '';
  success: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.registerForm = new FormGroup({
      username: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
    });
  }

  ngOnInit() {}

  onSubmit() {
    const formValue = this.registerForm.value;
    const data: RegisterData = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      password2: formValue.confirmPassword,
    };
    this.authService.register(data).subscribe((res: any) => {
      if (res && !res.username && !res.email && !res.password) {
        this.success = 'Registration successful! You can now log in.';
        this.error = '';
        this.registerForm.reset();
        this.router.navigate(['/login']);
      } else {
        this.error = res?.username?.[0] || res?.email?.[0] || res?.password?.[0] || res?.detail || 'Registration failed.';
        this.success = '';
      }
    });
  }
}