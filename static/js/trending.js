document.addEventListener("DOMContentLoaded", () => {
    const trending = document.getElementById("trending");

    let currentSlide = 0;
    const prevBtn = document.querySelector(".control.prev");
    const nextBtn = document.querySelector(".control.next");
    const indicators = document.querySelectorAll(".indicators-container .bi");

    let movies = [];

    for (let i = 0; i < indicators.length; i++) {
        indicators[i].addEventListener("click", () => {
            currentSlide = i;
            showSlide(currentSlide, movies, indicators);
        });
    }

    if (trending) {
        movies = trending.querySelectorAll("#movie");

        if (movies.length > 0) {
            showSlide(currentSlide, movies, indicators);
            setInterval(() => {
                currentSlide = (currentSlide + 1) % movies.length;
                showSlide(currentSlide, movies, indicators);
            }, 10000);
        }
    }

    prevBtn?.addEventListener("click", () => {
        if (movies.length === 0) return;
        currentSlide = (currentSlide - 1 + movies.length) % movies.length;
        showSlide(currentSlide, movies, indicators);
    });

    nextBtn?.addEventListener("click", () => {
        if (movies.length === 0) return;
        currentSlide = (currentSlide + 1) % movies.length;
        showSlide(currentSlide, movies, indicators);
    });
});

function showSlide(index, movies, indicators) {
    if (index < 0 || index >= movies.length) return;

    movies.forEach(movie => movie.style.opacity = 0);
    movies[index].style.opacity = 1;

    indicators.forEach(indicator => {
        indicator.classList.remove("bi-circle-fill");
        indicator.classList.add("bi-circle");
    });

    if (indicators[index]) {
        indicators[index].classList.remove("bi-circle");
        indicators[index].classList.add("bi-circle-fill");
    }
}
