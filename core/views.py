from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import User, UserPreference
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .rec import fetch_recommendations
import json

def home(request):
    if not request.user.is_authenticated:
        return redirect("core:login")
    
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
    return redirect("core:home")  

@csrf_exempt
def movie_preferences(request):
    if not request.user.is_authenticated:
        return redirect("core:login")
    
    if request.method == "POST":
        data = json.loads(request.body)
        liked_movies = []
        for movie in data.get("movies"):
            liked_movies.append({
                "id": movie["id"],
                "poster_path": movie["poster_path"]
            })
            
        recommended_movies = fetch_recommendations([movie["id"] for movie in liked_movies])
            
        user_pref = UserPreference.objects.get(user=request.user)
        user_pref.liked_movies = liked_movies
        user_pref.recommended_movies = recommended_movies
        user_pref.save()
        
        return redirect("core:home")
    
    return render(request, "pages/movie-preference.html")

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

def movies_data(request):
    user_pref, created = UserPreference.objects.get_or_create(user=request.user)
    liked = user_pref.liked_movies  
    
    recommended = fetch_recommendations([m['id'] for m in liked]) if liked else []

    return JsonResponse({
        "liked": liked,
        "recommended": recommended
    })