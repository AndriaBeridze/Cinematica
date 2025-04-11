const API_KEY = '595786e6aaaa7490b57f9936a7ae819f';

// DOM Elements
let movieSectionAll;
let movieSectionLiked;
let movieSectionDisliked;

// Movie Lists
let likedMovies = [];
let dislikedMovies = [];

// Pagination and Loading State
let currentPage = 1;
let isLoading = false;

// Search and Filter Elements
let searchBar;
let genreSelect;
let yearSelect;
let ratingSelect;

// Movie Interaction Functions
window.like = function (id, posterPath) {
    console.log("Liked movie with ID:", id);
    const movie = { id, poster_path: posterPath };

    // Remove from disliked list if present
    const dislikedIndex = dislikedMovies.findIndex(m => m.id === id);
    if (dislikedIndex !== -1) {
        dislikedMovies.splice(dislikedIndex, 1);
        movieSectionDisliked.removeChild(movieSectionDisliked.children[dislikedIndex]);
    }

    // Add to liked list if not already present
    if (!likedMovies.some(m => m.id === id)) {
        likedMovies.push(movie);
        movieSectionLiked.appendChild(generateMovieCard(movie));
    }
};

window.dislike = function (id, posterPath) {
    console.log("Disliked movie with ID:", id);
    const movie = { id, poster_path: posterPath };

    // Remove from liked list if present
    const likedIndex = likedMovies.findIndex(m => m.id === id);
    if (likedIndex !== -1) {
        likedMovies.splice(likedIndex, 1);
        movieSectionLiked.removeChild(movieSectionLiked.children[likedIndex]);
    }

    // Add to disliked list if not already present
    if (!dislikedMovies.some(m => m.id === id)) {
        dislikedMovies.push(movie);
        movieSectionDisliked.appendChild(generateMovieCard(movie));
    }
};

window.remove = function (id) {
    console.log("Removed movie with ID:", id);

    // Remove from liked list
    const likedIndex = likedMovies.findIndex(m => m.id === id);
    if (likedIndex !== -1) {
        likedMovies.splice(likedIndex, 1);
        movieSectionLiked.removeChild(movieSectionLiked.children[likedIndex]);
    }

    // Remove from disliked list
    const dislikedIndex = dislikedMovies.findIndex(m => m.id === id);
    if (dislikedIndex !== -1) {
        dislikedMovies.splice(dislikedIndex, 1);
        movieSectionDisliked.removeChild(movieSectionDisliked.children[dislikedIndex]);
    }
};

// Helper Functions
function generateMovieCard(movie, includeContent = true) {
    const card = document.createElement('div');
    card.classList.add('card');
    const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    card.innerHTML = `
        <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
        ${
            includeContent
                ? `
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <button class="opt like" data-id="${movie.id}" onclick="like(${movie.id}, '${movie.poster_path}')">Like</button>
                    <button class="opt dislike" data-id="${movie.id}" onclick="dislike(${movie.id}, '${movie.poster_path}')">Dislike</button>
                    <button class="opt remove" data-id="${movie.id}" onclick="remove(${movie.id})">Remove</button>
                </div>`
                : ''
        }
    `;
    return card;
}

function fetchMovies(page = 1, query = '', genre = 'all', year = 'all', rating = 'all') {
    console.log("Fetching movies with filters:", { page, query, genre, year, rating });

    let url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&page=${page}&query=${query}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;

    if (genre !== 'all') url += `&with_genres=${genre}`;
    if (year !== 'all') url += `&primary_release_year=${year}`;
    if (rating !== 'all') url += `&vote_average.gte=${rating}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                const msg = document.createElement('p');
                msg.style.textAlign = 'center';
                msg.style.fontSize = '1.25rem';
                msg.style.width = '100%';
                msg.classList.add('no-results');
                msg.textContent = 'No movies found. Try different filters.';
                movieSectionAll.appendChild(msg);
                return;
            }

            data.results.forEach(movie => {
                if (!movie.poster_path || movie.original_language !== 'en' || movie.vote_average < 4) return;
                movieSectionAll.appendChild(generateMovieCard(movie));
            });
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
        });
}

function clearMovieResults() {
    currentPage = 1;
    movieSectionAll.innerHTML = '';
}

function getUserData() {
    fetch('/preferences/data')
        .then(response => response.json())
        .then(data => {
            data.liked.forEach(movie => {
                likedMovies.push(movie);
                movieSectionLiked.appendChild(generateMovieCard(movie));
            });

            data.disliked.forEach(movie => {
                dislikedMovies.push(movie);
                movieSectionDisliked.appendChild(generateMovieCard(movie));
            });
        })
        .catch(error => console.error('Error fetching user data:', error));
}

window.savePreferences = function () {
    const saveButton = document.querySelector('#save-preferences');
    saveButton.innerHTML = 'Saving...';
    saveButton.classList.add('disabled');
    document.body.style.setProperty('cursor', 'progress');
    document.querySelectorAll('*').forEach(element => {
        element.style.setProperty('cursor', 'progress');
        element.style.setProperty('pointer-events', 'none');
    });

    fetch('/preferences/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movies: { liked: likedMovies, disliked: dislikedMovies } }),
    })
        .catch(error => console.error('Error saving preferences:', error))
        .finally(() => {
            window.location.href = '/';
        });
};

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function () {
    // Initialize DOM Elements
    movieSectionAll = document.querySelector('.section#all');
    movieSectionLiked = document.querySelector('.section#liked');
    movieSectionDisliked = document.querySelector('.section#disliked');

    searchBar = document.querySelector('input#search');
    genreSelect = document.querySelector('select#genre');
    yearSelect = document.querySelector('select#year');
    ratingSelect = document.querySelector('select#rating');

    // Event Listeners for Filters
    let searchTimeout;
    searchBar.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            resetFilters();
            clearMovieResults();
            fetchMovies(currentPage, searchBar.value, genreSelect.value, yearSelect.value, ratingSelect.value);
        }, 100);
    });

    genreSelect.addEventListener('change', () => {
        resetSearchBar();
        clearMovieResults();
        fetchMovies(currentPage, searchBar.value, genreSelect.value, yearSelect.value, ratingSelect.value);
    });

    yearSelect.addEventListener('change', () => {
        resetSearchBar();
        clearMovieResults();
        fetchMovies(currentPage, searchBar.value, genreSelect.value, yearSelect.value, ratingSelect.value);
    });

    ratingSelect.addEventListener('change', () => {
        resetSearchBar();
        clearMovieResults();
        fetchMovies(currentPage, searchBar.value, genreSelect.value, yearSelect.value, ratingSelect.value);
    });

    // Infinite Scroll
    movieSectionAll.addEventListener('scroll', function () {
        if (movieSectionAll.scrollTop + movieSectionAll.clientHeight >= movieSectionAll.scrollHeight - 500) {
            currentPage++;
            fetchMovies(currentPage, searchBar.value, genreSelect.value, yearSelect.value, ratingSelect.value);
        }
    });

    // Initial Fetch and User Data Load
    fetchMovies(currentPage, searchBar.value, genreSelect.value, yearSelect.value, ratingSelect.value);
    getUserData();
});

// Utility Functions
function resetFilters() {
    genreSelect.value = 'all';
    yearSelect.value = 'all';
    ratingSelect.value = 'all';
}

function resetSearchBar() {
    searchBar.value = '';
    currentPage = 1;
}