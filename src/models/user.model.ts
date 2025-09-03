import { OrderModel } from './order.model';

export interface UserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  orders?: OrderModel[];
  password: string;
  favouriteGenre?: string;
}