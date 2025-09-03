import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MoviesComponent } from './movies/movies.component';
import { CinemasComponent } from './cinemas/cinemas.component';
import { DetailsComponent } from './details/details.component';
import { BookingComponent } from './booking/booking.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { SignupComponent } from './signup/signup.component';
import { PaymentComponent } from './payment/payment.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'gallery', component: GalleryComponent },
    { path: 'movies', component: MoviesComponent },
    { path: 'cinemas', component: CinemasComponent },
    { path: 'details/:id/booking', component: BookingComponent },
    { path: 'details/:id', component: DetailsComponent },
    { path: 'payment/:id', component: PaymentComponent },
    { path: 'login', component: LoginComponent },
    { path: 'user', component: UserComponent },
    { path: 'signup', component: SignupComponent },
    { path: '**', redirectTo: '' }
];
