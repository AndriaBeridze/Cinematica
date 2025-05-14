from django.urls import path
from . import views 
from django.conf import settings
from django.conf.urls.static import static

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('api/trending-movies/', views.trending_movies_api, name='trending_movies_api'),  
    path('login/', views.login_user, name='login'),  
    path('register/', views.register_user, name='register'),
    path('logout/', views.logout_user, name='logout'),
    path('preferences/', views.movie_preferences, name='preferences'),
    path('preferences/data', views.user_preference_data, name='preferences_data'),
    path('about/', views.about, name='about'),
    path('overview/<int:movie_id>/', views.movie_overview, name='overview'),
    path('submit_comment/', views.submit_comment, name='submit_comment'),
    path("submit_reply/", views.submit_reply, name="submit_reply"),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)