import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UnmarkedFlyersService {
  private readonly httpClient = inject(HttpClient);

  private readonly name = 'unmarked-flyers';

  getTotal() {
    return this.httpClient.get<{ message: string; data: number }>(`${environment.apiUrl}/${this.name}`);
  }

  markAsWanted() {
    return this.httpClient.post<{ message: string; data: number }>(`${environment.apiUrl}/${this.name}`, {});
  }
}
