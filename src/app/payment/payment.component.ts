import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../services/user.service';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    RouterModule,
    TmdbImagePipe
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  orderId: number = 0;
  order: any = null;
  loading: boolean = true;
  
  // Payment form data
  cardNumber: string = '';
  cardHolder: string = '';
  expiryDate: string = '';
  cvv: string = '';
  termsAccepted: boolean = false;

  // Validation error messages
  cardNumberError: string = '';
  cardHolderError: string = '';
  expiryDateError: string = '';
  cvvError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      this.loadOrder();
    });
  }

  loadOrder(): void {
    const user = UserService.getActiveUser();
    if (!user || !user.orders) {
      this.router.navigate(['/login']);
      return;
    }

    const order = user.orders.find((o: any) => o.id === this.orderId);
    if (!order) {
      this.router.navigate(['/user']);
      return;
    }

    // Check if order is already canceled
    if (order.status === 'canceled') {
      this.router.navigate(['/user']);
      return;
    }

    this.order = order;
    this.loading = false;
  }

  // Card number validation - only allows numbers and formats with spaces
  validateCardNumber(event: any): void {
    const input = event.target.value.replace(/\s/g, ''); // Remove existing spaces
    // Remove any non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    
    // Check if the input contains non-digit characters
    if (input !== digitsOnly) {
      this.cardNumberError = 'Broj kartice mora sadržati samo brojeve';
    } else if (digitsOnly.length < 16) {
      this.cardNumberError = 'Broj kartice mora imati najmanje 16 cifara';
    } else {
      this.cardNumberError = '';
    }
    
    // Format the card number with spaces after every 4 digits
    let formattedValue = '';
    for (let i = 0; i < digitsOnly.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += digitsOnly[i];
    }
    
    // Update the input value with the formatted version
    this.cardNumber = formattedValue;
    event.target.value = formattedValue;
  }

  // Card holder validation - only allows letters and spaces
  validateCardHolder(event: any): void {
    const input = event.target.value;
    // Check if input contains anything other than letters and spaces
    if (/[^a-zA-Z\s]/.test(input)) {
      this.cardHolderError = 'Ime vlasnika kartice može sadržati samo slova';
      // Remove non-letter characters
      this.cardHolder = input.replace(/[^a-zA-Z\s]/g, '');
      event.target.value = this.cardHolder;
    } else {
      this.cardHolderError = '';
      this.cardHolder = input;
    }
  }

  // Format expiry date as MM/YY
  formatExpiryDate(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    
    // Handle backspace/delete
    if (input.length < this.expiryDate.replace(/\D/g, '').length) {
      this.expiryDate = input;
      event.target.value = input;
      return;
    }
    
    // Format as MM/YY
    if (input.length >= 2) {
      const month = parseInt(input.substring(0, 2));
      const year = input.length > 2 ? parseInt(input.substring(2)) : 0;
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
      
      // Validate month (01-12)
      if (month < 1 || month > 12) {
        this.expiryDateError = 'Mesec mora biti između 01 i 12';
        input = input.substring(0, 2);
      } 
      // Validate year
      else if (input.length > 2) {
        if (year < currentYear) {
          this.expiryDateError = 'Godina ne može biti u prošlosti';
        } else if (year > currentYear + 10) {
          this.expiryDateError = 'Godina ne može biti više od 10 godina u budućnosti';
        } else {
          this.expiryDateError = '';
        }
      } else {
        this.expiryDateError = '';
      }
    }
    
    // Format the date
    if (input.length > 0) {
      let formatted = input.substring(0, 2);
      if (input.length > 2) {
        formatted += '/' + input.substring(2, 4);
      }
      this.expiryDate = formatted;
      event.target.value = formatted;
    } else {
      this.expiryDate = input;
      event.target.value = input;
    }
  }

  // Validate CVV - only allows 3 digits
  validateCVV(event: any): void {
    const input = event.target.value;
    // Remove any non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    
    if (input !== digitsOnly) {
      this.cvvError = 'CVV mora sadržati samo brojeve';
    } else if (digitsOnly.length > 0 && digitsOnly.length < 3) {
      this.cvvError = 'CVV mora imati 3 cifre';
    } else {
      this.cvvError = '';
    }
    
    // Update the input value
    this.cvv = digitsOnly;
    event.target.value = digitsOnly;
  }

  // Check if the form is valid for submission
  isFormValid(): boolean {
    return (
      this.cardNumber.length >= 16 &&
      this.cardHolder.length > 0 &&
      this.expiryDate.length === 5 &&
      this.cvv.length === 3 &&
      this.termsAccepted &&
      !this.cardNumberError &&
      !this.cardHolderError &&
      !this.expiryDateError &&
      !this.cvvError
    );
  }

  selectPaymentMethod(method: string): void {
    // This would normally switch between payment methods
    console.log('Selected payment method:', method);
  }

  onSubmit(): void {
    // Basic validation
    if (!this.isFormValid()) {
      if (!this.cardNumber) this.cardNumberError = 'Broj kartice je obavezan';
      if (!this.cardHolder) this.cardHolderError = 'Ime vlasnika kartice je obavezno';
      if (!this.expiryDate) this.expiryDateError = 'Datum isteka je obavezan';
      if (!this.cvv) this.cvvError = 'CVV je obavezan';
      if (!this.termsAccepted) alert('Morate prihvatiti uslove korišćenja');
      return;
    }

    // Prevent double submission
    if (this.loading) {
      return;
    }

    this.loading = true;

    // Process payment and keep order status as 'ordered'
    alert('Plaćanje uspešno!');
    this.router.navigate(['/user']);
  }
} 