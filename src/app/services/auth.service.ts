import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface UserInfo {
    id: string;
    username: string;
    email: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
    pronouns: string;
    bio: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
    private baseUrl = 'http://localhost:8000/auth';  // base URL
    
    // Specific endpoints
    registerUrl = `${this.baseUrl}/register/`;
    loginUrl = 'http://localhost:8000/auth/login/';
    profileUrl = `${this.baseUrl}/profile/`;
    userUrl = `${this.baseUrl}/user/`;

    constructor(private router: Router, private http: HttpClient) {}

    register(data: RegisterData): Observable<any> {
        return this.http.post(this.registerUrl, data).pipe(
            catchError(err => of(err.error))
        );
    }

    login(data: LoginData): Observable<TokenResponse | any> {
        return this.http.post<TokenResponse>(this.loginUrl, data).pipe(
            catchError(err => of(err.error))
        );
    }

    getProfile(): Observable<UserInfo | null> {
        const token = localStorage.getItem('access_token');
        if (!token) return of(null);
        return this.http.get<UserInfo>(this.profileUrl, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(
            catchError(() => of(null))
        );
    }

    getCurrentUser(): Observable<UserInfo | null> {
        const token = localStorage.getItem('access_token');
        if (!token) return of(null);
        return this.http.get<UserInfo>(this.userUrl, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(
            catchError(() => of(null))
        );
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('access_token');
    }

    getFullProfile(): Observable<UserProfile | null> {
        const token = localStorage.getItem('access_token');
        if (!token) return of(null);
        return this.http.get<UserProfile>(this.profileUrl, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(
            catchError(() => of(null))
        );
    }

    updateProfile(data: Partial<UserProfile>): Observable<UserProfile | null> {
        const token = localStorage.getItem('access_token');
        if (!token) return of(null);
        return this.http.patch<UserProfile>(this.profileUrl, data, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(
            catchError(() => of(null))
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
    }
}