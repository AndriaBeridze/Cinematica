from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import Review, UserPreference, User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .rec import fetch_recommendations
import json
from datetime import datetime
from django.contrib.auth.decorators import login_required
import requests

@csrf_exempt
def home(request):    
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
    
    return render(request, "pages/home.html")

def login_user(request):  
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
    api_key = '595786e6aaaa7490b57f9936a7ae819f'
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&append_to_response=credits"

    response = requests.get(url)
    if response.status_code != 200:
        return render(request, 'overview.html', {'movie': None})

    data = response.json()
    
    review_qs = Review.objects.filter(movie_id=movie_id).order_by("-created_at")
    review_list = [
        {
            "user": review.user.username,
            "rating": review.rating,
            "text": review.text,
            "created_at": review.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
<<<<<<< HEAD

        # now fetch replies *for this specific* review instance
        replies = Review.objects.filter(parent=review).order_by("created_at")
        for reply in replies:
            review_data["replies"].append({
                "id":         reply.id,
                "user":       reply.user.username,
                "text":       reply.text,
                "created_at": reply.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            })

        review_list.append(review_data)

    # Calculate average rating and fetch all comments
    all_ratings = [review['rating'] for review in review_list if review['rating']]
    average_rating = sum(all_ratings) * 10 / len(all_ratings) if all_ratings else None

=======
        for review in review_qs
    ]
    
>>>>>>> 588cd89b64ea9951503de96c7b563bbba36ff2e3
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
<<<<<<< HEAD
        'reviews': review_list,
        'trailer_url': trailer_url,
    }
=======
        'reviews': review_list
    }
    

    
>>>>>>> 588cd89b64ea9951503de96c7b563bbba36ff2e3
    reviewed = (
        Review.objects
              .filter(user=request.user, movie_id=movie_id)
              .exists()
        if request.user.is_authenticated else False
    )

    return render(request, 'pages/overview.html', {
        'movie':    movie_data,
        'reviewed': reviewed,
    })



@login_required
def submit_comment(request):
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
    if request.method == 'POST':
        parent_id    = request.POST.get('parent_id')
        movie_id     = request.POST.get('movie_id')
        comment_text = request.POST.get('comment', '').strip()

        if parent_id and movie_id and comment_text:
            try:
                parent_review = Review.objects.get(id=parent_id)
                Review.objects.create(
                    user=request.user,
                    movie_id=movie_id,
                    text=comment_text,
                    parent=parent_review,
                )
            except Review.DoesNotExist:
                pass

        return redirect('core:overview', movie_id=movie_id)

    return redirect('core:home')