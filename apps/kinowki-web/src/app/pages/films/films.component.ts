import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { alphabet } from '../../utils';

@Component({
  selector: 'app-films',
  imports: [CommonModule, SelectButtonModule, ReactiveFormsModule],
  templateUrl: './films.component.html',
  styleUrl: './films.component.sass',
})
export class FilmsComponent {
  letters = alphabet;
  form: FormGroup<{ letter: FormControl<string> }>;

  get letter() {
    return this.form.controls.letter;
  }

  constructor(private fb: NonNullableFormBuilder) {
    this.form = this.fb.group({ letter: 'A' });
  }
}
