import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, role: string, rememberMe: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password, role });
  }

  register(email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, role });
  }

  saveToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  // ✅ Ajouts pour corriger tes erreurs
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  saveUserInfo(user: User): void {
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      return this.currentUser;
    }
    return null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}
