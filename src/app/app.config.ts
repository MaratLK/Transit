import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ✅ Добавляем новый способ настройки HttpClient
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    provideHttpClient(), // ✅ Новый стандартный способ вместо HttpClientModule
    { provide: LOCALE_ID, useValue: 'ru' }
  ]
};
