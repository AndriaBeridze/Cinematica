from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages

def home(request):
    return render(request, "homepage.html")
def loginView(request):  
    if request.method == "POST":
        username = request.POST.get("username")  
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("core:home") 
        else:
            messages.error(request, "it's invalid, the username or password")
    
    return render(request, "registering_account/login.html") 
def logoutView(request):  
    logout(request)
    return redirect("core:home")  
