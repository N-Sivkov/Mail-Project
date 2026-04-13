// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mailbox', canActivate: [AuthGuard], loadComponent: () => import('./features/mailbox/mailbox.component').then(m => m.MailboxComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];