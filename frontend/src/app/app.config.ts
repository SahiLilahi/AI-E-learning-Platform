import { HttpClientModule } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
        importProvidersFrom(HttpClientModule),  
    importProvidersFrom(FormsModule),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)
  ]
};
