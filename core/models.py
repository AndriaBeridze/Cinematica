from django.db import models
from django.contrib.auth.models import User

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    liked_movies = models.JSONField(default=list, blank=True)     # list of liked movie IDs
    disliked_movies = models.JSONField(default=list, blank=True)  # list of disliked movie IDs
    recommended_movies = models.JSONField(default=list, blank=True)  # list of recommended movie IDs

    def __str__(self):
        return f"{self.user.username}'s Preferences"
