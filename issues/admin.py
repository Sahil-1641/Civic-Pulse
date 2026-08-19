from django.contrib import admin
from .models import Issue, Upvote

admin.site.register(Issue)
admin.site.register(Upvote)