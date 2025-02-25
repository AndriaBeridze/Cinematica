const API_KEY = '595786e6aaaa7490b57f9936a7ae819f';
let currentPage = 1;
let totalPages = 1;

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

function appendMovies(movies) {
    searchResultBar.innerHTML += movies.map(movie => {
        return `<div class="card">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    <div class="card-content">
                        <h3>${movie.title}</h3>
                        <span>${movie.vote_average}</span>
                    </div>
                </div>`;
    }).join('');
}

function clearMovies() {
    searchResultBar.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    searchResultBar = document.getElementById('search-result');
    const searchInput = document.getElementById('search-input');

    async function loadAndDisplayMovies(page, query = '') {
        const movies = await fetchMovies(page, query);
        appendMovies(movies);
    }

    loadAndDisplayMovies(currentPage);

    searchResultBar.addEventListener('scroll', () => {
        if (searchResultBar.scrollTop + (searchResultBar.clientHeight) * 2 >= searchResultBar.scrollHeight) {
            if (currentPage < totalPages) {
                currentPage++;
                loadAndDisplayMovies(currentPage, searchInput.value);
            }
        }
    });

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        clearMovies();
        loadAndDisplayMovies(currentPage, searchInput.value);
    });
});
