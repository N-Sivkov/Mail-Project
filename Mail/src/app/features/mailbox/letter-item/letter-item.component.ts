import { Component, signal } from '@angular/core';
import { Letter } from '../models/letter.model';
import { LetterService } from '../../../core/services/letter/letter.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-letter-item.component',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './letter-item.component.html',
  styleUrl: './letter-item.component.css',
})
export class LetterItemComponent {
  letter = signal<Letter | undefined>(undefined);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private letterService: LetterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.letterService.getLetterById(id).subscribe(data => {
      this.letter.set(data);
    });

    this.letterService.markAsRead(id).subscribe(updatedLetter => {
      this.letter.set(updatedLetter);
    });
  }

  toggleReadStatus() {
    const currentLetter = this.letter();

    if (!currentLetter) {
      return;
    }

    this.letterService
      .markAsRead(currentLetter.id, !currentLetter.read)
      .subscribe(updatedLetter => {
        this.letter.set(updatedLetter);
      });
  }

  deleteLetter() {
    const currentLetter = this.letter();

    if (!currentLetter) {
      return;
    }

    this.letterService.deleteLetter(currentLetter.id).subscribe(() => {
      this.router.navigate(['/mailbox']);
    });
  }

  sendReply() {
    const currentLetter = this.letter();

    if (!currentLetter) {
      return;
    }

    this.letterService.setComposeDraft({
      recipientIds: [currentLetter.senderId],
      subject: `Re: ${currentLetter.subject}`,
      content: '',
      replyToMessageId: currentLetter.id
    });

    this.router.navigate(['/mailbox']);
  }

  forwardLetter() {
    const currentLetter = this.letter();

    if (!currentLetter) {
      return;
    }

    this.letterService.setComposeDraft({
      subject: currentLetter.subject,
      content: `Forwarded from ${currentLetter.sender} (${currentLetter.date})\n\n${currentLetter.content}`
    });

    this.router.navigate(['/mailbox']);
  }

  toggleSpamStatus() {
    const currentLetter = this.letter();

    if (!currentLetter) {
      return;
    }

    this.letterService
      .updateLetter(currentLetter.id, { isSpam: !currentLetter.isSpam })
      .subscribe(updatedLetter => {
        this.letter.set(updatedLetter);
      });
  }

  canReply(): boolean {
    const currentLetter = this.letter();
    const currentUserId = this.authService.getCurrentUserId();
    const currentUsername = this.authService.getCurrentUsername();

    if (!currentLetter) {
      return false;
    }

    if (!currentLetter.copyRecipientIds.length && !currentLetter.copyRecipients.length) {
      return true;
    }

    if (currentUserId !== null) {
      return !currentLetter.copyRecipientIds.includes(currentUserId);
    }

    if (currentUsername) {
      return !currentLetter.copyRecipients.includes(currentUsername);
    }

    return true;
  }
}
