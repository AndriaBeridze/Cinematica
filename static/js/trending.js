document.addEventListener("DOMContentLoaded", () => {
    trending = document.getElementById("trending");

    if (trending) {
        let cnt = 0;
        var movies = trending.querySelectorAll("#movie");
        console.log(movies.length);

        if (movies.length > 0) {
            movies[cnt].classList.add("visible");
            setInterval(() => {
                movies[cnt].classList.remove("visible");
                cnt = (cnt + 1) % movies.length;
                movies[cnt].classList.add("visible");
            }, 10000);
        }
    }
});