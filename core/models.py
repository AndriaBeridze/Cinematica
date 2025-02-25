from django.db import models
from django.contrib.auth.models import User


class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True) 
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    release_date = models.DateField(blank=True, null=True)
    # could add more later if needed

    def __str__(self):
        return self.title

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    liked_movies = models.JSONField(default=list, blank=True)     # list of liked movie IDs
    disliked_movies = models.JSONField(default=list, blank=True)  # list of disliked movie IDs

    def __str__(self):
        return f"{self.user.username}'s Preferences"