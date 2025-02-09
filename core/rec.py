import pandas as pd
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

columns = [
            'id', 
            'title', 
            'vote_average', 
            'vote_count', 
            'status', 
            'release_date', 
            'revenue', 
            'runtime', 
            'adult', 
            'backdrop_path', 
            'budget', 
            'homepage', 
            'imdb_id', 
            'original_language', 
            'original_title', 
            'overview', 
            'popularity', 
            'poster_path', 
            'tagline', 
            'genres', 
            'production_companies', 
            'production_countries', 
            'spoken_languages', 
            'keywords'
        ]

# Load the data and create a new column that combines all the features
db = pd.read_csv('db.csv')
db['combined'] = db.apply(lambda row: ' '.join([str(row[col]) for col in columns]), axis=1)

def recommend_movies(liked_movies, top_n = 10):
    # Initialize the TF-IDF vectorizer
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(db['combined'])

    # Transform the liked movies into TF-IDF vectors
    liked_movies_combined = ' '.join(liked_movies)
    liked_movies_tfidf = tfidf.transform([liked_movies_combined])
    
    # Compute similarities and get the indices of the most similar movies
    cosine_similarities = cosine_similarity(liked_movies_tfidf, tfidf_matrix).flatten()
    similar_indices = cosine_similarities.argsort()[-top_n:][::-1]
    similar_movies = db.iloc[similar_indices].head(top_n)
    
    return similar_movies['title'].tolist()

# Test the function
liked_movies = ['Iron Man', 'The Avengers', 'Guardians of the Galaxy', 'Spider Man: Homecoming', 'Black Panther', 'Thor: Ragnarok']
recommendations = recommend_movies(liked_movies)

print('Recommended movies:')
for i, movie in enumerate(recommendations):
    print(f'{i + 1}. {movie}')