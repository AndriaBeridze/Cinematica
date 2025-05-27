import { getUserPreferences, updatePreferences } from './apiService.js';

document.addEventListener("DOMContentLoaded", async () => {
  let count = 0;
  document.querySelectorAll("#indicator").forEach(indicator => {
    let rating = parseFloat(indicator.textContent.replace('%', ''));
    if (!isNaN(rating)) {
      if (count >= 2) rating *= 10;
      let color = "#d9534f";
      if      (60 <= rating && rating < 70) color = "#f0ad4e";
      else if (70 <= rating && rating < 80) color = "#f7c46c";
      else if (80 <= rating && rating < 90) color = "#5cb85c";
      else if (90 <= rating && rating < 100)color = "#4cae4c";
      else if (rating === 100)               color = "#337ab7";

      const darkenColor = (col, pct) => {
        const num = parseInt(col.slice(1), 16);
        const amt = Math.round(2.55 * pct);
        const R = (num >> 16) - amt;
        const G = ((num >> 8) & 0xFF) - amt;
        const B = (num & 0xFF) - amt;
        return `#${(0x1000000 +
          (R<0?0:R>255?255:R)*0x10000 +
          (G<0?0:G>255?255:G)*0x100 +
          (B<0?0:B>255?255:B)
        ).toString(16).slice(1)}`;
      };
      indicator.style.backgroundColor = color;
      indicator.style.borderColor = darkenColor(color, 20);
      count++;
    }
  });

  const showAllBtn = document.getElementById("show-all-btn");
  showAllBtn?.addEventListener("click", () => {
    document.querySelectorAll("#provider-logos .provider")
      .forEach((prov, i) => { if (i >= 5) prov.style.display = "inline-block"; });
    showAllBtn.style.display = 'none';
  });

  const likeBtn    = document.querySelector('.opt.like');
  const dislikeBtn = document.querySelector('.opt.dislike');
  const movieId    = parseInt(document.querySelector('input[name="movie_id"]').value, 10);

  if (movieId && (likeBtn || dislikeBtn)) {
    // fetch user's current prefs once
    const prefs = await getUserPreferences();

    const save = async () => {
      await updatePreferences({
        movies: {
          liked:    prefs.liked,
          disliked: prefs.disliked
        }
      });
    };

    likeBtn?.addEventListener('click', async () => {
      // remove from disliked if present
      prefs.disliked = prefs.disliked.filter(id => id !== movieId);
      // add to liked if not already
      if (!prefs.liked.includes(movieId)) prefs.liked.push(movieId);

      await save();
      likeBtn.classList.add('disabled');
      dislikeBtn?.classList.remove('disabled');
    });

    dislikeBtn?.addEventListener('click', async () => {
      prefs.liked = prefs.liked.filter(id => id !== movieId);
      if (!prefs.disliked.includes(movieId)) prefs.disliked.push(movieId);

      await save();
      dislikeBtn.classList.add('disabled');
      likeBtn?.classList.remove('disabled');
    });

    // initialize button state
    if (prefs.liked.includes(movieId))    likeBtn.classList.add('disabled');
    if (prefs.disliked.includes(movieId)) dislikeBtn.classList.add('disabled');
  }
});

function playTrailer() {
  const trailerDiv = document.getElementById('trailer-container');
  document.querySelector('.stop-btn').style.display = 'inline-block';
  document.querySelector('.trailer-btn').style.display = 'none';
  trailerDiv.style.display = 'block';
  document.querySelector('.movie-overview').style.paddingBottom = '200px';
  document.querySelector('hr').style.marginTop = '20px';
  document.getElementById('provider-logos').style.display = 'none';
  document.querySelector('.people').style.display = 'none';
}

function stopTrailer() {
  document.getElementById('trailer-container').style.display = 'none';
  document.querySelector('.stop-btn').style.display = 'none';
  document.querySelector('.trailer-btn').style.display = 'inline-block';
  document.querySelector('.movie-overview').style.paddingBottom = '0';
  document.querySelector('hr').style.marginTop = '';
  document.getElementById('provider-logos').style.display = 'flex';
  document.querySelector('.people').style.display = 'block';
}

window.playTrailer = playTrailer;
window.stopTrailer = stopTrailer;
