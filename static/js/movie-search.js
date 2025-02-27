const API_KEY = '595786e6aaaa7490b57f9936a7ae819f'; // API key for The Movie Database
let currentPage = 1;
let totalPages = 1;
let searchResultsContainer;
let selectedMoviesContainer;
let lastSearchQuery = '';
let selectedMovies = [];
let previouslySelectedMovies = [];
let savePreferencesBtn;
let searchInputField;
let searchBarContainer;
let errorAlert;
let successAlert;

// Function to create a movie card element
function createMovieCard(movie, includeDetails = true) {
    const { id, poster_path, title, vote_average } = movie;
    const imageUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

    return `
        <div class="card" onclick="toggleMovieSelection(${id}, '${poster_path}')" id="movie-${id}">
            <img src="${imageUrl}" alt="${title}">
            ${includeDetails ? `
                <div class="card-details">
                    <h3>${title}</h3>
                    <span>Rating: ${vote_average.toFixed(3)}</span>
                </div>
            ` : ''}
        </div>
    `;
}

// Function to fetch movies from the API
async function fetchMovies(page, query = '') {
    const url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`
        : `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${page}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        totalPages = data.total_pages;
        return data.results;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}

// Function to render movies on the page
function renderMovies(movies) {
    const filteredMovies = movies.filter(movie => movie.poster_path && movie.vote_average > 3);
    searchResultsContainer.innerHTML += filteredMovies.map(movie => createMovieCard(movie)).join('');
}

// Function to clear movie results from the page
function clearMovieResults() {
    searchResultsContainer.innerHTML = '';
}

// Function to toggle movie selection
function toggleMovieSelection(id, posterPath) {
    const movieIndex = selectedMovies.findIndex(movie => movie.id === id);
    if (movieIndex === -1) {
        selectedMovies.push({ id, poster_path: posterPath });
        selectedMoviesContainer.innerHTML += createMovieCard({ id, poster_path: posterPath }, false);
    } else {
        selectedMovies.splice(movieIndex, 1);
        selectedMoviesContainer.innerHTML = selectedMovies.map(movie => createMovieCard(movie, false)).join('');
    }

    const arraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.slice().sort((a, b) => a.id - b.id).every((item, index) => item.id === arr2.slice().sort((a, b) => a.id - b.id)[index].id);
    };

    savePreferencesBtn.classList.toggle('disabled', arraysEqual(selectedMovies, previouslySelectedMovies));
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    searchResultsContainer = document.getElementById('search-results');
    searchInputField = document.getElementById('search-input');
    searchBarContainer = document.getElementById('search-bar');
    selectedMoviesContainer = document.getElementById('selected-movies');
    errorAlert = document.getElementById('error-message');
    successAlert = document.getElementById('success-message');
    savePreferencesBtn = document.getElementById('save-preferences');

    // Function to load movies
    async function loadMovies(page, query = '') {
        const movies = await fetchMovies(page, query);
        renderMovies(movies);
    }

    // Initial load of movies
    loadMovies(currentPage);

    // Event listener for infinite scroll
    searchResultsContainer.addEventListener('scroll', async () => {
        if (searchResultsContainer.scrollTop + searchResultsContainer.clientHeight * 2 >= searchResultsContainer.scrollHeight - 100) {
            if (currentPage < totalPages) {
                currentPage++;
                const movies = await fetchMovies(currentPage, searchInputField.value);
                renderMovies(movies);
            }
        }
    });

    // Event listener for search input field
    searchInputField.addEventListener('input', () => {
        currentPage = 1;
        clearMovieResults();
        loadMovies(currentPage, searchInputField.value);
        lastSearchQuery = searchInputField.value;
    });

    // Fetch previously liked movies
    fetch('/movies/data')
        .then(response => response.json())
        .then(data => {
            data.liked.forEach(movie => {
                previouslySelectedMovies.push(movie);
                selectedMovies.push(movie);
                selectedMoviesContainer.innerHTML += createMovieCard(movie, false);
            });
        })
        .catch(error => console.error('Error:', error));

    // Event listener for save preferences button
    savePreferencesBtn.addEventListener('click', () => {
        if (selectedMovies.length === 0) {
            errorAlert.style.display = 'flex';
            searchBarContainer.style.display = 'none';
            setTimeout(() => {
                errorAlert.style.display = 'none';
                searchBarContainer.style.display = 'flex';
            }, 3000);
            return;
        }

        savePreferencesBtn.classList.add('disabled');
        savePreferencesBtn.innerHTML = 'Saving...';
        document.body.style.cursor = 'wait';
        fetch('/movies/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movies: selectedMovies })
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            document.body.style.cursor = 'default';
            previouslySelectedMovies = [...selectedMovies];
            savePreferencesBtn.classList.add('disabled');
            savePreferencesBtn.innerHTML = 'Save';
            document.body.style.cursor = 'default';
            successAlert.style.display = 'flex';
            searchBarContainer.style.display = 'none';
            setTimeout(() => {
            successAlert.style.display = 'none';
            searchBarContainer.style.display = 'flex';
            }, 3000);
        });
    });
});
