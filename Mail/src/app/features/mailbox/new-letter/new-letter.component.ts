import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-letter',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './new-letter.component.html',
  styleUrl: './new-letter.component.css',
})
export class NewLetterComponent {

  @Output() close = new EventEmitter<void>();

  subject = "";
  content = "";

  submit() {
    // later: send to backend
    this.close.emit(); // close after sending
  }

  closeForm() {
    this.close.emit(); // close without sending
  }
}