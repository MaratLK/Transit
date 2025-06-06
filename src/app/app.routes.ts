import { Routes } from '@angular/router';
import { SliderComponent } from './components/slider/slider.component';
import { NewsComponent } from './components/news/news.component';
import { NewsPageComponent } from './components/news-page/news-page.component';

export const routes: Routes = [
  { path: '', component: SliderComponent }, 
  { path: 'auth', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'news', component: NewsComponent }, 
  { path: 'news/:id', component: NewsPageComponent },
  { path: '**', redirectTo: '' }, 
];
