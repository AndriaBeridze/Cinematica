from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User

def home(request):
    if not request.user.is_authenticated:
        return redirect("core:login")
    
    return render(request, "home.html")

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
                login(request, user)
                return redirect("core:home")
        else:
            return render(request, "auth/register.html", {"error": "Passwords do not match"})
    
    return render(request, "auth/register.html")

def logout_user(request):  
    logout(request)
    return redirect("core:home")  
