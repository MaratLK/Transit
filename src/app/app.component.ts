import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SocialIconsComponent } from './components/social-icons/social-icons.component';
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { StatsComponent } from './components/stats/stats.component';
import { NewsComponent } from './components/news/news.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SocialIconsComponent,
    ServicesComponent,
    AboutComponent,
    StatsComponent,
    NewsComponent,
    FooterComponent,
    RouterModule
  ],
})
export class AppComponent {
  title = 'Transit';
  isAuthPage = false;
  isNewsPage = false; // ✅ Флаг для скрытия секций на странице новости

  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.url === '/auth';
      this.isNewsPage = event.url.startsWith('/news/'); // ✅ Проверяем, если URL начинается с /news/
    });
  }
}
