import { Component, OnInit, signal } from '@angular/core';
import { LetterListComponent } from './letter-list/letter-list.component';
import { NewLetterComponent } from './new-letter/new-letter.component';
import { ActivatedRoute } from '@angular/router';
import { ComposeDraft, LetterService } from '../../core/services/letter/letter.service';

@Component({
  selector: 'app-mailbox.component',
  imports: [LetterListComponent, NewLetterComponent],
  standalone: true,
  templateUrl: './mailbox.component.html',
  styleUrl: './mailbox.component.css',
})
export class MailboxComponent implements OnInit {

  showInterface = signal(false);
  currentFilter = signal('inbox');
  composeDraft = signal<ComposeDraft | null>(null);

  constructor(
    private route: ActivatedRoute,
    private letterService: LetterService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.currentFilter.set(params.get('filter') ?? 'inbox');
    });

    const draft = this.letterService.consumeComposeDraft();
    if (draft) {
      this.composeDraft.set(draft);
      this.showInterface.set(true);
    }
  }

  openInterface() {
    this.showInterface.set(true);
  }

  closeInterface() {
    this.showInterface.set(false);
    this.composeDraft.set(null);
  }

  onLetterSent() {
    this.closeInterface();
  }
}
