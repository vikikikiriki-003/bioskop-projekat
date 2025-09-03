import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieModel } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { UtilsService } from '../../services/utils.service';
import { RouterLink } from '@angular/router';
import { JsonPipe, NgFor, NgIf, DatePipe } from '@angular/common';
import { UserService } from '../../services/user.service';

interface MovieReview {
  userName: string;
  rating: number;
  review?: string;
  date: Date;
}

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  
  public movie: MovieModel | null = null;
  public movieReviews: MovieReview[] = [];

  public constructor(private route: ActivatedRoute, public utils: UtilsService) {
    route.params.subscribe(params => {
      MovieService.getMovieById(params['id']).then(rsp => {
        this.movie = rsp.data;
        this.loadMovieReviews();
      });
    });
  }

  private loadMovieReviews() {
    if (!this.movie) return;

    // Get all users
    const users = UserService.retrieveUsers();
    const reviews: MovieReview[] = [];

    // Loop through all users to find reviews for this movie
    users.forEach(user => {
      if (user.orders) {
        user.orders.forEach(order => {
          if (order.movieId === this.movie?.movieId && order.rating) {
            reviews.push({
              userName: `${user.firstName} ${user.lastName}`,
              rating: order.rating,
              review: order.review,
              date: new Date(order.startDate)
            });
          }
        });
      }
    });

    // Sort reviews by date (newest first)
    this.movieReviews = reviews.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
