document.addEventListener("DOMContentLoaded", () => {
    let count = 0;
    const indicators = document.querySelectorAll("#indicator");

    indicators.forEach((indicator) => {
        let rating = parseFloat(indicator.textContent.replace('%', ''));

        if (!isNaN(rating)) {
            if (count >= 2) {
                rating *= 10;
            }
            
            var color = "#d9534f"; // Softer red
            if (60 <= rating && rating < 70) {
                color = "#f0ad4e"; // Warm orange
            } else if (70 <= rating && rating < 80) {
                color = "#f7c46c"; // Soft golden yellow
            } else if (80 <= rating && rating < 90) {
                color = "#5cb85c"; // Gentle green
            } else if (90 <= rating && rating < 100) {
                color = "#4cae4c"; // Deeper green
            } else if (rating === 100) {
                color = "#337ab7"; // Calming blue
            }

            const darkenColor = (color, percent) => {
                const num = parseInt(color.slice(1), 16);
                const amt = Math.round(2.55 * percent);
                const R = (num >> 16) - amt;
                const G = ((num >> 8) & 0x00FF) - amt;
                const B = (num & 0x0000FF) - amt;
                return `#${(
                    0x1000000 +
                    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
                    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
                    (B < 255 ? (B < 0 ? 0 : B) : 255)
                )
                .toString(16)
                .slice(1)}`;
            };

            const darkenedColor = darkenColor(color, 20);
            indicator.style.backgroundColor = color;
            indicator.style.borderColor = darkenedColor;
    
            console.log(`Rating: ${rating}, Color: ${color}, Darkened Color: ${darkenedColor}`);
            count++;
        }    
    });

    // button to show all providers
    const showAllBtn = document.getElementById("show-all-btn");
    if (showAllBtn) {
        showAllBtn.addEventListener("click", function() {
            // Get all provider items
            const providers = document.querySelectorAll("#provider-logos .provider");

            // Loop through the hidden items and show them
            providers.forEach(function(provider, index) {
                if (index >= 5) {
                    provider.style.display = "inline-block";
                }
            });

            // Hide the "Show All" button once clicked
            showAllBtn.style.display = "none";
        });
    }
});

function playTrailer() {
    const trailerDiv = document.getElementById('trailer-container');
    const stopButton = document.querySelector('.stop-btn'); 
    const watchButton = document.querySelector('.trailer-btn'); 
    const movieOverview = document.querySelector('.movie-overview'); 
    const hrElement = document.querySelector('hr');

    // Show the trailer
    trailerDiv.style.display = 'block';

    // Show the stop button and hide the watch button
    stopButton.style.display = 'inline-block';
    watchButton.style.display = 'none';

    // Increase the padding-bottom of the movie overview so it expands with the trailer
    movieOverview.style.paddingBottom = '200px';

    // Adjust the position of the <hr> by adding a margin to it
    hrElement.style.marginTop = '20px';

    // hide provider logos and cast
    const providerLogos = document.querySelector("#provider-logos");
    const cast = document.querySelector(".people");

    if (providerLogos) {
        providerLogos.style.display = 'none';
    } if (cast) {
        cast.style.display = 'none';
    }  
}

function stopTrailer() {
    const trailerDiv = document.getElementById('trailer-container');
    const stopButton = document.querySelector('.stop-btn');
    const watchButton = document.querySelector('.trailer-btn');
    const movieOverview = document.querySelector('.movie-overview'); 
    const hrElement = document.querySelector('hr');

    // Hide the trailer
    trailerDiv.style.display = 'none';

    // Show the watch button and hide the stop button
    stopButton.style.display = 'none';
    watchButton.style.display = 'inline-block';

    // Reset padding and margin
    movieOverview.style.paddingBottom = '0';
    hrElement.style.marginTop = '0.25';

    // Show provider logos and cast
    const providerLogos = document.querySelector("#provider-logos");
    const cast = document.querySelector(".people");

    if (providerLogos) {
        providerLogos.style.display = 'flex';
    } if (cast) {
        cast.style.display = 'block';
    }
}

// Export functions that need to be called from HTML
window.playTrailer = playTrailer;
window.stopTrailer = stopTrailer;