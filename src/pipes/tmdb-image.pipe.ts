import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tmdbImage',
  standalone: true
})
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | undefined): string {
    if (!path) return '/assets/no-poster.jpg';
    
    // If path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, assume it's a TMDB path and construct the URL
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
} 