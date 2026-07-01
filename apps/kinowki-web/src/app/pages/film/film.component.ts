import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map, startWith, Subject, switchMap } from 'rxjs';
import { TagModule } from 'primeng/tag';

import { FilmDto } from '@kinowki/shared';
import { FilmGroupService, UserService } from '../../services';
import { GenreNamePipe, notEmpty, ImdbPipe, BigFlyerComponent, DistributorBadgeComponent } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrl: './film.component.sass',
  imports: [GenreNamePipe, TagModule, ImdbPipe, BigFlyerComponent, DistributorBadgeComponent],
})
export class FilmComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly filmGroupService = inject(FilmGroupService);
  private readonly userService = inject(UserService);

  films = signal<FilmDto[]>([]);
  usersMap = signal(new Map<string, string>());

  private refresh$ = new Subject<void>();

  ngOnInit(): void {
    this.userService
      .getUserMap()
      .pipe(untilDestroyed(this))
      .subscribe((res) => this.usersMap.set(res));
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter(notEmpty),
        switchMap((id) =>
          this.refresh$.pipe(
            startWith(void 0),
            map(() => id)
          )
        ),
        switchMap((id) => this.filmGroupService.getGroupByFilm(id)),
        untilDestroyed(this)
      )
      .subscribe((res) => this.films.set(res.data.films));
  }

  reloadFilms(): void {
    this.refresh$.next();
  }
}
