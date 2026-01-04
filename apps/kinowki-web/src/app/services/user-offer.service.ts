import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserOfferService {
  private readonly httpClient = inject(HttpClient);

  name = 'user-offer';

  getUserOffers() {
    return this.httpClient.get<{
      message: string;
      data: { activeUser: string; offers: { trade: Record<string, number>; want: Record<string, number> } };
      totalRecords: number;
    }>(`${environment.apiUrl}/${this.name}`);
  }
}
