document.addEventListener("DOMContentLoaded", () => {
    trending = document.getElementById("trending");

    var currentSlide = 0;
    var prevBtn = document.querySelector(".control.prev");
    var nextBtn = document.querySelector(".control.next");
    var indicators = document.querySelectorAll(".indicators-container .bi");

    for (let i = 0; i < indicators.length; i++) {
        indicators[i].addEventListener("click", () => {
            currentSlide = i;
            showSlide(currentSlide, trending.querySelectorAll("#movie"), indicators);
        });
    }

    if (trending) {
        var movies = trending.querySelectorAll("#movie");

        if (movies.length > 0) {
            showSlide(currentSlide, movies, indicators);
            setInterval(() => {
                currentSlide = (currentSlide + 1) % movies.length;
                showSlide(currentSlide, movies, indicators);
            }, 10000);
        }
    }

    prevBtn?.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + movies.length) % movies.length;
        showSlide(currentSlide, movies, indicators);
    });

    nextBtn?.addEventListener("click", () => {
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

    indicators[index].classList.remove("bi-circle");
    indicators[index].classList.add("bi-circle-fill");
}