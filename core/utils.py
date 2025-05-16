import requests

TMDB_API_KEY = '595786e6aaaa7490b57f9936a7ae819f'  # Replace with your actual API key

def fetch_trending_movies():
    url = "https://api.themoviedb.org/3/trending/movie/day"
    params = {
        "api_key": TMDB_API_KEY
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get("results", [])[:5]  # return top 5
    return []