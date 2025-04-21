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

function showLoading() {
    movieSectionAll.querySelector('#loading').style.display = 'flex';
    movieSectionAll.style.pointerEvents = 'none';
}

function hideLoading() {
    setTimeout(() => {
    movieSectionAll.querySelector('#loading').style.display = 'none';
    movieSectionAll.style.pointerEvents = 'auto';
    }, 500);
}

window.like = function (id) {
    console.log("Liked movie with ID:", id);;

    // Remove from disliked list if present
    const dislikedIndex = dislikedMovies.findIndex(m => m === id);
    if (dislikedIndex !== -1) {
        dislikedMovies.splice(dislikedIndex, 1);
        movieSectionDisliked.removeChild(movieSectionDisliked.children[dislikedIndex]);
    }

    // Add to liked list if not already present
    if (!likedMovies.some(m => m === id)) {
        likedMovies.push(id);
        generateMovieCard(id, 0).then(card => {    
            movieSectionLiked.appendChild(card);
        });
    }

    console.log("Liked movies:", likedMovies);
    console.log("Disliked movies:", dislikedMovies);    
};

window.dislike = function (id) {
    console.log("Disliked movie with ID:", id);

    // Remove from liked list if present
    const likedIndex = likedMovies.findIndex(m => m === id);
    if (likedIndex !== -1) {
        likedMovies.splice(likedIndex, 1);
        movieSectionLiked.removeChild(movieSectionLiked.children[likedIndex]);
    }

    // Add to disliked list if not already present
    if (!dislikedMovies.some(m => m === id)) {
        dislikedMovies.push(id);
        generateMovieCard(id, 0).then(card => {
            movieSectionDisliked.appendChild(card);
        });
    }

    console.log("Liked movies:", likedMovies);
    console.log("Disliked movies:", dislikedMovies);   
};

window.remove = function (id) {
    console.log("Removed movie with ID:", id);

    // Remove from liked list
    const likedIndex = likedMovies.findIndex(m => m === id);
    if (likedIndex !== -1) {
        likedMovies.splice(likedIndex, 1);
        movieSectionLiked.removeChild(movieSectionLiked.children[likedIndex]);
    }

    // Remove from disliked list
    const dislikedIndex = dislikedMovies.findIndex(m => m === id);
    if (dislikedIndex !== -1) {
        dislikedMovies.splice(dislikedIndex, 1);
        movieSectionDisliked.removeChild(movieSectionDisliked.children[dislikedIndex]);
    }
};

window.overview = function (id) {
    window.location.href = `/overview/${id}/`;
};

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



function getMovieByID(id) {
    return fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching movie data:', error);
            return null;
        });
}

function generateMovieCard(movieId, status) {
    return getMovieByID(movieId).then(movie => {
        if (movie) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.id = `movie-${movie.id}`;

            card.innerHTML = `
            <a href="/overview/${movie.id}/">
            <div class="poster-wrapper">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="card-img-top">
                <div class="poster-title">${movie.title}
                <div class="poster-year">(${movie.release_date?.split('-')[0] ?? 'N/A'})</div>
            </div>
            </a>
                <div class="card-body">
                        ${
                            status === 1 ?
                            `<button class="opt like" data-id="${movie.id}" onclick="like(${movie.id})">Like</button>
                             <button class="opt dislike" data-id="${movie.id}" onclick="dislike(${movie.id})">Dislike</button>`
                            :
                            `<button class="opt remove" data-id="${movie.id}" onclick="remove(${movie.id})">Remove</button>`
                        }
                </div>
            `;

            return card;
        }
    }).catch(error => {
        console.error('Error generating movie card:', error);
        return null;
    });
}

function fetchMovies(page = 1, query = '', genre = 'all', year = 'all', rating = 'all') {
    console.log("Fetching movies with filters:", { page, query, genre, year, rating });

    let url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&page=${page}&query=${query}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;

    if (genre !== 'all') url += `&with_genres=${genre}`;
    if (year !== 'all') url += `&primary_release_year=${year}`;
    if (rating !== 'all') url += `&vote_average.gte=${rating}`;

    if (page === 1) showLoading();
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
                hideLoading();
                return;
            }

            const cardPromises = data.results.map(movie => {
                if (!movie.poster_path || movie.original_language !== 'en' || movie.vote_average < 4) return null;
                return generateMovieCard(movie.id, 1).then(card => {
                    if (card && !movieSectionAll.querySelector(`#movie-${movie.id}`) && movie.id != undefined) {
                        movieSectionAll.appendChild(card);
                    }
                });
            });

            Promise.all(cardPromises).then(() => {
                if (page === 1) hideLoading();
            });
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            hideLoading();
        });
}


document.addEventListener('DOMContentLoaded', () => {
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
        if (movieSectionAll.scrollTop + movieSectionAll.clientHeight * 2 >= movieSectionAll.scrollHeight) {
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
    currentPage = 1;
}

function resetSearchBar() {
    searchBar.value = '';
    currentPage = 1;
}

function clearMovieResults() {
    currentPage = 1;
    movieSectionAll.innerHTML = 
    `<div class="loading" id="loading" style="
            background-color: black;
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

function getUserData() {
    fetch('/preferences/data')
        .then(response => response.json())
        .then(data => {
            data.liked.forEach(movie => {
                likedMovies.push(movie.id);
                generateMovieCard(movie.id, 0).then(card => {
                    movieSectionLiked.appendChild(card);
                });
            });

            data.disliked.forEach(movie => {
                dislikedMovies.push(movie.id);
                generateMovieCard(movie.id, 0).then(card => {
                    movieSectionDisliked.appendChild(card);
                });
            });
        })
        .catch(error => console.error('Error fetching user data:', error));
}
