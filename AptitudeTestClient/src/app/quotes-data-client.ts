import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Quote} from './models/quote';
import {State} from './models/state';

@Injectable({
  providedIn: 'root'
})
export class QuotesDataClient {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:5214/api/quotes';

  getAllQuotes(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.url);
  }

  getQuoteById(id: string): Observable<Quote> {
    const url = `${this.url}/${id}`;
    return this.http.get<Quote>(url);
  }

  createQuote(quote: Quote): Observable<Quote | void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Quote | void>(this.url, quote, {
      headers: headers
    });
  }

  updateQuote(id: string, quote: Partial<Quote>): Observable<Quote | void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.url}/${id}`;
    return this.http.put<Quote | void>(url, quote, {
      headers: headers
    });
  }

  getAllStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.url}/states`);
  }
}
