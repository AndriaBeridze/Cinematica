import requests
import random

API_KEY = "595786e6aaaa7490b57f9936a7ae819f"

def fetch_recommendations(watched_movie_ids):  # Default movie IDs for testing
    recommendations = {}

    for movie_id in watched_movie_ids:
        # Fetch recommendations and similar movies
        rec_url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations?api_key={API_KEY}"
        sim_url = f"https://api.themoviedb.org/3/movie/{movie_id}/similar?api_key={API_KEY}"

        rec_movies = requests.get(rec_url).json().get("results", [])
        sim_movies = requests.get(sim_url).json().get("results", [])

        for movie in rec_movies + sim_movies:
            if movie["id"] not in watched_movie_ids:  # Exclude already watched movies
                recommendations[movie["id"]] = movie  # Store unique movies by ID

    # Sort by popularity in descending order
    sorted_movies = sorted(recommendations.values(), key=lambda m: m["popularity"], reverse=True)

    # Filter only by id, title, poster_path, and vote_average
    random.shuffle(sorted_movies)
    
    filtered_movies = [
        {
            "id": movie["id"],
            "title": movie["title"],
            "poster_path": movie["poster_path"],
            "vote_average": movie["vote_average"],
            "vote_count": movie["vote_count"],
            "overview": movie["overview"],
            "genre_ids": movie["genre_ids"],
            "release_date": movie["release_date"],
            "popularity": movie["popularity"],
            "original_language": movie["original_language"]
        }
        for movie in sorted_movies
    ]

    return filtered_movies
