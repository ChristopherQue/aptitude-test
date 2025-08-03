import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { QuotesDataClient } from '../quotes-data-client';
import { Quote } from '../models/quote';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { State } from '../models/state';
import { CommonModule } from '@angular/common';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-edit-quote',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-quote.component.html',
  styleUrl: './edit-quote.component.css'
})
export class EditQuoteComponent implements OnInit {
  private readonly quotesDataClient = inject(QuotesDataClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  quoteId: string | null = null;
  states: State[] = [];
  premium: number = 0;

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    tiv: new FormControl(0, [Validators.required, Validators.min(1)]),
    stateId: new FormControl(0, Validators.required)
  });

  ngOnInit(): void {
    // Load list of states for the dropdown
    this.quotesDataClient.getAllStates().subscribe(states => {
      this.states = states;
    });

    // Load the quote by ID from URL and patch form
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => id !== null),
      switchMap(id => {
        this.quoteId = id;
        return this.quotesDataClient.getQuoteById(id);
      })
    ).subscribe(quote => {
      this.form.patchValue({
        name: quote.name,
        tiv: quote.tiv,
        stateId: quote.stateId
      });
      this.recalculatePremium();
    });

    // Recalculate premium when tiv or state changes
    this.form.valueChanges.subscribe(() => this.recalculatePremium());
  }


  recalculatePremium(): void {
    const tiv = this.form.get('tiv')?.value ?? 0;
    const stateId = Number(this.form.get('stateId')?.value ?? 0);
    const state = this.states.find(s => s.id === stateId);

    this.premium = state && tiv > 0 ? (tiv * state.rate) / 100 : 0;
  }

  /**
   * This will call the /quotes/{id} PUT endpoint
   * What changes do you need to make here for it to work?
   */
  submit(): void {
    if (this.form.valid && this.quoteId) {
      const id = this.quoteId.toString();
      const update = {
        name: this.form.get('name')?.value ?? '',
        tiv: this.form.get('tiv')?.value ?? 0,
        stateId: Number(this.form.get('stateId')?.value ?? 0)
      };

      this.quotesDataClient.updateQuote(id, update).subscribe(() => {
        this.router.navigate(['/quotes']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/quotes']);
  }
}
