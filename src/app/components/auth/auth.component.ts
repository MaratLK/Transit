import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule]
})
export class AuthComponent {
  isLogin = true;
  firstName = '';
  lastName = '';
  companyName = '';
  address = '';
  phoneNumber = '';
  email = '';
  password = '';

  private apiUrl = 'http://localhost:5169/api/Users';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {} // ✅ Добавляем сервис

  toggleForm() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

// auth.component.ts
login() {
  this.http.post(`${this.apiUrl}/login`, { email: this.email, password: this.password }).subscribe({
    next: (response: any) => {
      console.log('Успешный вход:', response);
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('user-info', JSON.stringify(response.user));
      console.log("Проверка localStorage после сохранения:", localStorage.getItem('user-info')); // ✅ Лог для проверки
      this.authService.updateUser();
      this.router.navigate(['/']);
    },
    error: (error) => {
      console.error('Ошибка входа:', error);
    }
  });
}

  register() {
    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      companyName: this.companyName,
      address: this.address,
      phoneNumber: this.phoneNumber,
      email: this.email,
      password: this.password
    };

    this.http.post(`${this.apiUrl}/register`, userData).subscribe({
      next: (response: any) => {
        console.log('Успешная регистрация:', response);
        localStorage.setItem('user', JSON.stringify(response));
        this.authService.updateUser(); // ✅ Обновляем состояние пользователя
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Ошибка регистрации:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
