import {Component, ViewEncapsulation, inject} from '@angular/core';
import {QuotesDataClient} from '../quotes-data-client';
import {AsyncPipe, CurrencyPipe, NgClass} from '@angular/common';
import {Quote} from '../models/quote';
import {RouterLink} from '@angular/router';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-quotes-list',
  imports: [
    AsyncPipe,
    NgClass,
    RouterLink,
    CurrencyPipe
  ],
  templateUrl: './quotes-list.component.html',
  styleUrl: './quotes-list.component.css'
})
export class QuotesListComponent {
  quotes$ = inject(QuotesDataClient).getAllQuotes();
}
