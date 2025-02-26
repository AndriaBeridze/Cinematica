const API_KEY = '595786e6aaaa7490b57f9936a7ae819f'; // API key for The Movie Database
let currentPage = 1; // Current page of movie results
let totalPages = 1; // Total number of pages available
let searchResultBar; // Declare searchResultBar globally

let selectedMoviesBar;

var lastQuery = '';
var moviesSelected = [];


function generateMovieCard(movie, movieContent = true) {
    if (movieContent) {
        return `<div class="card" onclick="clickAction(${movie.id}, '${movie.poster_path}')" id="tmdb-${movie.id}">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    <div class="card-content">
                        <h3>${movie.title}</h3>
                        <span>Vote Average: ${movie.vote_average.toFixed(3)}</span>
                    </div>
                </div>`;
    } else {
        return `<div class="card" onclick="clickAction(${movie.id}, '${movie.poster_path}')" id="tmdb-${movie.id}">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                </div>`;
    }
}


// Function to fetch movies from the API
async function fetchMovies(page, query = '') {
    const url = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${page}` // URL for searching movies
        : `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${page}`; // URL for top-rated movies

    try {
        const response = await fetch(url); // Fetch data from the API
        const data = await response.json(); // Parse the JSON response
        totalPages = data.total_pages; // Update the total number of pages
        return data.results; // Return the list of movies
    } catch (error) {
        console.error("Error fetching movies:", error); // Log any errors
        return []; // Return an empty array in case of error
    }
}

// Function to append movies to the search result bar
function appendMovies(movies) {
    movies = movies.filter(movie => movie.poster_path); // Filter out movies without a poster
    movies = movies.filter(movie => movie.vote_average > 3); // Filter out movies without a rating
    searchResultBar.innerHTML += movies.map(movie => {
        return generateMovieCard(movie);
    }).join(''); // Create HTML for each movie and append it to the search result bar
}

// Function to clear the search result bar
function clearMovies() {
    searchResultBar.innerHTML = ''; // Clear the inner HTML of the search result bar
}

document.addEventListener('DOMContentLoaded', () => {
    searchResultBar = document.getElementById('search-result'); // Get the search result bar element
    const searchInput = document.getElementById('search-input'); // Get the search input element

    // Function to load and display movies
    async function loadAndDisplayMovies(page, query = '') {  
        const movies = await fetchMovies(page, query); // Fetch movies from the API
        appendMovies(movies); // Append the movies to the search result bar
    }

    loadAndDisplayMovies(currentPage); // Load and display the first page of movies

    // Event listener for infinite scrolling
    searchResultBar.addEventListener('scroll', () => {
        if (searchResultBar.scrollTop + searchResultBar.clientHeight * 2 >= searchResultBar.scrollHeight - 100) {
            if (currentPage < totalPages) { // Check if there are more pages to load
                currentPage++; // Increment the current page
                loadAndDisplayMovies(currentPage, searchInput.value); // Load and display the next page of movies
            }
        }
    });

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        currentPage = 1; // Reset the current page to 1
        clearMovies(); // Clear the search result bar
        loadAndDisplayMovies(currentPage, searchInput.value); // Load and display movies based on the search query
        lastQuery = searchInput.value;
    });

    selectedMoviesBar = document.getElementById('selected-movies')
    
});

// Function to handle click action on movie card
function clickAction(id, poster_path) {
    const movieExists = moviesSelected.some(movie => movie.id === id);
    if (!movieExists) {
        moviesSelected.push({
            id: id,
            poster_path: poster_path
        });

        selectedMoviesBar.innerHTML += generateMovieCard({
            id: id,
            poster_path: poster_path
        }, false);
    } else {
        moviesSelected = moviesSelected.filter(movie => movie.id !== id);
        selectedMoviesBar.innerHTML = '';
        moviesSelected.forEach(movie => {
            selectedMoviesBar.innerHTML += generateMovieCard(movie, false);
        });
    }
}

function submitMovies() {
    console.log(moviesSelected);
}


