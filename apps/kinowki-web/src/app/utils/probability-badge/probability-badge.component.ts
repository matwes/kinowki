import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { DistributorDto } from '@kinowki/shared';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-probability-badge',
  templateUrl: './probability-badge.component.html',
  styleUrl: './probability-badge.component.sass',
  imports: [NgClass, TooltipModule],
})
export class ProbabilityBadgeComponent {
  distributors = input.required<DistributorDto[]>();

  flyerProbability = computed(() => {
    const distributors = this.distributors();
    if (!distributors.length) {
      return 0;
    }

    const sum = distributors.reduce((acc, d) => acc + d.flyerProbability, 0);
    const avg = sum / distributors.length;

    return Math.floor(avg);
  });

  probabilityLabel = computed(() => {
    const flyerProbability = this.flyerProbability();
    return Number.isFinite(flyerProbability) ? `${flyerProbability}%` : '?';
  });

  styleClass = computed(() => {
    const flyerProbability = this.flyerProbability();
    if (flyerProbability < 30) {
      return 'low-probability';
    }
    if (flyerProbability < 70) {
      return 'medium-probability';
    }
    return 'high-probability';
  });
}
