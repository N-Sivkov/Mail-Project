import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { RouterModule } from '@angular/router';
import { signal } from '@angular/core';
import { Category } from '../../features/mailbox/models/category.model';
import { LetterService } from '../../core/services/letter/letter.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  categories = signal<Category[]>([]);

  constructor(
    public authService: AuthService,
    private letterService: LetterService
  ) {
    if (this.authService.isAuthenticated()) {
      this.letterService.getCategories().subscribe(categories => {
        this.categories.set(categories);
      });
    }
  }
  

  logout() {
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUsername(): string {
    return this.authService.getCurrentUsername();
  }
}
