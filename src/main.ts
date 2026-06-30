import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

try {
  const userJson = localStorage.getItem('user');
  if (userJson === 'undefined' || userJson === 'null') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
} catch (error) {
  // Silent cleanup
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
