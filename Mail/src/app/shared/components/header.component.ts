import { Component, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { RouterModule } from '@angular/router';
import { Category } from '../../features/mailbox/models/category.model';
import { CategoryService } from '../../core/services/category/category.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  categories = signal<Category[]>([]);

  constructor(public authService: AuthService, private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories.set(data);
    });
  }

  logout() {
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}