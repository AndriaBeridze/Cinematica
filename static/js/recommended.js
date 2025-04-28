var recommendedContainer;

var recommended = [];
var searchResults = [];
var searchBar;

window.overview = function (id) {
    window.location.href = `/overview/${id}/`;
};

function generateMovieCard(movie, content = true) {
    const card = document.createElement('div');
    card.classList.add('card');
    const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    card.innerHTML = `
        <a href="/overview/${movie.id}/">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="card-img-top">
        </a>
        <div class="card-body"> 
            <h5 class="card-title">${movie.title}</h5> 
            ${
                content ? `
                    <button class="opt like" data-id="${movie.id}" onclick="update(${movie.id}, true)">Like</button>
                    <button class="opt dislike" data-id="${movie.id}" onclick="update(${movie.id}, false)">Dislike</button>
                ` : ``
            }
        </div>
    `;
    return card;
}

function createCards(movies) {
    recommendedContainer.innerHTML = '';
    movies.forEach(movie => {
        const card = generateMovieCard(movie);
        recommendedContainer.appendChild(card);
    });

    console.log(movies);

    if (movies.length === 0) {
        recommendedContainer.innerHTML = '<p>No recommendations available at the moment.</p>';
    }
}

function fetchRecommendedMovies() {
    recommendedContainer.innerHTML = '';
    fetch('/preferences/data')
    .then(response => response.json())
    .then(data => {
        if(data.recommended && data.recommended.length > 0) {
            data.recommended.forEach(movie => {
                if (!movie.poster_path) return;
                if (movie.original_language != 'en') return;
                if (movie.vote_average < 4) return;

                recommended.push(movie);    
                searchResults.push(movie);
            });
        }
    })
    .finally(() => {    
        createCards(searchResults);
    })
    .catch(error => {
        console.error('Error fetching movies data:', error);
        document.getElementById('recommended-movies-container').innerHTML = '<p>Error loading recommendations.</p>';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    searchBar = document.querySelector('#search');
    searchBar.addEventListener('input', function() {
        const query = searchBar.value.toLowerCase();
        searchResults = recommended.filter(movie => movie.title.toLowerCase().includes(query));
        createCards(searchResults);
    });

    recommendedContainer = document.querySelector('#recommended');
    fetchRecommendedMovies();
});

function update(movieId, liked) {
    document.body.style.setProperty('cursor', 'progress');
    document.querySelectorAll('*').forEach(element => {
        element.style.setProperty('cursor', 'progress');
        element.style.setProperty('pointer-events', 'none');
    });

    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: movieId, liked: liked })
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error updating liked movies:', error);
    })
    .finally(() => {
        location.reload();
    });
}