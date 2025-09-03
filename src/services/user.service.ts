import { OrderModel } from "../models/order.model";
import { UserModel } from "../models/user.model";

export class UserService {
    static retrieveUsers() : UserModel[]{
        if(!localStorage.getItem('users')){
            const arr: UserModel[] = [
                {
                    id: crypto.randomUUID(),
                    email: 'user@example.com',
                    firstName: 'Jhon',
                    lastName: 'Doe',
                    phone: '+381061123123',
                    address: 'Danijelova 32',
                    favouriteGenre: 'Komedija',
                    password: 'user123',
                    orders: []
                }
            ]
            localStorage.setItem('users', JSON.stringify(arr))
        }
        
        return JSON.parse(localStorage.getItem('users')!)
    }

    static createUser(model: UserModel) {
        const users = this.retrieveUsers()

        for (let user of users) {
            if (user.email === model.email) 
                return false
        }

        users.push(model)

        localStorage.setItem('users', JSON.stringify(users))
        return true
    }

    static login(email : string, passowrd : string): boolean{
            
        for(let user of this.retrieveUsers()){

            if(user.email === email && user.password === passowrd){
                localStorage.setItem('active', user.email)
                return true
            }

        }

        return false

    }

    static getActiveUser() : UserModel | null{

        if(!localStorage.getItem('active')) 
            return null
        for(let user of this.retrieveUsers()){

            if(user.email == localStorage.getItem('active')){
                return user
            }

        }

        return null

    }

    static changePassword(newPassword : string) : boolean{
        
        const arr = this.retrieveUsers()

        for(let user of arr){
            if(user.email == localStorage.getItem('active')){
                user.password = newPassword
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false

    }

    static changeEmail(newEmail : string) : boolean{
        
        const arr = this.retrieveUsers()

        for(let user of arr){
            if(user.email == localStorage.getItem('active')){
                user.email = newEmail
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false

    }

    static changeFirstName(newFirstName : string) : boolean{
        
        const arr = this.retrieveUsers()

        for(let user of arr){
            if(user.email == localStorage.getItem('active')){
                user.firstName = newFirstName
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false

    }

    static changeLastName(newLastName : string) : boolean{
        
        const arr = this.retrieveUsers()

        for(let user of arr){
            if(user.email == localStorage.getItem('active')){
                user.lastName = newLastName
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false

    }

    static changePhone(newPhone : string) : boolean{
        
        const arr = this.retrieveUsers()

        for(let user of arr){
            if(user.email == localStorage.getItem('active')){
                user.phone = newPhone
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false

    }

    static changeAddress(newAddress : string) : boolean{
        
        const arr = this.retrieveUsers()

        for(let user of arr){
            if(user.email == localStorage.getItem('active')){
                user.address = newAddress
                localStorage.setItem('users', JSON.stringify(arr))
                return true
            }
        }

        return false

    }

    static createOrder(order: OrderModel) {
        const arr = this.retrieveUsers();

        for (let user of arr) {
            if (user.email === localStorage.getItem('active')) {
                if (!user.orders) {
                    user.orders = [];
                }
                user.orders.push(order);
                localStorage.setItem('users', JSON.stringify(arr));
                return true;
            }
        }

        return false;
    }

    static changeOrderStatus(state: 'ordered' | 'canceled', id: number){
        const active = this.getActiveUser()

        if(active){
            const arr = this.retrieveUsers()

            for(let user of arr){
                if(user.email == active.email){
                    if (!user.orders) continue;
                    for(let order of user.orders){
                        if(order.id == id){
                            order.status = state
                        }
                    }
                    localStorage.setItem('users', JSON.stringify(arr))
                    return true
                }
            }
        }
        return false
    }

    static updateOrderRating(orderId: number, rating: number, reviewText?: string): boolean {
        const arr = this.retrieveUsers();

        for (let user of arr) {
            if (user.email === localStorage.getItem('active')) {
                if (!user.orders) continue;
                for (let order of user.orders) {
                    if (order.id === orderId) {
                        order.rating = rating;
                        if (reviewText) {
                            order.review = reviewText;
                        }
                        localStorage.setItem('users', JSON.stringify(arr));
                        return true;
                    }
                }
            }
        }

        return false;
    }

    static updateOrderStatus(id: number, status: 'ordered' | 'canceled'): boolean {
        const active = this.getActiveUser();

        if (active) {
            const arr = this.retrieveUsers();

            for (let user of arr) {
                if (user.email === active.email) {
                    if (!user.orders) continue;
                    for (let order of user.orders) {
                        if (order.id === id) {
                            order.status = status;
                            localStorage.setItem('users', JSON.stringify(arr));
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    static updateUser(updatedUser: UserModel): boolean {
        const arr = this.retrieveUsers();
        
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].email === localStorage.getItem('active')) {
                arr[i] = updatedUser;
                localStorage.setItem('users', JSON.stringify(arr));
                return true;
            }
        }
        
        return false;
    }
}