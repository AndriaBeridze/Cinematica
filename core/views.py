from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import Review, UserPreference, User, Reply
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .rec import fetch_recommendations
import json
from datetime import datetime
from django.contrib.auth.decorators import login_required
import requests
from .utils import fetch_trending_movies


@csrf_exempt
def home(request):
    """
    For the home page:
      - If GET: just render the home.html template.
      - If POST: user clicked Like/Dislike on a movie card, so update their UserPreference.liked_movies or .disliked_movies,
        recommendations, save, and return the same page.
    """    
    if not request.user.is_authenticated:
        return redirect("core:login")
    
    if request.method == "POST":
        data = json.loads(request.body)
        user_pref = UserPreference.objects.get(user=request.user)
        if data.get("liked"):
            user_pref.liked_movies.append({
                "id": data.get("id"),
            })
        else:
            user_pref = UserPreference.objects.get(user=request.user)
            user_pref.disliked_movies.append({
                "id": data.get("id"),
            })
        
        user_pref.save()
        recommended_movies = fetch_recommendations([movie["id"] for movie in user_pref.liked_movies], [movie["id"] for movie in user_pref.disliked_movies])
        user_pref.recommended_movies = recommended_movies
        user_pref.save()
    
    return render(request, "pages/home.html", {
        "trending": fetch_trending_movies(),
        "genres": [
            {"id": 28, "name": "Action"},
            {"id": 12, "name": "Adventure"},
            {"id": 16, "name": "Animation"},
            {"id": 35, "name": "Comedy"},
            {"id": 80, "name": "Crime"},
            {"id": 99, "name": "Documentary"},
            {"id": 18, "name": "Drama"},
            {"id": 10751, "name": "Family"},
            {"id": 14, "name": "Fantasy"},
            {"id": 36, "name": "History"},
            {"id": 27, "name": "Horror"},
            {"id": 10402, "name": "Music"},
            {"id": 9648, "name": "Mystery"},
            {"id": 10749, "name": "Romance"},
            {"id": 878, "name": "Science Fiction"},
            {"id": 10770, "name": "TV Movie"},
            {"id": 53, "name": "Thriller"},
            {"id": 10752, "name": "War"},
            {"id": 37, "name": "Western"}
        ]
    })

def login_user(request):  
    """
    The login page:
      - If already authenticated, redirect to home.
      - On POST attempt Django auth, on success redirect home, if it fails then errors happen.
    """
    if request.user.is_authenticated:
        return redirect("core:home")
    
    if request.method == "POST":
        username = request.POST.get("username")  
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("core:home") 
        else:
            return render(request, "auth/login.html", {"error": "Invalid credentials"})
    
    return render(request, "auth/login.html") 

def register_user(request):
    """
    Registration page:
      - If already logged in send to home
      - On POST validate password match and unique username, create User + UserPreference, log them in, redirect home.
    """
    if request.user.is_authenticated:
        return redirect("core:home")
    
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password2")
        
        if password == password_confirm:
            if User.objects.filter(username=username).exists():
                messages.error(request, "Username already exists")
            else:
                user = User.objects.create_user(username=username, password=password)
                user.save()
                user_pref = UserPreference(user=user)
                user_pref.save()
                login(request, user)
                return redirect("core:home")
        else:
            return render(request, "auth/register.html", {"error": "Passwords do not match"})
    
    return render(request, "auth/register.html")

def logout_user(request):  
    logout(request)
    return redirect("core:login")  

@csrf_exempt
def movie_preferences(request):
    """
    Movie Preferences page:
      - On GET render the form template (letting JS fetch years or movies).
      - On POST receive liked/disliked arrays, compute recommendations, save them all, then redirect to home so JS can pull them.
    """
    if not request.user.is_authenticated:
        return redirect("core:login")
    
    if request.method == "POST":
        data = json.loads(request.body)
        liked_movies = []
        disliked_movies = []
        for movie in data.get("movies")["liked"]:
            liked_movies.append({
                "id": movie,
            })
        
        for movie in data.get("movies")["disliked"]:
            disliked_movies.append({
                "id": movie,
            })    
    
        recommended_movies = fetch_recommendations([movie["id"] for movie in liked_movies], [movie["id"] for movie in disliked_movies])
            
        user_pref = UserPreference.objects.get(user=request.user)
        user_pref.liked_movies = liked_movies
        user_pref.disliked_movies = disliked_movies
        user_pref.recommended_movies = recommended_movies
        user_pref.save()
        
        return redirect("core:home")
    
    current_year = datetime.now().year
    all_years = list(range(current_year, 1899, -1))
    
    return render(request, "pages/preferences.html", {"years": all_years})

def user_preference_data(request):
    """
    JSON endpoint for the front-end JS:
      returns { liked: [...], disliked: [...], recommended: [...] } so the movie-cards JS can render them.
    """
    user_pref = UserPreference.objects.get(user=request.user)
    
    if request.method == "GET":
        return JsonResponse({
            "liked": user_pref.liked_movies,
            "disliked": user_pref.disliked_movies,
            "recommended": user_pref.recommended_movies,
        })
    
    return JsonResponse({
        "liked": user_pref.liked_movies,
        "disliked": user_pref.disliked_movies,
        "recommended": user_pref.recommended
    })

def about(request):
    if not request.user.is_authenticated:
        return redirect("core:login")
    
    return render(request, "pages/about.html")

def movie_overview(request, movie_id):
    """
    Display the movie details page:
      - Fetches the movie info + credits from TMDB
      - Fetches embedded YouTube trailer (if any)
      - Loads all reviews + nested replies from our database
      - Calculates an average local rating
      - Renders the overview template with that data
    """
    api_key = '595786e6aaaa7490b57f9936a7ae819f'
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&append_to_response=credits"

    response = requests.get(url)
    if response.status_code != 200:
        return render(request, 'overview.html', {'movie': None})

    data = response.json()

    #fetch the YouTube videos for trailers
    trailer_url = None
    video_url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={api_key}"
    video_response = requests.get(video_url)
    if video_response.status_code == 200:
        videos = video_response.json().get('results', [])
        for video in videos:
            if video['type'] == 'Trailer' and video['site'] == 'YouTube':
                trailer_url = f"https://www.youtube.com/embed/{video['key']}"
                break

    # fetch the movie providers where the movies are available to watch
    provider_url = f"https://api.themoviedb.org/3/movie/{movie_id}/watch/providers?api_key={api_key}"
    provider_response = requests.get(provider_url)
    PROVIDER_URLS = {
    8: "https://www.netflix.com",         # Netflix
    10: "https://www.amazon.com/video",    # Amazon Video
    15: "https://www.hulu.com",          # Hulu
    337: "https://www.disneyplus.com",    # Disney+
    384: "https://www.hbomax.com",         
    2: "https://www.apple.com/apple-tv-plus/",  
    3: "https://play.google.com/store/movies?hl=en_US",  
    192: "https://www.youtube.com/feed/storefront",
    68: "https://www.microsoft.com/en-us/store/movies-and-tv",
    257: "http://fubo.tv/stream/ca/fubo-movie-network/",
    384: "https://www.max.com/",
    73: "https://tubitv.com/",
    524: "https://www.discoveryplus.com/",
    118: "https://www.hbo.com/",
    538: "https://www.plex.tv/",
}
    providers = []

    provider_link = None

    if provider_response.status_code == 200:
        provider_data = provider_response.json().get("results", {})
        us_data = provider_data.get("US", {}) # providers available in the US

        provider_link = us_data.get("link")  # Base link to watch the movie

        provider_sections = ["flatrate", "rent", "buy", "ads", "free"] # all type of providers

        # make sure to not display duplicate providers
        seen = set()
        for section in provider_sections:
            for p in us_data.get(section, []):
                pid = p["provider_id"]
                if pid not in seen:
                    p["link"] = PROVIDER_URLS.get(pid, provider_link)  # Fallback to TMDB link
                    providers.append(p)
                    seen.add(pid)
    
    review_qs = Review.objects.filter(movie_id=movie_id).order_by("-created_at")
    review_list = []
    for review in review_qs:
        review_data = {
            "id": review.id,
            "user": review.user.username,
            "rating": review.rating,
            "text": review.text,
            "created_at": review.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "replies": []
        }
        
        replies_qs = review.replies.filter(review=review).order_by("-created_at")
        for reply in replies_qs:
            reply_data = {
                "user": reply.user.username,
                "text": reply.text,
                "created_at": reply.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            review_data["replies"].append(reply_data)
        
        review_list.append(review_data)

    # Calculate average rating and fetch all comments
    all_ratings = [review['rating'] for review in review_list if review['rating']]
    average_rating = sum(all_ratings) * 10 / len(all_ratings) if all_ratings else None

    movie_data = {
        'title': data.get('title'),
        'id': movie_id,
        'poster_url': f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get('poster_path') else '',
        'release_year': data.get('release_date', '')[:4],
        'release_date': data.get('release_date', ''),
        'single_genre': data.get('genres', [{}])[0].get('name', '') if data.get('genres') else '',
        'duration': f"{data.get('runtime', 0) // 60}h {data.get('runtime', 0) % 60}m" if data.get('runtime') else 'N/A',
        'global_rating': f"{data.get('vote_average', 0) * 10:.2f}",  # Convert to percentage and format to 2 decimal points
        'local_rating': f"{average_rating:.2f}%" if average_rating else 'N/A',
        'description': data.get('overview'),
        'director': next((member['name'] for member in data['credits']['crew'] if member['job'] == 'Director'), 'N/A'),
        'actors': ', '.join([actor['name'] for actor in data['credits']['cast'][:5]]),
        'reviews': review_list,
        'trailer_url': trailer_url,
        'providers': providers
    }

    reviewed = (
        Review.objects
              .filter(user=request.user, movie_id=movie_id)
              .exists()
        if request.user.is_authenticated else False
    )

    return render(request, 'pages/overview.html', {
        'movie': movie_data,
        'reviewed': reviewed,
    })



@login_required
def submit_comment(request):
    """
    Handle a new top-level review submission:
      - Reads movie_id, rating, comment from POST
      - Creates a Review()
      - Redirects back to the same overview page so the new review is visible
    """
    if request.method == "POST":
        movie_id = request.POST.get('movie_id', '').strip()
        rating = request.POST.get('rating', '').strip()
        text = request.POST.get('comment', '').strip()
        
        print(movie_id, rating, text)
        
        if movie_id and text and rating:
            new_review = Review.objects.create(
                user=request.user,
                movie_id=movie_id,
                rating=rating,
                text=text,
            )
            new_review.save()
            
            return redirect(f'/overview/{ movie_id }')
        
    return JsonResponse({"error": "Invalid request."}, status=400)

@login_required
def submit_reply(request):
    """
    Handle a reply to an existing review:
      - Reads parent review ID, movie_id, reply text from POST
      - Creates a Reply()
      - Redirects back to overview so the new reply shows up under its review
    """
    if request.method == 'POST':
        review_id = request.POST.get('review_id')
        movie_id = request.POST.get('movie_id')
        comment_text = request.POST.get('comment', '').strip()

        print(review_id, movie_id, comment_text)

        if review_id and movie_id and comment_text:
            try:
                parent_review = Review.objects.get(id=review_id)
                new_reply = Reply.objects.create(
                    user=request.user,
                    text=comment_text,
                    review=parent_review,
                )
                
                new_reply.save()
            except Review.DoesNotExist:
                pass

            return redirect(f'/overview/{ movie_id }')

    return redirect('core:home')

def trending_movies_api(request):
    movies = fetch_trending_movies()
    return JsonResponse(movies, safe=False)