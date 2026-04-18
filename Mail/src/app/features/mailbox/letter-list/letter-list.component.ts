import { Component, OnInit } from '@angular/core';
import { LetterService } from '../../../core/services/letter/letter.service';
import { Letter } from '../models/letter.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-letter-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './letter-list.component.html',
  styleUrl: './letter-list.component.css',
})
export class LetterListComponent implements OnInit {

  letters: Letter[] = [];

  constructor(private letterService: LetterService) {}

  ngOnInit() {
    this.letterService.getLetters().subscribe(data => {
      this.letters = data;
    });
  }

  truncate(text: string, limit: number = 50): string {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }
}