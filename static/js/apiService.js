const API_KEY = '595786e6aaaa7490b57f9936a7ae819f';

export const getMovieById = async (id) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie data:', error);
        return null;
    }
};

export const searchMovies = async (page = 1, query = '', genre = 'all', year = 'all', rating = 'all') => {
    try {
        let url = query
            ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&page=${page}&query=${query}`
            : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;

        if (genre !== 'all') url += `&with_genres=${genre}`;
        if (year !== 'all') url += `&primary_release_year=${year}`;
        if (rating !== 'all') url += `&vote_average.gte=${rating}`;

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movies:', error);
        return { results: [] };
    }
};

export const updatePreferences = async (data) => {
    try {
        const response = await fetch('/preferences/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating preferences:', error);
        return null;
    }
};

export const getUserPreferences = async () => {
    try {
        const response = await fetch('/preferences/data');
        const data = await response.json();
        return {
            liked: data.liked.filter(item => item.id !== null),
            disliked: data.disliked.filter(item => item.id !== null),
            recommended: data.recommended.filter(item => item.id !== null)
        };
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return { recommended: [], liked: [], disliked: [] };
    }
};