from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import User, UserPreference, Comment, Movie
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .rec import fetch_recommendations
import json
from datetime import datetime
from django.contrib.auth.decorators import login_required
import requests
from django.conf import settings

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
    
    comments_qs = Comment.objects.filter(movie_id=movie_id).order_by("-created_at")
    comments_list = [
        {
            "user": comment.user.username,
            "text": comment.comment,
            "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for comment in comments_qs
    ]
    print(comments_list)
    
    movie_data = {
        'id': movie_id,  # Add this key so the movie id is available in the template
        'title': data.get('title'),
        'poster_url': f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get('poster_path') else '',
        'genre': ', '.join([genre['name'] for genre in data.get('genres', [])]),
        'release_year': data.get('release_date', '')[:4],
        'description': data.get('overview'),
        'director': next((member['name'] for member in data['credits']['crew'] if member['job'] == 'Director'), 'N/A'),
        'actors': ', '.join([actor['name'] for actor in data['credits']['cast'][:5]]),
        'comments': comments_list
    }
    
    return render(request, 'pages/overview.html', {'movie': movie_data})


@login_required
def submit_comment(request):
    if request.method == "POST":
        movie_id = request.POST.get('movie_id', '').strip()
        comment_text = request.POST.get('comment', '').strip()
        
        if movie_id and comment_text:
            new_comment = Comment.objects.create(
                user=request.user,
                movie_id=movie_id,
                comment=comment_text
            )
            new_comment.save()
            
        return redirect('core:overview', movie_id=movie_id)
        
    return JsonResponse({"error": "Invalid request."}, status=400)
