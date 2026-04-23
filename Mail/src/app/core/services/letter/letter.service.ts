import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { Letter } from '../../../features/mailbox/models/letter.model';
import { HttpClient } from '@angular/common/http';
import { Category } from '../../../features/mailbox/models/category.model';

export interface MailUser {
  id: number;
  username: string;
}

export interface CreateLetterPayload {
  recipientIds: number[];
  copyRecipientIds?: number[];
  subject: string;
  content: string;
  read?: boolean;
  isSpam?: boolean;
  replyToMessageId?: number;
}

export interface ComposeDraft {
  recipientIds?: number[];
  copyRecipientIds?: number[];
  subject?: string;
  content?: string;
  replyToMessageId?: number;
}

export interface LetterFilters {
  senderId?: number | null;
  recipientId?: number | null;
  threadId?: number | null;
}

export interface MailThread {
  id: number;
  participants: string[];
  messageCount: number;
  lastMessageSubject: string;
}

@Injectable({
  providedIn: 'root'
})
export class LetterService {
  private apiUrl = 'http://localhost:8000/api/messages/';
  private usersApiUrl = 'http://localhost:8000/api/users/';
  private categoriesApiUrl = 'http://localhost:8000/api/categories/';
  private threadPartnersApiUrl = 'http://localhost:8000/api/thread-partners/';
  private composeDraft: ComposeDraft | null = null;
  readonly refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getLetters(categoryId?: number | null, filters?: LetterFilters): Observable<Letter[]> {
    const searchParams = new URLSearchParams();

    if (categoryId) {
      searchParams.set('category', String(categoryId));
    }

    if (filters?.senderId) {
      searchParams.set('sender', String(filters.senderId));
    }

    if (filters?.recipientId) {
      searchParams.set('recipient', String(filters.recipientId));
    }

    if (filters?.threadId) {
      searchParams.set('thread', String(filters.threadId));
    }

    const query = searchParams.toString();
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http.get<Letter[]>(url);
  }

  getLetterById(id: number): Observable<Letter> {
    return this.http.get<Letter>(`${this.apiUrl}${id}/`);
  }

  getUsers(): Observable<MailUser[]> {
    return this.http.get<MailUser[]>(this.usersApiUrl);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesApiUrl);
  }

  getThreadPartners(): Observable<MailUser[]> {
    return this.http.get<MailUser[]>(this.threadPartnersApiUrl);
  }

  getThreadsByPartner(userId: number): Observable<MailThread[]> {
    return this.http.get<MailThread[]>(`${this.threadPartnersApiUrl}${userId}/threads/`);
  }

  createLetter(payload: CreateLetterPayload): Observable<Letter> {
    return this.http.post<Letter>(this.apiUrl, payload).pipe(
      tap(() => this.refresh$.next())
    );
  }

  updateLetter(id: number, payload: Partial<CreateLetterPayload>): Observable<Letter> {
    return this.http.patch<Letter>(`${this.apiUrl}${id}/`, payload).pipe(
      tap(() => this.refresh$.next())
    );
  }

  markAsRead(id: number, read: boolean = true): Observable<Letter> {
    return this.updateLetter(id, { read });
  }

  deleteLetter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.refresh$.next())
    );
  }

  setComposeDraft(draft: ComposeDraft): void {
    this.composeDraft = draft;
  }

  consumeComposeDraft(): ComposeDraft | null {
    const draft = this.composeDraft;
    this.composeDraft = null;
    return draft;
  }
}
