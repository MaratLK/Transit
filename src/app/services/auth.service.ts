import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl    = 'https://localhost:5001/api/Users';
  private tokenKey  = 'auth-token';
  private userKey   = 'user-info';
  private userSubject = new BehaviorSubject<any|null>(this.getUserFromLocalStorage());
  public  user$      = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.updateUser();
    }
  }

  private getUserFromLocalStorage(): any|null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const j = localStorage.getItem(this.userKey);
    return j ? JSON.parse(j) : null;
  }

  public updateUser() {
    this.userSubject.next(this.getUserFromLocalStorage());
  }

  /** 
   * Декодирует base64url (JWT payload) в строку.
   * Заменяет URL-безопасные символы, добавляет padding и вызывает atob.
   */
  private decodeBase64Url(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad === 2) base64 += '==';
    else if (pad === 3) base64 += '=';
    else if (pad !== 0) throw new Error('Invalid base64url string');
    return atob(base64);
  }

  /**
   * Извлекает роль пользователя из payload JWT.
   */
  getUserRole(): string {
    const token = this.getToken() || '';
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('❌ Невалидный формат токена:', token);
      return '';
    }
    try {
      const decoded = this.decodeBase64Url(parts[1]);
      const payload = JSON.parse(decoded);
      return payload['role'] || '';
    } catch (e) {
      console.error('❌ Ошибка при декодировании токена:', e);
      return '';
    }
  }

  private saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem(this.tokenKey)
      : null;
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Логин: получает token и user, сохраняет их, а затем подгружает полный профиль.
   */
  login(creds: { email: string; password: string }): Observable<any> {
    return this.http
      .post<{ token: string; user: any }>(`${this.apiUrl}/login`, creds)
      .pipe(
        tap(r => {
          if (r.token) {
            this.saveToken(r.token);
            localStorage.setItem(this.userKey, JSON.stringify(r.user));
            this.userSubject.next(r.user);
          } else {
            console.error('❌ В ответе /login отсутствует поле token:', r);
          }
        }),
        switchMap(() =>
          this.http.get<any>(`${this.apiUrl}/profile`, {
            headers: this.getAuthHeaders()
          })
        ),
        tap(profile => {
          localStorage.setItem(this.userKey, JSON.stringify(profile));
          this.userSubject.next(profile);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      this.userSubject.next(null);
      console.log("🚪 Пользователь вышел из системы");
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  getUser(): any|null {
    return this.userSubject.value;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }
}
