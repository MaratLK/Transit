import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { SocialIconsComponent } from './components/social-icons/social-icons.component';
import { ServicesComponent } from './components/services/services.component';
import { AboutComponent } from './components/about/about.component';
import { StatsComponent } from './components/stats/stats.component';
import { NewsComponent } from './components/news/news.component';
import { FooterComponent } from './components/footer/footer.component';
import { MyRequestsModalComponent } from './components/my-requests-modal/my-requests-modal.component';

import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    MyRequestsModalComponent,
    ServicesComponent,
    AboutComponent,
    StatsComponent,
    NewsComponent,
    SocialIconsComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuthPage = false;
  isNewsPage = false;
  showMyRequests = false;
  isAdmin = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.isAuthPage = e.urlAfterRedirects === '/auth';
      this.isNewsPage = e.urlAfterRedirects.startsWith('/news/');
      this.isAdmin = this.authService.isAdmin();
    });
  }

  openMyRequests() {
    this.showMyRequests = true;
  }

  closeMyRequests() {
    this.showMyRequests = false;
  }
}
