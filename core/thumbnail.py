import requests
from dotenv import load_dotenv
load_dotenv()

import os

API_KEY = os.getenv("API_KEY")

def format_movie_name(movie_name):
    unnecessary_chars = ["'", ":", "!", "?", "(", ")", ".", ",", "-", "’", "“", "”"] 
    for char in unnecessary_chars:
        movie_name = movie_name.replace(char, "")
        
    movie_name = movie_name.lower().replace(" ", "_")
    return movie_name
    

def get_movie_thumbnail(movie_name):
    URL = f"https://api.themoviedb.org/3/search/movie?api_key={API_KEY}&query={movie_name}"
    response = requests.get(URL).json()
    
    movie_name = format_movie_name(movie_name)
    if response["results"]:
        poster_path = response["results"][0]["poster_path"]
        img_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
        
        img_data = requests.get(img_url).content
        if not os.path.exists("thumbnails"):
            os.makedirs("thumbnails")
        with open(f"thumbnails/{movie_name}.jpg", "wb") as handler:
            handler.write(img_data)
        
        return img_url
    else:
        return "Movie not found!"