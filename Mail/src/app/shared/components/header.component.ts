import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { RouterModule } from '@angular/router';
import { signal } from '@angular/core';
import { Category } from '../../features/mailbox/models/category.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  categories = signal<Category[]>([
    { id: 1, name: 'Inbox', route: 'inbox' },
    { id: 2, name: 'Sent', route: 'sent' },
    { id: 3, name: 'Spam', route: 'spam' }
  ]);

  constructor(public authService: AuthService) {}
  

  logout() {
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}