export const generateMovieCard = (movie, options = {}) => {
    const {
        showActions = true,
        showLike = true,
        showDislike = true,
        showRemove = false,
        onClickLike = () => {},
        onClickDislike = () => {},
        onClickRemove = () => {}
    } = options;

    if (!movie || !movie.poster_path) return null;

    const card = document.createElement('div');
    card.classList.add('card');
    card.id = `movie-${movie.id}`;

    card.innerHTML = `
        <a href="/overview/${movie.id}/">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                 alt="${movie.title}" 
                 class="card-img-top">
        </a>
        <div class="card-body"> 
            <h5 class="card-title">${movie.title}</h5> 
            ${showActions ? `
                ${showLike ? `<button class="opt like" data-id="${movie.id}">Like</button>` : ''}
                ${showDislike ? `<button class="opt dislike" data-id="${movie.id}">Dislike</button>` : ''}
                ${showRemove ? `<button class="opt remove" data-id="${movie.id}">Remove</button>` : ''}
            ` : ''}
        </div>
    `;

    if (showLike) {
        card.querySelector('.opt.like')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onClickLike(movie.id);
        });
    }

    if (showDislike) {
        card.querySelector('.opt.dislike')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onClickDislike(movie.id);
        });
    }

    if (showRemove) {
        card.querySelector('.opt.remove')?.addEventListener('click', (e) => {
            e.stopPropagation();
            onClickRemove(movie.id);
        });
    }

    return card;
};