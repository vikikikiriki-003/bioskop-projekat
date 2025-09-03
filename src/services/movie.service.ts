import axios from "axios";
import { MovieModel } from "../models/movie.model";

const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000;

const client = axios.create({
    baseURL : 'https://movie.pequla.com/api',
    headers : {
        'Accept' : 'application/json',
        'X-Client-Name' : 'BIOSKOPUDILOVIC' 
    },
    validateStatus : (status : number) => {
        return status === 200
    }
});

export class MovieService{
    private static getFromCache(key: string): any {
        const cachedItem = cache[key];
        if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
            return cachedItem.data;
        }
        return null;
    }

    private static setCache(key: string, data: any): void {
        cache[key] = {
            data,
            timestamp: Date.now()
        };
    }

    static async getMovies(page: number = 0, size: number = 10) {
        const cacheKey = `movies_${page}_${size}`;
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        const response = await client.request({
            url: '/movie',
            method: 'GET',
            params: {
                'page': page,
                'size': size,
                'sort': 'startDate,asc'
            }
        });
        
        this.setCache(cacheKey, response.data);
        return response;
    }

    static async getMovieById(movieId: number) {
        const cacheKey = `movie_${movieId}`;
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        const response = await client.get(`/movie/${movieId}`);
        this.setCache(cacheKey, response.data);
        return response;
    }

    static async getGenres() {
        const cacheKey = 'genres';
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        try {
            const response = await client.get('/genre');
            this.setCache(cacheKey, response.data);
            return response;
        } catch (error) {
            console.error('Error fetching genres:', error);
            return { data: [] };
        }
    }

    static async getDirectors() {
        const cacheKey = 'directors';
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        try {
            const response = await client.get('/director');
            this.setCache(cacheKey, response.data);
            return response;
        } catch (error) {
            console.error('Error fetching directors:', error);
            return { data: [] };
        }
    }
    
    static async getActors() {
        const cacheKey = 'actors';
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        try {
            const response = await client.get('/actor');
            this.setCache(cacheKey, response.data);
            return response;
        } catch (error) {
            console.error('Error fetching actors:', error);
            return { data: [] };
        }
    }
    
    static async getRuntimes() {
        const cacheKey = 'runtimes';
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        try {
            const response = await client.get('/movie/runtimes');
            this.setCache(cacheKey, response.data);
            return response;
        } catch (error) {
            console.log('Runtimes endpoint not available, extracting from movies data');
            const moviesResponse = await this.getMovies(0, 1000);
            const movies = moviesResponse.data;
            const uniqueRuntimes = [...new Set(movies.map((movie: MovieModel) => movie.runTime))].sort((a, b) => (a as number) - (b as number));
            this.setCache(cacheKey, uniqueRuntimes);
            return { data: uniqueRuntimes };
        }
    }
    
    static async searchMovies(filters: any) {
        const cacheKey = `search_${JSON.stringify(filters)}`;
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            return { data: cachedData };
        }

        let params: any = {};
        
        if (filters.genre) params.genreId = filters.genre;
        if (filters.director) params.directorId = filters.director;
        if (filters.actor) params.actorId = filters.actor;
        if (filters.runtime) params.runTime = filters.runtime;
        if (filters.search) params.search = filters.search;
        
        const response = await client.request({
            url: '/movie/search',
            method: 'GET',
            params: params
        });
        
        this.setCache(cacheKey, response.data);
        return response;
    }
}