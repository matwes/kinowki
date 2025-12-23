import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { DistributorDto } from '@kinowki/shared';
import { PrimeIcons } from 'primeng/api';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-distributor-badge',
  templateUrl: './distributor-badge.component.html',
  styleUrl: './distributor-badge.component.sass',
  imports: [NgClass, TagModule],
})
export class DistributorBadgeComponent {
  distributors = input.required<DistributorDto[]>();
  hasFlyers = input.required<boolean>();
  releaseDate = input.required<string>();
  releaseType = input.required<number>();
  releaseNote = input.required<string>();
  showReleaseDate = input(false);

  date = computed(() => {
    const releaseDate = this.releaseDate();
    return releaseDate.endsWith('-00') ? releaseDate.slice(0, -3) : releaseDate;
  });

  showFlyerProbability = computed(() => {
    const releaseDate = this.releaseDate();
    const hasFlyers = this.hasFlyers();

    if (hasFlyers) {
      return false;
    }

    const today = new Date().toISOString().slice(0, 10);
    return releaseDate > today;
  });

  flyerProbability = computed(() => {
    const distributors = this.distributors();
    if (!distributors.length) {
      return 0;
    }

    const sum = distributors.reduce((acc, d) => acc + d.flyerProbability, 0);
    const avg = sum / distributors.length;

    return Math.floor(avg);
  });

  name = computed(() => {
    const distributors = this.distributors();
    if (!distributors.length) {
      return '';
    }

    return distributors.map((distributor) => distributor.name).join(' • ');
  });

  probabilityLabel = computed(() => (Number.isFinite(this.flyerProbability) ? `${this.flyerProbability}%` : '?'));

  styleClass = computed(() => {
    if (this.showFlyerProbability()) {
      const flyerProbability = this.flyerProbability();
      if (flyerProbability < 30) {
        return 'low-probability';
      }
      if (flyerProbability < 70) {
        return 'medium-probability';
      }
      return 'high-probability';
    } else {
      return null;
    }
  });

  releaseTypeIcon = computed(() => {
    const releaseType = this.releaseType();
    if (releaseType === 1) {
      return PrimeIcons.VIDEO;
    } else if (releaseType === 2) {
      return PrimeIcons.TROPHY;
    } else if (releaseType === 3) {
      return PrimeIcons.PLAY_CIRCLE;
    } else if (releaseType === 4) {
      return PrimeIcons.UNDO;
    } else if (releaseType === 5) {
      return PrimeIcons.MAP_MARKER;
    } else if (releaseType === 6) {
      return PrimeIcons.TIMES;
    }
    return null;
  });
}
