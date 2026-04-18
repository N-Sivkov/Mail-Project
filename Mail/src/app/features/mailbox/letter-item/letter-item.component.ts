import { Component, signal } from '@angular/core';
import { Letter } from '../models/letter.model';
import { LetterService } from '../../../core/services/letter/letter.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    private letterService: LetterService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.letterService.getLetterById(id).subscribe(data => {
      this.letter.set(data);
    });

    this.letterService.markAsRead(id);
  }
}
