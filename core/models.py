from django.db import models
from django.contrib.auth.models import User

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    liked_movies = models.JSONField(default=list, blank=True)     # list of liked movie IDs
    disliked_movies = models.JSONField(default=list, blank=True)  # list of disliked movie IDs
    recommended_movies = models.JSONField(default=list, blank=True)  # list of recommended movie IDs

    def __str__(self):
        return f"{self.user.username}'s Preferences"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie_id = models.IntegerField(null=True, blank=False)  # TMDB ID of the movie
    rating = models.IntegerField(null=True, blank=False, default=0)  # Rating out of 10
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Comment by {self.user.username} on {self.movie_id}" 
    
class Reply(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.user.username} to {self.review.user.username}'s comment"