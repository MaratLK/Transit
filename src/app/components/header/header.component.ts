import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userName = '';

  constructor(private router: Router, private authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.updateUser();
      this.authService.user$.subscribe((user: any) => {
        console.log("🔄 Обновление в HeaderComponent:", user);
        this.isLoggedIn = !!user && !!user.email;
        this.userName = user?.firstName || user?.name || 'Войти';
        console.log("isLoggedIn:", this.isLoggedIn, "userName:", this.userName);
      });
    }
  }
  
  navigateToAuth() {
    if (this.isLoggedIn) {
      console.log("🚪 Выход из учётной записи");
      this.logout();
    } else {
      console.log("🔑 Переход на страницу авторизации");
      this.router.navigate(['/auth']);
    }
  }
  
  logout() {
    console.log("🚪 Выход пользователя");
    this.authService.logout();
    this.isLoggedIn = false; // ✅ Сразу сбрасываем состояние, чтобы кнопка мгновенно изменилась
    this.router.navigate(['/auth']);
  }
  
}
