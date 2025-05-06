import { getMovieById, searchMovies } from './apiService.js';
import { generateMovieCard } from './movieCard.js';

class MovieSearch {
    constructor() {
        this.searchInput = document.getElementById("nav-search");
        this.resultsBody = document.querySelector(".results-body");
        this.previousDisplayStyles = new Map();
        this.currentPage = 1;
        this.isLoading = false;
        this.searchToken = 0;

        this.initEventListeners();
        this.createLoadingElement();
    }
    
    createLoadingElement() {
        this.loadingElement = document.createElement('div');
        this.loadingElement.id = 'search-loading';
        this.loadingElement.style.cssText = `
            background-color: var(--background);
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 5;
            display: none;
            justify-content: center;
            align-items: center;
        `;
        this.loadingElement.innerHTML = '<p>Loading...</p>';
        this.resultsBody.appendChild(this.loadingElement);
    }
    
    initEventListeners() {
        this.searchInput.addEventListener("focus", this.handleFocus.bind(this));
        this.searchInput.addEventListener("blur", this.handleBlur.bind(this));
        this.searchInput.addEventListener("input", this.handleInput.bind(this));
    }
    
    handleFocus() {
        document.querySelectorAll("body > *:not(nav):not(.search-results-main)").forEach(element => {
            this.previousDisplayStyles.set(element, element.style.display);
            element.style.display = "none";
        });

        document.querySelector(".search-results-main").style.display = "block";
    }
    
    handleBlur() {
        console.log("Nav search input is unfocused");
        if (this.searchInput.value === "") {
            document.querySelectorAll("body > *:not(.search-results-main)").forEach(element => {
                element.style.display = this.previousDisplayStyles.get(element) || "";
            });

            document.querySelector(".search-results-main").style.display = "none";
        }
    }
    
    async handleInput() {
        const query = this.searchInput.value.trim();
    
        this.searchToken++; // Invalidate previous searches
        const currentToken = this.searchToken;
    
        if (query.length > 0) {
            this.currentPage = 1;
            this.showLoading();
            await this.performSearch(query, currentToken);
        } else {
            // Clear everything except loading element
            Array.from(this.resultsBody.children).forEach(child => {
                if (child.id !== 'search-loading') {
                    this.resultsBody.removeChild(child);
                }
            });
            this.hideLoading();
        }
    }
    
    
    showLoading() {
        this.loadingElement.style.display = 'flex';
        this.isLoading = true;
    }
    
    hideLoading() {
        this.loadingElement.style.display = 'none';
        this.isLoading = false;
    }
    
    async performSearch(query, token) {
        const allAddCardPromises = [];
    
        try {
            for (let page = 1; page <= 5; page++) {
                if (token !== this.searchToken) return; // Cancelled
    
                const data = await searchMovies(page, query);
    
                if (page === 1) {
                    Array.from(this.resultsBody.children).forEach(child => {
                        if (child.id !== 'search-loading') {
                            this.resultsBody.removeChild(child);
                        }
                    });
                }
    
                if (!data.results || data.results.length === 0) {
                    if (page === 1 && token === this.searchToken) {
                        this.resultsBody.innerHTML = "<p>No results found.</p>";
                        this.resultsBody.appendChild(this.loadingElement);
                    }
                    break;
                }
    
                const validMovies = data.results.filter(movie =>
                    movie.poster_path &&
                    movie.original_language === 'en' &&
                    movie.vote_average >= 4
                );
    
                for (const movie of validMovies) {
                    allAddCardPromises.push(this.addMovieToResults(movie.id, token));
                }
            }
    
            await Promise.all(allAddCardPromises);
    
        } catch (error) {
            if (token === this.searchToken) {
                console.error("Error searching movies:", error);
                this.resultsBody.innerHTML = "<p>Error fetching results.</p>";
                this.resultsBody.appendChild(this.loadingElement);
            }
        } finally {
            if (token === this.searchToken) {
                this.hideLoading();
            }
        }
    }
    
    async addMovieToResults(movieId, token) {
        if (token !== this.searchToken) return;
    
        if (this.resultsBody.querySelector(`#movie-${movieId}`)) return;
    
        const movieData = await getMovieById(movieId);
        if (token !== this.searchToken) return;
    
        const card = await generateMovieCard(movieData, { showActions: false });
        if (token !== this.searchToken) return;
    
        if (card) {
            this.resultsBody.appendChild(card);
        }
    }
    
}

document.addEventListener("DOMContentLoaded", function() {
    new MovieSearch();
});