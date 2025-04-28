document.addEventListener("DOMContentLoaded", () => {
    let count = 0;
    const indicators = document.querySelectorAll("#indicator");

    // 1. Color all the rating indicators
    indicators.forEach((indicator) => {
        let rating = parseFloat(indicator.textContent.replace('%', '').trim());

        if (!isNaN(rating)) {
            if (count !== 0) {
                rating *= 10;
            }

            let color = "#d9534f"; // Softer red
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

            const darkenColor = (hex, percent) => {
                const num = parseInt(hex.slice(1), 16);
                const amt = Math.round(2.55 * percent);
                const R = (num >> 16) - amt;
                const G = ((num >> 8) & 0x00FF) - amt;
                const B = (num & 0x0000FF) - amt;
                return `#${(
                    0x1000000 +
                    ((R < 0 ? 0 : R > 255 ? 255 : R) << 16) +
                    ((G < 0 ? 0 : G > 255 ? 255 : G) << 8) +
                    (B < 0 ? 0 : B > 255 ? 255 : B)
                ).toString(16).slice(1)}`;
            };

            const darkenedColor = darkenColor(color, 20);
            indicator.style.backgroundColor = color;
            indicator.style.borderColor     = darkenedColor;

            console.log(`Rating: ${rating}, Color: ${color}, Darkened Color: ${darkenedColor}`);
            count++;
        }
    });
});