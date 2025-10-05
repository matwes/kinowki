import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

import { UserDto } from '@kinowki/shared';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private userSignal = signal<UserDto | null>(null);
  private tokenSignal = signal<string | null>(null);

  get user() {
    return this.userSignal();
  }

  get token(): string | null {
    return this.tokenSignal();
  }

  isLoggedIn = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.userSignal()?.role === 'admin');
  userName = computed(() => this.userSignal()?.name);

  constructor() {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const { user, token } = JSON.parse(saved);
      this.userSignal.set(user);
      this.tokenSignal.set(token);
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ user: UserDto; token: string }>('/api/auth/login', { email, password }).pipe(
      tap(({ user, token }) => {
        this.userSignal.set(user);
        this.tokenSignal.set(token);
        localStorage.setItem('auth', JSON.stringify({ user, token }));
      })
    );
  }

  logout() {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('auth');
  }

  register(email: string, password: string, name: string) {
    return this.http.post<{ message: string }>('/api/auth/register', { email, password, name });
  }
}
