import { updatePreferences } from './apiService.js';

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

  var likeBtn = document.querySelector(".brief-description .opt.like");
  var dislikeBtn = document.querySelector(".brief-description .opt.dislike");
  
  if (likeBtn) likeBtn.onclick = () => updatePreference(true, likeBtn.id);
  if (dislikeBtn) dislikeBtn.onclick = () => updatePreference(false, dislikeBtn.id);
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

function updatePreference(liked, movieId) {
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ liked: liked, id: movieId })
  })
  .then(response => {
    if (response.ok) {
      window.location.href = '';
    } else {
      return response.json().then(data => {
        throw new Error(data?.error || 'Failed to update preference');
      });
    }
  })
  .catch(error => {
    console.error('Error updating preference:', error);
  });
}

window.playTrailer = playTrailer;
window.stopTrailer = stopTrailer;
