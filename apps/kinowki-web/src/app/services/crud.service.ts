import { HttpClient, HttpParams } from '@angular/common/http';
import { TableLazyLoadEvent } from 'primeng/table';
import { notEmpty } from '../utils';

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

  getAll(params?: TableLazyLoadEvent) {
    return this.httpClient.get<{
      message: string;
      data: Model[];
      totalRecords: number;
    }>(this.url, { params: this.buildQueryParams(params) });
  }

  get(id: string) {
    return this.httpClient.get<{ message: string; data: Model }>(`${this.url}/${id}`);
  }

  delete(id: string) {
    return this.httpClient.delete<{ message: string; data: Model }>(`${this.url}/${id}`);
  }

  private buildQueryParams(params?: TableLazyLoadEvent): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    if (params.first != null) {
      httpParams = httpParams.set('first', params.first.toString());
    }
    if (params.rows != null) {
      httpParams = httpParams.set('rows', params.rows.toString());
    }
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, meta]) => {
        if (Array.isArray(meta)) {
          httpParams = httpParams.set(field, JSON.stringify(meta.map((m) => m.value).filter(notEmpty)));
        } else if (meta?.value != null) {
          httpParams = httpParams.set(field, String(meta.value));
        }
      });
    }

    return httpParams;
  }
}
