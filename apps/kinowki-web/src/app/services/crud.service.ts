import { HttpClient } from '@angular/common/http';
import { Nullable } from 'primeng/ts-helpers';

export abstract class CrudService<Model, CreateDto, UpdateDto> {
  abstract name: string;

  get url() {
    return `/api/${this.name}`;
  }

  constructor(protected readonly httpClient: HttpClient) {}

  create(createDto: CreateDto) {
    return this.httpClient.post<{ message: string; data: Model }>(this.url, createDto);
  }

  update(id: string, updateDto: UpdateDto) {
    return this.httpClient.put<{ message: string; data: Model }>(`${this.url}/${id}`, updateDto);
  }

  getAll(params?: { first: Nullable<number>; rows: Nullable<number> }) {
    let url = this.url;
    if (params) {
      url += `?first=${params.first || 0}&rows=${params.rows || 20}`;
    }

    return this.httpClient.get<{
      message: string;
      data: Model[];
      totalRecords: number;
    }>(url);
  }

  get(id: string) {
    return this.httpClient.get<{ message: string; data: Model }>(`${this.url}/${id}`);
  }

  delete(id: string) {
    return this.httpClient.delete<{ message: string; data: Model }>(`${this.url}/${id}`);
  }
}
