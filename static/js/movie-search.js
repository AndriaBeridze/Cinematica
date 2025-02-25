const API_KEY = '595786e6aaaa7490b57f9936a7ae819f'; // API key for The Movie Database
let currentPage = 1; // Current page of movie results
let totalPages = 1; // Total number of pages available
let searchResultBar; // Declare searchResultBar globally

// Function to fetch movies from the API
async function fetchMovies(page, query = '', batchSize = 500) {
    searchResultBar.innerHTML = '<div id="loading-spinner" class="loading-spinner"><i class="bi bi-arrow-clockwise"></i></div>'; // Show loading spinner
    const movies = [];
    const pagesToFetch = Math.ceil(batchSize / 20); // Each page contains 20 movies

    for (let i = 0; i < pagesToFetch; i++) {
        const url = query
            ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${page + i}` // URL for searching movies
            : `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${page + i}`; // URL for top-rated movies

        try {
            showLoadingSpinner(); // Show loading spinner
            const response = await fetch(url); // Fetch data from the API
            const data = await response.json(); // Parse the JSON response
            totalPages = data.total_pages; // Update the total number of pages
            movies.push(...data.results); // Add the movies to the array
        } catch (error) {
            console.error("Error fetching movies:", error); // Log any errors
            break; // Break the loop in case of error
        } finally {
            hideLoadingSpinner(); // Hide loading spinner
        }

        if (page + i >= totalPages) break; // Stop if there are no more pages
    }

    return movies; // Return the list of movies
}

// Function to show the loading spinner
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    console.log('loading...');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Function to append movies to the search result bar
function appendMovies(movies) {
    movies = movies.filter(movie => movie.poster_path); // Filter out movies without a poster
    movies = movies.filter(movie => movie.vote_average > 3); // Filter out movies without a rating
    searchResultBar.innerHTML += movies.map(movie => {
        return `<div class="card">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    <div class="card-content">
                        <h3>${movie.title}</h3>
                        <span>${movie.vote_average.toFixed(3)}</span>
                    </div>
                </div>`;
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
        if (searchResultBar.scrollTop + (searchResultBar.clientHeight) * 2 >= searchResultBar.scrollHeight) {
            if (currentPage < totalPages) { // Check if there are more pages to load
                currentPage += Math.ceil(1000 / 20); // Increment the current page by the number of pages fetched in one batch
                loadAndDisplayMovies(currentPage, searchInput.value); // Load and display the next batch of movies
            }
        }
    });

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        currentPage = 1; // Reset the current page to 1
        clearMovies(); // Clear the search result bar
        loadAndDisplayMovies(currentPage, searchInput.value); // Load and display movies based on the search query
    });
});