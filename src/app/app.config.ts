import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

// Registrar locale español de Colombia
registerLocaleData(localeCo, 'es-CO');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor, loadingInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(MatNativeDateModule),
    { provide: LOCALE_ID, useValue: 'es-CO' } // Colombia usa punto como separador de miles
  ]
};
