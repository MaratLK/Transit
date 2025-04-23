import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5169/api/Users';
  private tokenKey = 'auth-token';
  private userKey = 'user-info';

  private userSubject = new BehaviorSubject<any>(this.getUserFromLocalStorage());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.updateUser(); // Гарантируем обновление пользователя при загрузке
    }
  }

  private getUserFromLocalStorage(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem(this.userKey);
      console.log("📦 Данные из localStorage:", user);
      return user ? JSON.parse(user) : {}; // Возвращаем пустой объект вместо null
    }
    return {}; // В случае SSR (если мы на сервере)
  }

  updateUser() {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getUserFromLocalStorage();
      console.log("🔄 Обновляем пользователя в сервисе:", user);
      this.userSubject.next(user || {}); // Гарантируем обновление
    }
  }

  getUserRole(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return ""; // Если не в браузере, возвращаем пустую строку
    }

    const token = localStorage.getItem(this.tokenKey);
    if (!token) return "";

    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1])); // Декодируем JWT
      console.log("🔍 Декодированный токен:", tokenPayload);
      return tokenPayload["role"] || ""; // Проверяем ключ, возможно, он у тебя называется по-другому
    } catch (error) {
      console.error("❌ Ошибка при декодировании токена:", error);
      return "";
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (isPlatformBrowser(this.platformId) && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          console.log("✅ Сохранен пользователь в localStorage:", response.user);
          this.updateUser();
        }
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

  getUser(): any {
    return this.getUserFromLocalStorage();
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  isAdmin(): boolean {
    return this.getUserRole() === "Admin";
  }
}
