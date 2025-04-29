document.addEventListener("DOMContentLoaded", () => {
    let count = 0;
    const indicators = document.querySelectorAll("#indicator");

    indicators.forEach((indicator) => {
        let rating = parseFloat(indicator.textContent.replace('%', ''));

        if (!isNaN(rating)) {
            if (count !== 0) {
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
    movieOverview.style.paddingBottom = '200px'; // Adjust this value as needed

    // Adjust the position of the <hr> by adding a margin to it
    hrElement.style.marginTop = '20px'; // Adjust this value based on the trailer's height
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
    movieOverview.style.paddingBottom = '0'; // Reset the padding-bottom
    hrElement.style.marginTop = '0.25'; // Reset the margin-top
}