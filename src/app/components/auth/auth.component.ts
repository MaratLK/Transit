import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskDirective
  ],
  providers: [provideNgxMask()]
})
export class AuthComponent {
  isLogin = true;
  message = '';
  messageType: 'success' | 'error' = 'success';

  firstName = '';
  lastName = '';
  companyName = '';
  address = '';
  phoneNumber = '';
  email = '';
  password = '';

  private apiUrl = 'https://localhost:5001/api/Users';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.message = '';
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;
    this.isLogin ? this.login() : this.register();
  }

  private login() {
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.messageType = 'success';
          this.message = 'Вход выполнен успешно';
          setTimeout(() => this.router.navigate(['/']), 1500);
        },
        error: err => {
          this.messageType = 'error';
          this.message = 'Неверная почта или пароль';
        }
      });
  }

  private register() {
    const rawPhone = this.phoneNumber.replace(/\D/g, '');
  
    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      companyName: this.companyName,
      address: this.address,
      phoneNumber: rawPhone,
      email: this.email,
      password: this.password
    };
  
    this.http.post(`${this.apiUrl}/register`, userData)
      .subscribe({
        next: (resp: any) => {
          localStorage.setItem('user', JSON.stringify(resp));
          this.authService.updateUser();
          this.messageType = 'success';
          this.message = 'Регистрация прошла успешно, войдите в аккаунт';
          setTimeout(() => this.toggleForm(), 2000);
        },
        error: (err) => {
          let msg = 'Ошибка регистрации, попробуйте позже';
          if (err.error) {
            if (err.error.errors) {
              msg = Object.values(err.error.errors)
                .flat()
                .join(' ');
            } else if (typeof err.error === 'string') {
              msg = err.error;
            }
          }
          this.messageType = 'error';
          this.message = msg;
          console.error('Registration error response:', err);
        }
      });
  }  

  goBack() {
    this.router.navigate(['/']);
  }
}
