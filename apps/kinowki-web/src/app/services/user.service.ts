import { Injectable } from '@angular/core';
import { CreateUserDto, UpdateUserDto, UserDto } from '@kinowki/shared';
import { map, Observable, of } from 'rxjs';
import { CrudService } from './crud.service';

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
}
