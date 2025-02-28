// recommendation.js

// Function to create a movie card HTML snippet
function createMovieCard(movie, includeDetails = true) {
    const imageUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
    return `
      <div class="card">
        <img src="${imageUrl}" alt="${movie.title}">
        ${includeDetails ? `
          <div class="card-details">
            <h3>${movie.title}</h3>
            <p>Rating: ${movie.vote_average ? movie.vote_average.toFixed(2) : 'N/A'}</p>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Fetch liked and recommended movies from the server
  fetch('/movies/data')
  .then(response => response.json())
  .then(data => {
    // Display recommended movies
    const recommendedContainer = document.getElementById('recommended-movies-container');
    if(data.recommended && data.recommended.length > 0) {
      data.recommended.forEach(movie => {
        recommendedContainer.innerHTML += createMovieCard(movie, true);
      });
    } else {
      recommendedContainer.innerHTML = '<p>No recommendations available at the moment.</p>';
    }
  })
  .catch(error => {
    console.error('Error fetching movies data:', error);
    document.getElementById('recommended-movies-container').innerHTML = '<p>Error loading recommendations.</p>';
  });
  