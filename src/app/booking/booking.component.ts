import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieModel } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { UtilsService } from '../../services/utils.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CinemasModel } from '../../models/cinemas.model';
import { CinemasService } from '../../services/cinemas.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user.service';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';
import { OrderModel } from '../../models/order.model';

interface Seat {
  row: string;
  seatNumber: number;
  type: 'standard' | 'vip' | 'love' | 'disability';
  isSelected: boolean;
  isAvailable: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    NgFor, 
    NgIf, 
    FormsModule, 
    MatInputModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    CommonModule,
    TmdbImagePipe
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
  encapsulation: ViewEncapsulation.None
})
export class BookingComponent implements OnDestroy {
  public movie: MovieModel | null = null;
  public cinemas: CinemasModel[] = CinemasService.getCinemas();
  public selectedCinema: CinemasModel | null = null;
  public selectedSeats: Seat[] = [];
  public loading: boolean = true;
  public selectedTime: string = '20:30';
  public selectedDate: Date = new Date();
  
  // Cinema options
  public cinemaOptions = [
    { id: 1, name: 'Rajićeva Shopping Center' },
    { id: 2, name: 'Knez Mihailova' }
  ];
  public selectedCinemaOption: number = 1;
  
  // Rows in theater (A-J)
  public rows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  // Number of seats per row
  public rowSeats: number[] = Array(18).fill(0).map((_, i) => i);

  // Fixed pricing in RSD
  public readonly pricePerSeat: number = 890;
  public readonly pricePerVipSeat: number = 1290;

  // Seat availability matrix
  private seatMap: {[key: string]: boolean} = {};
  
  // Seat type matrix
  private seatTypeMap: {[key: string]: string} = {};

  constructor(
    private route: ActivatedRoute, 
    public utils: UtilsService, 
    private router: Router
  ) {
    // Add dark-theme class to the document body for global styling
    document.body.classList.add('dark-theme');
    
    // Initialize selected cinema
    this.selectedCinema = this.cinemas.find(c => c.id === this.selectedCinemaOption) || null;
    
    this.route.params.subscribe(params => {
      this.loading = true;
      MovieService.getMovieById(params['id']).then(rsp => {
        this.movie = rsp.data;
        this.initializeSeats();
        this.loading = false;
      }).catch(error => {
        console.error('Error fetching movie:', error);
        this.loading = false;
        // Show error message to user
        alert('Došlo je do greške prilikom učitavanja filma. Molimo pokušajte ponovo.');
        this.router.navigate(['/']);
      });
    });
  }
  
  ngOnDestroy(): void {
    // Remove the dark-theme class when component is destroyed
    document.body.classList.remove('dark-theme');
  }

  /**
   * Initialize seat map with random availability and types
   */
  private initializeSeats(): void {
    this.rows.forEach(row => {
      this.rowSeats.forEach((_, seatIndex) => {
        const seatKey = `${row}-${seatIndex}`;
        
        // Randomly make some seats unavailable (20% chance)
        this.seatMap[seatKey] = Math.random() > 0.2;
        
        // Assign seat types
        if (this.seatMap[seatKey]) {
          // VIP seats in rows F-H
          if (['F', 'G', 'H'].includes(row)) {
            this.seatTypeMap[seatKey] = 'vip';
          }
          // Love seats in the back row (J)
          else if (row === 'J' && seatIndex % 2 === 0) {
            this.seatTypeMap[seatKey] = 'love';
          }
          // Disability seats in the front row (A)
          else if (row === 'A' && (seatIndex === 0 || seatIndex === this.rowSeats.length - 1)) {
            this.seatTypeMap[seatKey] = 'disability';
          }
          else {
            this.seatTypeMap[seatKey] = 'standard';
          }
        }
      });
    });
  }

  /**
   * Get CSS classes for a seat based on its state
   */
  public getSeatClass(rowIndex: number, seatIndex: number): string {
    const row = this.rows[rowIndex];
    const seatKey = `${row}-${seatIndex}`;
    
    // Check if seat is selected
    const isSelected = this.selectedSeats.some(
      seat => seat.row === row && seat.seatNumber === seatIndex
    );
    
    if (isSelected) {
      return 'selected';
    }
    
    // Check if seat is available
    if (!this.seatMap[seatKey]) {
      return 'unavailable';
    }
    
    // Return seat type
    return this.seatTypeMap[seatKey] || 'standard';
  }

  /**
   * Toggle seat selection
   */
  public toggleSeat(rowIndex: number, seatIndex: number): void {
    const row = this.rows[rowIndex];
    const seatKey = `${row}-${seatIndex}`;
    
    // Cannot select unavailable seats
    if (!this.seatMap[seatKey]) {
      return;
    }
    
    const seatType = this.seatTypeMap[seatKey] as 'standard' | 'vip' | 'love' | 'disability';
    
    // Check if seat is already selected
    const selectedIndex = this.selectedSeats.findIndex(
      seat => seat.row === row && seat.seatNumber === seatIndex
    );
    
    if (selectedIndex >= 0) {
      // Remove from selected seats
      this.selectedSeats.splice(selectedIndex, 1);
    } else {
      // Add to selected seats
      this.selectedSeats.push({
        row,
        seatNumber: seatIndex,
        type: seatType,
        isSelected: true,
        isAvailable: true
      });
    }
  }

  /**
   * Get formatted text for selected seats
   */
  public getSelectedSeatsText(): string {
    if (this.selectedSeats.length === 0) {
      return '';
    }
    
    // Sort seats by row and number
    const sortedSeats = [...this.selectedSeats].sort((a, b) => {
      if (a.row !== b.row) {
        return a.row.localeCompare(b.row);
      }
      return a.seatNumber - b.seatNumber;
    });
    
    // Group seats by row
    const seatsByRow: {[key: string]: number[]} = {};
    
    sortedSeats.forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat.seatNumber + 1);
    });
    
    // Format the result
    const result: string[] = [];
    
    Object.keys(seatsByRow).sort().forEach(row => {
      result.push(`${row}${seatsByRow[row].join(', ')}`);
    });
    
    return result.join('; ');
  }

  /**
   * Calculate total price
   */
  public getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => {
      return total + (seat.type === 'vip' || seat.type === 'love' ? this.pricePerVipSeat : this.pricePerSeat);
    }, 0);
  }

  /**
   * Handle next step button click
   */
  public onNextStep(): void {
    if (this.selectedSeats.length === 0 || !this.selectedCinema) {
      return;
    }
    
    try {
      // Create an order
      const orderId = new Date().getTime();
      
      const order: OrderModel = {
        id: orderId,
        movieId: Number(this.movie!.movieId),
        title: this.movie!.title,
        startDate: this.selectedDate.toISOString(),
        runTime: this.movie!.runTime,
        time: this.selectedTime,
        cinema: this.selectedCinema, // Use the CinemasModel object directly
        count: this.selectedSeats.length,
        pricePerItem: this.getTotalPrice() / this.selectedSeats.length,
        status: 'ordered',
        rating: null,
        seats: this.selectedSeats.map(seat => `${seat.row}${seat.seatNumber + 1}`),
        posterUrl: this.movie!.poster // The API already returns complete URLs
      };

      const result = UserService.createOrder(order);

      if (result) {
        // Navigate to payment page
        this.router.navigate(['/payment', orderId]);
      } else {
        alert('Došlo je do greške prilikom kreiranja rezervacije. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Error during order creation:', error);
      alert('Došlo je do greške prilikom kreiranja rezervacije. Pokušajte ponovo.');
    }
  }

  // Update selected cinema when option changes
  public onCinemaOptionChange(cinemaId: number): void {
    this.selectedCinemaOption = cinemaId;
    this.selectedCinema = this.cinemas.find(c => c.id === cinemaId) || null;
  }
}
