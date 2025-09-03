import { CinemasModel } from "../models/cinemas.model";

export class CinemasService{

    static getCinemas() : CinemasModel[]{

        return [
            {
                id : 1,
                name: 'MovieUniverse Rajiceva',
                contryOfOrigin : 'Serbia',
                city : 'Belgrade'
            },
            {
                id : 2,
                name: 'MovieUniverse Knez Mihailova',
                contryOfOrigin : 'Serbia',
                city : 'Belgrade'   
            }
        ]

    }

    static getCinemaById(id : number){
        return this.getCinemas().find(cinema => cinema.id === id)
    }

}