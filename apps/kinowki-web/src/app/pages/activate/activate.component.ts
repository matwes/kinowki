import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.sass',
})
export class ActivateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  loading = true;
  success = false;
  error = '';

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Brakuje tokena do aktywacji.';
      this.loading = false;
      return;
    }

    this.http.get(`/api/auth/activate?token=${token}`).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/ulotki']), 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Link aktywacyjny jest błędny lub stracił ważność.';
        this.loading = false;
      },
    });
  }
}
