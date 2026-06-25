import { Injectable } from '@angular/core';
import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { map, Observable, of } from 'rxjs';
import { CrudService } from './crud.service';

interface UserSettings {
  name: string;
  email: string;
  city: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends CrudService<UserDto, CreateUserDto, UpdateUserDto> {
  name = 'user';

  private userNameMap: Map<string, string> | null = null;
  private loadingPromise: Observable<Map<string, string>> | null = null;

  getUserMap() {
    if (this.userNameMap) {
      return of(this.userNameMap);
    }

    if (!this.loadingPromise) {
      this.loadingPromise = this.getAll().pipe(
        map((res) => {
          const map = new Map<string, string>();
          res.data.forEach((u) => map.set(u._id, u.name));
          this.userNameMap = map;
          return map;
        })
      );
    }

    return this.loadingPromise;
  }

  getMe() {
    return this.httpClient.get<{ message: string; data: UserSettings }>(`${this.url}/me`);
  }

  updateMe(updateDto: Partial<UserSettings>) {
    return this.httpClient.put<{ message: string }>(`${this.url}/me`, updateDto);
  }
}
