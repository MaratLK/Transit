import { Routes } from '@angular/router';
import { SliderComponent } from './components/slider/slider.component';
import { NewsComponent } from './components/news/news.component';
import { NewsPageComponent } from './components/news-page/news-page.component';

export const routes: Routes = [
  { path: '', component: SliderComponent }, // Главная страница
  { path: 'auth', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  
  // ✅ Добавляем маршруты для новостей
  { path: 'news', component: NewsComponent }, // Страница списка новостей
  { path: 'news/:id', component: NewsPageComponent }, // Страница конкретной новости
  
  { path: '**', redirectTo: '' }, // Редирект на главную, если страница не найдена
];
