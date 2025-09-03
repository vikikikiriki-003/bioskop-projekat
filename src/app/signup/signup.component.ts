import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { NgFor } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButton, RouterLink, FormsModule, RouterLink, NgFor, MatSelectModule, MatCheckboxModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  public genreList : string[] = []
  public email  = ''
  public password  = ''
  public repeatPassword = ''
  public firstName  = ''
  public lastName  = ''
  public phone  = ''
  public address = ''
  public genre = ''

  public constructor(private router: Router){
    MovieService.getGenres()
    .then(rsp => {
      this.genreList = rsp.data.map((genre : any) => genre.name)
    })
  }

  public doSignup(){
    if(this.email == '' || this.password == '') {
      alert('Email and password are required fields')
      return
    }

    if(this.password !== this.repeatPassword) {
      alert('Passwords dont match')
      return
    }

    const result = UserService.createUser({
      id: crypto.randomUUID(),
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      address: this.address,
      favouriteGenre: this.genre,
      orders: []
    })

    result ? this.router.navigate(['/login']) : alert('Email is already taken')
  }


}
