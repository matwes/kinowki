import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FlyerService } from '../../services';
import { ReleaseDatePipe } from '../../utils';

interface Flyer {
  title: string;
  year: number;
  image: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass',
  imports: [FormsModule, RouterModule, ReleaseDatePipe],
})
export class HomeComponent {
  private readonly CDN_URL = environment.cdnUrl;

  searchQuery = '';

  constructor(private router: Router, private flyerService: FlyerService) {}

  search(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      return;
    }

    this.router.navigate(['/ulotki'], {
      queryParams: {
        p: 0,
        nazwa: query,
      },
    });
  }

  goToDatabase(): void {
    this.router.navigate(['/ulotki']);
  }

  goToReleases(): void {
    this.router.navigate(['/premiery']);
  }

  features = [
    {
      icon: 'pi pi-bookmark',
      title: 'Twórz kolekcję',
      description: 'Oznaczaj ulotki, które posiadasz i twórz swoją kolekcję.',
    },
    {
      icon: 'pi pi-arrow-right-arrow-left',
      title: 'Wymieniaj się',
      description: 'Nawiązuj kontakty z innymi kolekcjonerami i wymieniaj się ulotkami.',
    },
    {
      icon: 'pi pi-bell',
      title: 'Bądź na bieżąco',
      description: 'Śledź najnowsze ulotki dodane do bazy.',
    },
  ];

  stats = [
    {
      icon: 'pi pi-video',
      value: '9700+',
      label: 'filmów',
    },
    {
      icon: 'pi pi-th-large',
      value: '9000+',
      label: 'ulotek',
    },
    {
      icon: 'pi pi-globe',
      value: '200+',
      label: 'dystrybutorów',
    },
    {
      icon: 'pi pi-users',
      value: '30+',
      label: 'użytkowników',
    },
  ];

  heroFlyers: Flyer[] = [
    {
      title: 'Pulp Fiction',
      year: 1994,
      image: 'https://cdn.kinowki.pl/2006/12/Pulp-Fiction-Ulotka-1th.jpg',
    },
    {
      title: 'Iron Man',
      year: 2008,
      image: 'https://cdn.kinowki.pl/2008/04/Iron-Man-Ulotka-1th.jpg',
    },
    {
      title: 'Titanic',
      year: 1997,
      image: 'https://cdn.kinowki.pl/1998/02/Titanic-Ulotka-1th.jpg',
    },
    {
      title: 'Jurassic Park',
      year: 1993,
      image: 'https://cdn.kinowki.pl/2013/04/Jurassic-Park-3D-Ulotka-01th.jpg',
    },
    {
      title: 'Leon zawodowiec',
      year: 1994,
      image: 'https://cdn.kinowki.pl/1995/05/Leon-Zawodowiec-Ulotka-1.jpg',
    },
  ];

  recentFlyers = toSignal(
    this.flyerService.getHighlight().pipe(
      map((res) =>
        res.data
          .map((flyer) => {
            const release = flyer.releases[0];

            return {
              _id: flyer._id,
              filmId: release.film._id,
              title: release.film.title,
              releaseDate: release.date,
              image: `${this.CDN_URL}${flyer.images[0].thumbnail}`,
            };
          })
          .sort((a, b) => {
            const dateComparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();

            return dateComparison !== 0 ? dateComparison : a.title.localeCompare(b.title, 'pl');
          })
      )
    )
  );
}
