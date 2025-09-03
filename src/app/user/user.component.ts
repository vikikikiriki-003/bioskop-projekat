import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { NgFor, NgIf, NgClass, DatePipe, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UtilsService } from '../../services/utils.service';
import { OrderModel } from '../../models/order.model';
import { FormsModule } from '@angular/forms';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    NgIf, 
    NgFor, 
    NgClass,
    NgSwitch,
    NgSwitchCase,
    CommonModule,
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    RouterLink, 
    FormsModule,
    DatePipe
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  public displayedColumns : string[] = ['movieId', 'title', 'startDate', 'runTime', 'cinema', 'time', 'count', 'price', 'total', 'status', 'rating', 'actions']
  public user : UserModel | null = null
  public isUserInfoModalOpen: boolean = false;
  public isReviewModalOpen: boolean = false;
  
  // Edit form data
  public editField: string = '';
  public editValue: string = '';
  public isEditing: boolean = false;
  
  // Review form data
  public selectedOrder: OrderModel | null = null;
  public reviewRating: number = 0;
  public reviewText: string = '';
  public hoverRating: number = 0;

  constructor(private router : Router, public utils : UtilsService){
    if(!UserService.getActiveUser()){
      router.navigate(['/home'])
      return
    }

    this.user = UserService.getActiveUser()
  }

  // Helper methods
  getOrdersCount(): number {
    return this.user?.orders?.length || 0;
  }

  getLikedCount(): number {
    return this.user?.orders?.filter(order => order.rating && order.rating > 3).length || 0;
  }

  public getPositiveRatingsCount(): number {
    return this.user?.orders?.filter(order => order.rating !== null && order.rating > 3).length || 0;
  }

  // Modal methods
  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.selectedOrder = null;
    this.reviewRating = 0;
    this.reviewText = '';
    this.hoverRating = 0;
  }

  setRating(rating: number) {
    this.reviewRating = rating;
  }

  submitReview() {
    if (this.selectedOrder && this.reviewRating > 0) {
      // Update the order with rating and review
      const success = UserService.updateOrderRating(this.selectedOrder.id, this.reviewRating, this.reviewText.trim());
      
      if (success) {
        // Update the local order object
        this.selectedOrder.rating = this.reviewRating;
        this.selectedOrder.review = this.reviewText.trim();
        
        // Update the user's orders list
        if (this.user && this.user.orders) {
          const orderIndex = this.user.orders.findIndex(o => o.id === this.selectedOrder!.id);
          if (orderIndex !== -1) {
            this.user.orders[orderIndex] = this.selectedOrder;
          }
        }
        
        // Close the modal
        this.closeReviewModal();
        
        // Show success message
        alert('Hvala na vašoj oceni!');
      } else {
        alert('Došlo je do greške prilikom čuvanja ocene. Molimo pokušajte ponovo.');
      }
    }
  }

  // Helper method to get rating text
  getRatingText(rating: number): string {
    switch(rating) {
      case 1: return 'Veoma loš';
      case 2: return 'Loš';
      case 3: return 'Prosečan';
      case 4: return 'Dobar';
      case 5: return 'Odličan';
      default: return '';
    }
  }

  // Edit methods
  startEdit(field: string, value: string) {
    this.editField = field;
    this.editValue = value;
    this.isEditing = true;
  }

  saveEdit() {
    if (!this.user || !this.editField) return;

    // Update the user object
    (this.user as any)[this.editField] = this.editValue;

    // Update in UserService
    UserService.updateUser(this.user);

    // Reset edit state
    this.isEditing = false;
    this.editField = '';
    this.editValue = '';
  }

  cancelEdit() {
    this.isEditing = false;
    this.editField = '';
    this.editValue = '';
  }

  // Action methods
  doChangeEmail() {
    this.startEdit('email', this.user?.email || '');
  }

  doChangePassword() {
    this.startEdit('password', '');
  }

  doChangeFirstName() {
    this.startEdit('firstName', this.user?.firstName || '');
  }

  doChangeLastName() {
    this.startEdit('lastName', this.user?.lastName || '');
  }

  doChangePhone() {
    this.startEdit('phone', this.user?.phone || '');
  }

  doChangeAddress() {
    this.startEdit('address', this.user?.address || '');
  }

  doCancel(order: OrderModel) {
    UserService.changeOrderStatus('canceled', order.id);
    this.user = UserService.getActiveUser();
  }

  openReviewModal(order: OrderModel) {
    this.selectedOrder = order;
    this.isReviewModalOpen = true;
  }
}
