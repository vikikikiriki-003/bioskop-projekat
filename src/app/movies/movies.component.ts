import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MovieModel } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [NgIf, NgFor, MatCardModule, MatButtonModule, RouterLink, FormsModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit, OnDestroy {
  
  movies: MovieModel[] | null = null;
  filteredMovies: MovieModel[] | null = null;
  allMovies: MovieModel[] = [];
  genres: any[] = [];
  directors: any[] = [];
  actors: any[] = [];
  runtimes: number[] = [];
  
  isLoading: boolean = false;
  
  // Track if ratings have been generated
  private ratingsGenerated = false;
  // Destroy subject for unsubscribing from observables
  private destroy$ = new Subject<void>();
  // Subject for search input debouncing
  private searchTerms = new Subject<string>();

  selectedGenre: number | null = null;
  selectedDirector: number | null = null;
  selectedActor: number | null = null;
  selectedRuntime: number | null = null;
  searchQuery: string = '';
  minRating: number | null = null;
  
  constructor() {}
  
  ngOnInit() {
    // Setup debounced search
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(300) // Wait for 300ms after the last input
    ).subscribe(() => {
      this.searchMovies();
    });
    
    this.loadFilters();
    this.loadMovies();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Method to handle search input changes
  onSearchChange() {
    this.searchTerms.next(this.searchQuery);
  }

  // Method to handle filter changes
  onFilterChange() {
    this.searchMovies();
  }

  async loadFilters() {
    if (this.genres.length > 0) {
      // If filters are already loaded, don't reload
      return;
    }
    
    try {
      const [genresResponse, directorsResponse, actorsResponse, runtimesResponse] = await Promise.all([
        MovieService.getGenres(),
        MovieService.getDirectors(),
        MovieService.getActors(),
        MovieService.getRuntimes()
      ]);
      
      this.genres = genresResponse.data || [];
      this.directors = directorsResponse.data || [];
      this.actors = actorsResponse.data || [];
      this.runtimes = runtimesResponse.data || [];
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  }

  async loadMovies() {
    try {
      if (this.isLoading) return;
      
      this.isLoading = true;
      const response = await MovieService.getMovies(0, 100); // Increase page size to get more movies
      
      if (response.data) {
        this.allMovies = response.data;
        
        // Add random ratings only once
        if (!this.ratingsGenerated) {
          this.allMovies.forEach(movie => {
            movie.rating = Math.round((Math.random() * 4 + 1) * 10) / 10;
          });
          this.ratingsGenerated = true;
        }
        
        this.movies = this.allMovies;
      }
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async searchMovies() {
    try {
      // Start with all movies
      let filteredResults = [...this.allMovies];
      
      // Apply genre filter
      if (this.selectedGenre !== null) {
        const genreId = Number(this.selectedGenre);
        filteredResults = filteredResults.filter(movie => 
          movie.movieGenres && movie.movieGenres.some(mg => mg.genreId === genreId)
        );
      }
      
      // Apply director filter
      if (this.selectedDirector !== null) {
        const directorId = Number(this.selectedDirector);
        filteredResults = filteredResults.filter(movie => 
          movie.director && movie.director.directorId === directorId
        );
      }
      
      // Apply actor filter
      if (this.selectedActor !== null) {
        const actorId = Number(this.selectedActor);
        filteredResults = filteredResults.filter(movie => 
          movie.movieActors && movie.movieActors.some(ma => ma.actorId === actorId)
        );
      }
      
      // Apply runtime filter
      if (this.selectedRuntime !== null) {
        const runtime = Number(this.selectedRuntime);
        filteredResults = filteredResults.filter(movie => movie.runTime === runtime);
      }
      
      // Apply search query filter
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase().trim();
        filteredResults = filteredResults.filter(movie => 
          movie.title.toLowerCase().includes(query) || 
          (movie.originalTitle && movie.originalTitle.toLowerCase().includes(query)) ||
          (movie.shortDescription && movie.shortDescription.toLowerCase().includes(query))
        );
      }
      
      // Apply rating filter
      if (this.minRating !== null) {
        filteredResults = filteredResults.filter(movie => 
          movie.rating && movie.rating >= Number(this.minRating)
        );
      }
      
      // Update movies list
      this.movies = filteredResults;
      
      // Log for debugging
      console.log('Filters applied:', {
        genre: this.selectedGenre,
        director: this.selectedDirector,
        actor: this.selectedActor,
        runtime: this.selectedRuntime,
        search: this.searchQuery,
        rating: this.minRating
      });
      console.log('Filtered movies count:', filteredResults.length);
      
    } catch (error) {
      console.error('Error filtering movies:', error);
    }
  }

  async resetSearch() {
    this.selectedActor = null;
    this.selectedGenre = null;
    this.selectedDirector = null;
    this.selectedRuntime = null;
    this.searchQuery = '';
    this.minRating = null;
    
    if (this.allMovies.length > 0) {
      this.movies = this.allMovies;
    } else {
      await this.loadMovies();
    }
  }
}
