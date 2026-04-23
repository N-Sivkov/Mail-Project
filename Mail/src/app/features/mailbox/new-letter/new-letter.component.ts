import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComposeDraft, LetterService, MailUser } from '../../../core/services/letter/letter.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-new-letter',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './new-letter.component.html',
  styleUrl: './new-letter.component.css',
})
export class NewLetterComponent {
  draft = input<ComposeDraft | null>(null);

  @Output() close = new EventEmitter<void>();
  @Output() sent = new EventEmitter<void>();

  users = signal<MailUser[]>([]);
  selectedRecipientIds = signal<number[]>([]);
  selectedCopyRecipientIds = signal<number[]>([]);
  subject = signal('');
  content = signal('');
  errorMessage = signal('');
  replyToMessageId = signal<number | null>(null);
  private lastAppliedDraft: ComposeDraft | null = null;

  constructor(
    private letterService: LetterService,
    private authService: AuthService
  ) {
    const currentUserId = this.authService.getCurrentUserId();

    this.letterService.getUsers().subscribe(users => {
      this.users.set(users.filter(user => user.id !== currentUserId));
    });

    effect(() => {
      const draft = this.draft();
      const users = this.users();

      if (!draft || draft === this.lastAppliedDraft) {
        return;
      }

      this.subject.set(draft.subject ?? '');
      this.content.set(draft.content ?? '');
      this.replyToMessageId.set(draft.replyToMessageId ?? null);
      this.selectedRecipientIds.set(this.filterExistingUsers(draft.recipientIds ?? []));
      this.selectedCopyRecipientIds.set(this.filterExistingUsers(draft.copyRecipientIds ?? []));
      this.lastAppliedDraft = draft;
    });
  }

  submit() {
    this.errorMessage.set('');

    if (!this.selectedRecipientIds().length) {
      this.errorMessage.set('Select at least one recipient.');
      return;
    }

    if (!this.subject().trim() || !this.content().trim()) {
      this.errorMessage.set('Fill in the subject and message.');
      return;
    }

    this.letterService.createLetter({
      recipientIds: this.selectedRecipientIds(),
      copyRecipientIds: this.selectedCopyRecipientIds(),
      subject: this.subject().trim(),
      content: this.content().trim(),
      read: false,
      replyToMessageId: this.replyToMessageId() ?? undefined
    }).subscribe({
      next: () => {
        this.sent.emit();
      },
      error: () => {
        this.errorMessage.set('Message could not be sent.');
      }
    });
  }

  closeForm() {
    this.close.emit();
  }

  private filterExistingUsers(userIds: number[]): number[] {
    const availableUserIds = new Set(this.users().map(user => user.id));
    return userIds.filter(userId => availableUserIds.has(userId));
  }
}
