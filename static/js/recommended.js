var recommendedContainer;

window.overview = function (id) {
    window.location.href = `/overview/${id}/`;
};

function generateMovieCard(movie, content = true) {
    const card = document.createElement('div');
    card.classList.add('card');
    const posterPath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    card.innerHTML = `
        <a href="/overview/${movie.id}/">
        <div class="poster-wrapper">
            <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
            <div class="poster-title">${movie.title}
            <div class="poster-year">(${movie.release_date?.split('-')[0] ?? 'N/A'})</div>
            </div>
        </div>
        </a>     
        ${  
            content ? `
            <div class="card-body">
                <button class="opt like" data-id="${movie.id}" onclick="update(${movie.id}, true)">Like</button>
                <button class="opt dislike" data-id="${movie.id}" onclick="update(${movie.id}, false)">Dislike</button>
            </div>` : ``
        }   
    `;
    return card;
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

                recommendedContainer.appendChild(generateMovieCard(movie));
            });
        } else {
            recommendedContainer.innerHTML = '<p>No recommendations available at the moment.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching movies data:', error);
        document.getElementById('recommended-movies-container').innerHTML = '<p>Error loading recommendations.</p>';
    });
}

document.addEventListener('DOMContentLoaded', function() {
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