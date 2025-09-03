import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatCheckboxModule,
    RouterLink, 
    FormsModule, 
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public email: string = '';
  public password: string = '';
  public hidePassword: boolean = true;
  public isLoading: boolean = false;
  public loginError: string | null = null;

  constructor(private router: Router) {
    if (UserService.getActiveUser()) {
      router.navigate(['/user']);
      return;
    }
  }

  public togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hidePassword = !this.hidePassword;
  }

  public doLogin(): void {
    this.loginError = null;
    this.isLoading = true;
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      if (UserService.login(this.email, this.password)) {
        this.router.navigate(['/user']);
        return;
      }
      
      this.loginError = 'Pogrešan email ili lozinka';
      this.isLoading = false;
    }, 800);
  }
}

