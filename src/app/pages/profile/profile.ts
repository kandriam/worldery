import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, UserInfo, UserProfile } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { Subscription, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: 'profile.html',
  styleUrls: ['./profile.css', '../pages.css', '../../../styles.css'],
})
export class Profile implements OnInit, OnDestroy {
  user: UserInfo | null = null;
  profile: UserProfile | null = null;
  saveSuccess = false;
  saveError = '';

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(1)]),
    email: new FormControl('', [Validators.email]),
    first_name: new FormControl(''),
    last_name: new FormControl(''),
    display_name: new FormControl(''),
    pronouns: new FormControl(''),
    bio: new FormControl(''),
  });

  private autoSaveSubscription?: Subscription;
  settingsService = inject(SettingsService);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadProfile();
    });

    this.autoSaveSubscription = this.profileForm.valueChanges.pipe(debounceTime(1500)).subscribe(() => {
      if (this.settingsService.getCurrentSettings().autoSave && this.profile) {
        this.saveProfile();
      }
    });
  }

  ngOnDestroy() {
    this.autoSaveSubscription?.unsubscribe();
  }

  private loadProfile() {
    this.authService.getFullProfile().subscribe(profile => {
      if (!profile) return;
      this.profile = profile;
      this.profileForm.patchValue({
        username: profile.username,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        pronouns: profile.pronouns,
        bio: profile.bio,
      }, { emitEvent: false });
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    const data = this.profileForm.value as Partial<UserProfile>;
    this.authService.updateProfile(data).subscribe(updated => {
      if (updated) {
        this.profile = updated;
        this.saveSuccess = true;
        this.saveError = '';
        setTimeout(() => this.saveSuccess = false, 2500);
      } else {
        this.saveError = 'Failed to save profile. Please try again.';
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}