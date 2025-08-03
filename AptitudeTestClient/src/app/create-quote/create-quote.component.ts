import {Component, inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {QuotesDataClient} from '../quotes-data-client';
import {Quote} from '../models/quote';
import { CommonModule, JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { State } from '../models/state';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-create-quote',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './create-quote.component.html',
  styleUrl: './create-quote.component.css'
})
export class CreateQuoteComponent implements OnInit {
  // This will give you access to the Quotes controller endpoints
  private readonly quotesDataClient = inject(QuotesDataClient);
  private readonly router = inject(Router);

  // What can you do with a list of states with the form?
  // this.quotesDataClient.getAllStates().subscribe(s => console.log(s));

  // Here is a sample of a form you can use
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    tiv: new FormControl(0, [Validators.required, Validators.min(1)]),
    stateId: new FormControl(0, Validators.required)
  });

  states: State[] = [];
  premium = 0;

  ngOnInit(): void {
    // Load state dropdown options
    this.quotesDataClient.getAllStates().subscribe(states => {
      this.states = states;
    });

    // Recalculate premium whenever TIV or state changes
    this.form.valueChanges.subscribe(() => this.recalculatePremium());
  }

  recalculatePremium(): void {
    const tiv = this.form.get('tiv')?.value ?? 0;
    const stateId = Number(this.form.get('stateId')?.value ?? 0);
    const state = this.states.find(s => s.id === stateId);
    this.premium = state && tiv > 0 ? (tiv * state.rate) / 100 : 0;
  }

  /**
   * This will call the /quotes POST endpoint
   */
  submit(): void {
    if (this.form.valid && this.premium > 0) {
      this.quotesDataClient.createQuote(this.form.value as Quote).subscribe(() => {
        this.router.navigate(['/quotes']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/quotes']);
  }
}
