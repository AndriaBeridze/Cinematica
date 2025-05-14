import { getMovieById, searchMovies, updatePreferences, getUserPreferences } from './apiService.js';
import { generateMovieCard } from './movieCard.js';

class PreferencesManager {
    constructor() {
        this.movieSectionAll = document.querySelector('.section#all');
        this.movieSectionLiked = document.querySelector('.section#liked');
        this.movieSectionDisliked = document.querySelector('.section#disliked');

        this.likedMovies = [];
        this.dislikedMovies = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.searchToken = 0;

        this.initEventListeners();
        this.fetchInitialData();
    }

    initEventListeners() {
        const searchBar = document.querySelector('input#search');
        const genreSelect = document.querySelector('select#genre');
        const yearSelect = document.querySelector('select#year');
        const ratingSelect = document.querySelector('select#rating');

        let searchTimeout;
        searchBar.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.resetFilters();
                this.clearMovieResults();
                const token = ++this.searchToken;
                this.fetchMovies(searchBar.value, 'all', 'all', 'all', token);
            }, 200);
        });

        [genreSelect, yearSelect, ratingSelect].forEach(select => {
            select.addEventListener('change', () => {
                this.resetSearchBar();
                this.clearMovieResults();
                const token = ++this.searchToken;
                this.fetchMovies('', genreSelect.value, yearSelect.value, ratingSelect.value, token);
            });
        });

        this.movieSectionAll.addEventListener('scroll', () => {
            if (this.shouldLoadMore()) {
                this.currentPage++;
                const token = this.searchToken;
                this.fetchMovies(
                    document.querySelector('input#search').value,
                    genreSelect.value,
                    yearSelect.value,
                    ratingSelect.value,
                    token
                );
            }
        });
    }

    shouldLoadMore() {
        return this.movieSectionAll.scrollTop + this.movieSectionAll.clientHeight * 2 >= 
               this.movieSectionAll.scrollHeight && !this.isLoading;
    }

    showLoading() {
        this.movieSectionAll.querySelector('#loading').style.display = 'flex';
        this.movieSectionAll.style.pointerEvents = 'none';
        this.isLoading = true;
    }

    hideLoading() {
        setTimeout(() => {
            this.movieSectionAll.querySelector('#loading').style.display = 'none';
            this.movieSectionAll.style.pointerEvents = 'auto';
            this.isLoading = false;
        }, 500);
    }

    async fetchInitialData() {
        try {
            const data = await getUserPreferences();
            await Promise.all([
                ...data.liked.map(movie => this.addMovieToList(movie.id, 'liked')),
                ...data.disliked.map(movie => this.addMovieToList(movie.id, 'disliked'))
            ]);
            const token = ++this.searchToken;
            this.fetchMovies('', 'all', 'all', 'all', token);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    async fetchMovies(query = '', genre = 'all', year = 'all', rating = 'all', token) {
        if (this.isLoading) return;

        this.showLoading();

        try {
            const data = await searchMovies(this.currentPage, query, genre, year, rating);

            if (token !== this.searchToken) {
                this.hideLoading();
                return;
            }

            if (!data.results || data.results.length === 0) {
                this.showNoResultsMessage();
                return;
            }

            const validMovies = data.results.filter(movie => 
                movie.poster_path && movie.original_language === 'en' && movie.vote_average >= 4
            );

            await Promise.all(validMovies.map(movie => 
                this.addMovieToAllSection(movie.id)
            ));
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            this.hideLoading();
        }
    }

    async addMovieToAllSection(movieId) {
        if (this.movieSectionAll.querySelector(`#movie-${movieId}`)) return;

        const card = await generateMovieCard(
            await getMovieById(movieId),
            {
                showActions: true,
                showRemove: false,
                onClickLike: this.likeMovie.bind(this),
                onClickDislike: this.dislikeMovie.bind(this)
            }
        );

        if (card) {
            this.movieSectionAll.appendChild(card);
        }
    }

    async addMovieToList(movieId, listType) {
        const section = listType === 'liked' ? this.movieSectionLiked : this.movieSectionDisliked;
        const array = listType === 'liked' ? this.likedMovies : this.dislikedMovies;

        if (array.includes(movieId)) return;

        array.push(movieId);

        const card = await generateMovieCard(
            await getMovieById(movieId),
            {
                showActions: true,
                showLike: false,
                showDislike: false,
                showRemove: true,
                onClickRemove: this.removeMovie.bind(this)
            }
        );

        if (card) {
            section.appendChild(card);
        }
    }

    likeMovie(id) {
        const dislikedIndex = this.dislikedMovies.indexOf(id);
        if (dislikedIndex !== -1) {
            this.dislikedMovies.splice(dislikedIndex, 1);
            this.movieSectionDisliked.removeChild(this.movieSectionDisliked.children[dislikedIndex]);
        }

        if (!this.likedMovies.includes(id)) {
            this.addMovieToList(id, 'liked');
        }

        console.log('liked movies:', this.likedMovies);
    }

    dislikeMovie(id) {
        const likedIndex = this.likedMovies.indexOf(id);
        if (likedIndex !== -1) {
            this.likedMovies.splice(likedIndex, 1);
            this.movieSectionLiked.removeChild(this.movieSectionLiked.children[likedIndex]);
        }

        if (!this.dislikedMovies.includes(id)) {
            this.addMovieToList(id, 'disliked');
        }

        console.log('disliked movies:', this.dislikedMovies);
    }

    removeMovie(id) {
        const likedIndex = this.likedMovies.indexOf(id);
        if (likedIndex !== -1) {
            this.likedMovies.splice(likedIndex, 1);
            this.movieSectionLiked.removeChild(this.movieSectionLiked.children[likedIndex]);
        }

        const dislikedIndex = this.dislikedMovies.indexOf(id);
        if (dislikedIndex !== -1) {
            this.dislikedMovies.splice(dislikedIndex, 1);
            this.movieSectionDisliked.removeChild(this.movieSectionDisliked.children[dislikedIndex]);
        }
    }

    showNoResultsMessage() {
        const msg = document.createElement('p');
        msg.style.textAlign = 'center';
        msg.style.fontSize = '1.25rem';
        msg.style.width = '100%';
        msg.classList.add('no-results');
        msg.textContent = 'No movies found. Try different filters.';
        this.movieSectionAll.appendChild(msg);
    }

    clearMovieResults() {
        this.currentPage = 1;
        this.movieSectionAll.innerHTML = `
            <div class="loading" id="loading" style="
                background-color: var(--background);
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                z-index: 5;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <p>Loading...</p>
            </div>`;
    }

    resetFilters() {
        document.querySelector('select#genre').value = 'all';
        document.querySelector('select#year').value = 'all';
        document.querySelector('select#rating').value = 'all';
        this.currentPage = 1;
    }

    resetSearchBar() {
        document.querySelector('input#search').value = '';
        this.currentPage = 1;
    }

    async savePreferences() {
        const saveButton = document.querySelector('#save-preferences');
        saveButton.innerHTML = 'Saving...';
        saveButton.classList.add('disabled');
        document.body.style.setProperty('cursor', 'progress');
        document.querySelectorAll('*').forEach(element => {
            element.style.setProperty('cursor', 'progress');
            element.style.setProperty('pointer-events', 'none');
        });

        try {
            await updatePreferences({ 
                movies: { 
                    liked: this.likedMovies, 
                    disliked: this.dislikedMovies 
                } 
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const manager = new PreferencesManager();

    window.like = manager.likeMovie.bind(manager);
    window.dislike = manager.dislikeMovie.bind(manager);
    window.remove = manager.removeMovie.bind(manager);
    window.overview = (id) => window.location.href = `/overview/${id}/`;
    window.savePreferences = manager.savePreferences.bind(manager);
});
