import { CinemasModel } from "./cinemas.model"

export interface OrderModel{
    id : number
    movieId: number
    title: string
    startDate: string
    runTime: number
    cinema: CinemasModel
    count: number
    pricePerItem: number
    time : string
    status: 'ordered' | 'canceled'
    rating: number | null
    seats?: string[]  // Optional array of seat identifiers
    posterUrl?: string  // URL for the movie poster
    review?: string  // Optional review text
}