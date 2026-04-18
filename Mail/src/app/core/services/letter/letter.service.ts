// core/services/letter.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Letter } from '../../../features/mailbox/models/letter.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LetterService {

  private apiUrl = 'http://localhost:8000/api/letters';

  constructor(private http: HttpClient) {}

  getLetters(): Observable<Letter[]> {
    return this.http.get<Letter[]>(this.apiUrl);
  }

  getLetterById(id: number): Observable<Letter> {
    return this.http.get<Letter>(`${this.apiUrl}/${id}/`);
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/`, { read: true });
  }
}