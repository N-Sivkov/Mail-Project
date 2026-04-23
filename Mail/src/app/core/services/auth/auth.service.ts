import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';
  private tokenKey = 'auth_token';
  private usernameKey = 'auth_username';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, data).pipe(
      tap((res: any) => {
        this.setToken(res.access);
        this.setUsername(data.username);
      })
    );
  }

  signup(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/`, data);
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUserId(): number | null {
    const payload = this.getTokenPayload();
    return typeof payload?.['user_id'] === 'number' ? payload['user_id'] : null;
  }

  getCurrentUsername(): string {
    return localStorage.getItem(this.usernameKey) ?? '';
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
  }

  private getTokenPayload(): Record<string, unknown> | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '='
      );
      const decodedPayload = atob(paddedPayload);
      return JSON.parse(decodedPayload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
