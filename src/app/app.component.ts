import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import { NgIf } from '@angular/common';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, NgIf],
})
export class AppComponent {
  
  title = 'bioskop-projekat';

  public service = UserService

  public constructor(private router : Router){}

  public doLogout(){
    localStorage.removeItem('active')
    this.router.navigate(['/login'])
  }

}
