import { Component, signal } from '@angular/core';
import { LetterListComponent } from './letter-list/letter-list.component';
import { NewLetterComponent } from './new-letter/new-letter.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mailbox.component',
  imports: [LetterListComponent, NewLetterComponent],
  standalone: true,
  templateUrl: './mailbox.component.html',
  styleUrl: './mailbox.component.css',
})
export class MailboxComponent {

  showInterface = signal(false);

  currentCategory = signal<string>('inbox');

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.currentCategory.set(params.get('category') || 'inbox');
    });
  }

  openInterface() {
    this.showInterface.set(true);
  }

  closeInterface() {
    this.showInterface.set(false);
  }
}
