import { computed, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LetterFilters,
  LetterService,
  MailThread,
  MailUser
} from '../../../core/services/letter/letter.service';
import { Letter } from '../models/letter.model';
import { Category } from '../models/category.model';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-letter-list',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './letter-list.component.html',
  styleUrl: './letter-list.component.css',
})
export class LetterListComponent {
  filter = input('inbox');

  letters = signal<Letter[]>([]);
  users = signal<MailUser[]>([]);
  categories = signal<Category[]>([]);
  threadPartners = signal<MailUser[]>([]);
  availableThreads = signal<MailThread[]>([]);

  senderId = signal('');
  recipientId = signal('');
  threadPartnerId = signal('');
  threadId = signal('');
  activeFilters = signal<LetterFilters>({});
  refreshVersion = signal(0);

  visibleLetters = computed(() => this.letters());
  categoriesLoaded = computed(() => this.categories().length > 0);
  showThreadSelector = computed(
    () => !!this.threadPartnerId() && this.availableThreads().length > 0
  );

  private readonly currentUserId: number | null;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private letterService: LetterService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadUsers();
    this.loadCategories();
    this.loadThreadPartners();

    this.letterService.refresh$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshVersion.update(value => value + 1);
        this.loadThreadPartners();
      });

    effect((onCleanup) => {
      if (!this.categoriesLoaded()) {
        return;
      }

      const categoryId = this.categories().find(
        category => category.route === this.filter()
      )?.id ?? null;
      const filters = this.activeFilters();
      this.refreshVersion();

      const subscription = this.letterService.getLetters(categoryId, filters).subscribe(data => {
        this.letters.set(data);
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  truncate(text: string, limit: number = 50): string {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }

  toggleSpam(letter: Letter, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.letterService.updateLetter(letter.id, { isSpam: !this.isSpamFilter() }).subscribe();
  }

  isSpamFilter(): boolean {
    return this.filter() === 'spam';
  }

  canToggleSpam(): boolean {
    return this.filter() === 'inbox' || this.filter() === 'spam';
  }

  canToggleSpamForLetter(letter: Letter): boolean {
    const currentUserId = this.currentUserId ?? -1;
    return (
      this.canToggleSpam() &&
      (
        letter.recipientIds.includes(currentUserId) ||
        letter.copyRecipientIds.includes(currentUserId)
      )
    );
  }

  applyFilters() {
    this.activeFilters.set({
      senderId: this.parseNumericFilter(this.senderId()),
      recipientId: this.parseNumericFilter(this.recipientId()),
      threadId: this.parseNumericFilter(this.threadId()),
    });
  }

  resetFilters() {
    this.senderId.set('');
    this.recipientId.set('');
    this.threadPartnerId.set('');
    this.threadId.set('');
    this.availableThreads.set([]);
    this.activeFilters.set({});
  }

  onThreadPartnerChange() {
    this.threadId.set('');

    const partnerId = this.parseNumericFilter(this.threadPartnerId());
    if (partnerId === null) {
      this.availableThreads.set([]);
      return;
    }

    this.letterService.getThreadsByPartner(partnerId).subscribe(threads => {
      this.availableThreads.set(threads);
    });
  }

  shouldShowThreadSelector(): boolean {
    return this.showThreadSelector();
  }

  threadLabel(thread: MailThread): string {
    const subject = thread.lastMessageSubject || 'Untitled thread';
    return `${subject} (${thread.messageCount})`;
  }

  private loadUsers() {
    this.letterService.getUsers().subscribe(users => {
      this.users.set(users);
    });
  }

  private loadCategories() {
    this.letterService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  private loadThreadPartners() {
    this.letterService.getThreadPartners().subscribe(users => {
      this.threadPartners.set(users);
    });
  }

  private parseNumericFilter(value: string): number | null {
    if (!value) {
      return null;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? null : numericValue;
  }
}
