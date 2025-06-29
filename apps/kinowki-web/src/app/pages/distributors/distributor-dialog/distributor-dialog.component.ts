import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

import { DistributorDto } from '@kinowki/shared';

@Component({
  selector: 'app-distributor-dialog',
  templateUrl: './distributor-dialog.component.html',
  styleUrl: './distributor-dialog.component.sass',
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
export class DistributorDialogComponent implements OnInit {
  form = this.fb.group({
    _id: [{ value: undefined as unknown as string, disabled: true }],
    name: [undefined as unknown as string, Validators.required],
  });

  get _id() {
    return this.form.controls._id;
  }

  get name() {
    return this.form.controls.name;
  }

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig<{ item: DistributorDto }>,
    private readonly fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {
    if (this.config.data) {
      const distributor = this.config.data.item;

      if (distributor) {
        this._id.setValue(distributor._id);
        this.name.setValue(distributor.name);
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

  private getFromForm(): Partial<DistributorDto> {
    return {
      _id: this._id.value,
      name: this.name.value,
    };
  }
}
