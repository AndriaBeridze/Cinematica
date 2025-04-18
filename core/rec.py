import requests
import random

API_KEY = "595786e6aaaa7490b57f9936a7ae819f"

def fetch_recommendations(liked_ids, disliked_ids):  # Default movie IDs for testing
    recommendations = {}

    session = requests.Session()  # Use a session for connection pooling

    for movie_id in liked_ids:
        # Fetch recommendations and similar movies concurrently
        rec_url = f"https://api.themoviedb.org/3/movie/{movie_id}/recommendations?api_key={API_KEY}"
        sim_url = f"https://api.themoviedb.org/3/movie/{movie_id}/similar?api_key={API_KEY}"

        rec_response = session.get(rec_url)
        sim_response = session.get(sim_url)

        if rec_response.status_code == 200:
            rec_movies = rec_response.json().get("results", [])
        else:
            rec_movies = []

        if sim_response.status_code == 200:
            sim_movies = sim_response.json().get("results", [])
        else:
            sim_movies = []

        for movie in rec_movies + sim_movies:
            movie_id = movie["id"]
            if movie_id not in liked_ids and movie_id not in disliked_ids and movie_id not in recommendations:
                recommendations[movie_id] = movie  # Store unique movies by ID

    # Sort by popularity in descending order
    sorted_movies = sorted(recommendations.values(), key=lambda m: m["popularity"], reverse=True)

    # Filter only by required fields
    filtered_movies = [
        {
            "id": movie["id"],
            "title": movie["title"],
            "poster_path": movie.get("poster_path"),
            "vote_average": movie.get("vote_average"),
            "vote_count": movie.get("vote_count"),
            "overview": movie.get("overview"),
            "genre_ids": movie.get("genre_ids"),
            "release_date": movie.get("release_date"),
            "popularity": movie.get("popularity"),
            "original_language": movie.get("original_language"),
        }
        for movie in sorted_movies
    ]

    return filtered_movies
