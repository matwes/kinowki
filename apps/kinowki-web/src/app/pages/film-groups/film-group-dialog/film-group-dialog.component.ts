import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

import { FilmGroupDto } from '@kinowki/shared';

@Component({
  selector: 'app-film-group-dialog',
  templateUrl: './film-group-dialog.component.html',
  styleUrl: './film-group-dialog.component.sass',
  imports: [
    ButtonModule,
    CommonModule,
    DatePickerModule,
    IftaLabelModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectModule,
  ],
})
export class FilmGroupDialogComponent implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig<{ item: FilmGroupDto }>);
  private readonly fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    name: [undefined as unknown as string, Validators.required],
  });

  get name() {
    return this.form.controls.name;
  }

  ngOnInit(): void {
    if (this.config.data) {
      const group = this.config.data.item;

      if (group) {
        this.name.setValue(group.name);
      }
    }
  }

  onCancel() {
    this.ref.close();
  }

  onSave() {
    if (this.form.valid) {
      this.ref.close(this.getFromForm());
    } else {
      this.form.markAllAsTouched();
    }
  }

  private getFromForm(): Partial<FilmGroupDto> {
    return {
      name: this.name.value,
    };
  }
}
