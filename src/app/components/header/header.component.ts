import { Component, EventEmitter, Output, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() openRequests = new EventEmitter<void>();

  isLoggedIn = false;
  userName = '';
  isAdmin    = false; 
  public menuOpen = false;


  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.user$.subscribe(u => {
        this.isLoggedIn = !!u?.email;
        this.userName   = u?.firstName || '';
        this.isAdmin    = this.authService.isAdmin();
      });
    }
  }

  /** Нажали «Мои заявки» */
  openMyRequests() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth']);
    } else {
      this.openRequests.emit();
    }
  }

  /** Войти/выйти */
  navigateToAuth() {
    if (this.isLoggedIn) {
      this.authService.logout();
      this.router.navigate(['/auth']);
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
