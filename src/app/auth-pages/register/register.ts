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
    const data: RegisterData = this.registerForm.value;
    console.log('Registering user with data:', data);
    // this.authService.register(data).subscribe((res: any) => {
    //   if (res && !res.error) {
    //     this.success = 'Registration successful! You can now log in.';
    //     this.error = '';
    //     this.registerForm.reset();
    //   } else {
    //     this.error = res?.error || 'Registration failed.';
    //     this.success = '';
    //   }
    // });
  }
}