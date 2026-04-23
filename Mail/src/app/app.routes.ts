import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { AuthGuard } from './core/guards/auth-guard';
import { MailboxComponent } from './features/mailbox/mailbox.component';
import { LetterItemComponent } from './features/mailbox/letter-item/letter-item.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mailbox', canActivate: [AuthGuard], component: MailboxComponent },
  { path: 'mailbox/letters/:id', canActivate: [AuthGuard], component: LetterItemComponent },
  { path: 'mailbox/:filter', canActivate: [AuthGuard], component: MailboxComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
