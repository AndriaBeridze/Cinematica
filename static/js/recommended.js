import { getUserPreferences } from './apiService.js';
import { generateMovieCard } from './movieCard.js';
import { updatePreferences } from './apiService.js';

class RecommendedMovies {
    constructor() {
        this.recommended = [];
        this.searchResults = [];
        this.container = document.querySelector('#recommended');
        this.searchBar = document.querySelector('#search');
        
        this.initEventListeners();
        this.fetchRecommendedMovies();
    }
    
    initEventListeners() {
        this.searchBar.addEventListener('input', () => {
            const query = this.searchBar.value.toLowerCase();
            this.searchResults = this.recommended.filter(movie => 
                movie.title.toLowerCase().includes(query)
            );
            this.createCards(this.searchResults);
        });
    }
    
    async fetchRecommendedMovies() {
        this.container.innerHTML = '';
        
        try {
            const data = await getUserPreferences();
            
            if (data.recommended && data.recommended.length > 0) {
                this.recommended = data.recommended.filter(movie => 
                    movie.poster_path && 
                    movie.original_language === 'en' && 
                    movie.vote_average >= 4
                );
                
                this.searchResults = [...this.recommended];
                this.createCards(this.searchResults);
            } else {
                this.container.innerHTML = '<p>No recommendations available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error fetching recommended movies:', error);
            this.container.innerHTML = '<p>Error loading recommendations.</p>';
        }
    }
    
    createCards(movies) {
        this.container.innerHTML = '';
        
        if (movies.length === 0) {
            this.container.innerHTML = '<p>No recommendations match your search.</p>';
            return;
        }
        
        movies.forEach(movie => {
            const card = generateMovieCard(movie, {
                showActions: true,
                showRemove: false,
                onClickLike: this.updatePreference.bind(this, true),
                onClickDislike: this.updatePreference.bind(this, false)
            });
            
            if (card) {
                this.container.appendChild(card);
            }
        });
    }
    
    async updatePreference(liked, movieId) {
        document.body.style.setProperty('cursor', 'progress');
        document.querySelectorAll('*').forEach(element => {
            element.style.setProperty('cursor', 'progress');
            element.style.setProperty('pointer-events', 'none');
        });
        
        try {
            await updatePreferences({ id: movieId, liked });
            location.reload();
        } catch (error) {
            console.error('Error updating preference:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecommendedMovies();
    
    // Expose overview function needed in HTML
    window.overview = (id) => window.location.href = `/overview/${id}/`;
});