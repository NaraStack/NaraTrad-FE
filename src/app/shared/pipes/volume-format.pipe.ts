import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'volumeFormat',
  standalone: true,
})
export class VolumeFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || value === 0) {
      return '-';
    }

    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + 'B';
    } else if (absValue >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    } else if (absValue >= 1_000) {
      return (value / 1_000).toFixed(1) + 'K';
    } else {
      return value.toString();
    }
  }
}