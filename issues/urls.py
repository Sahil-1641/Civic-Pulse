from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('report/', views.report_issue, name='report_issue'),
    path('api/issues/', views.api_issues, name='api_issues'),
    path('api/upvote/<int:issue_id>/', views.toggle_upvote, name='toggle_upvote'),
    path('api/update-status/<int:issue_id>/', views.update_status, name='update_status'),
]