from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(UserPreference)
admin.site.register(Review)
admin.site.register(Reply)