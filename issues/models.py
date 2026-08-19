from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Issue(models.Model):

    CATEGORY_CHOICES = [
        ('road', 'Road Damage'),
        ('water', 'Water Logging'),
        ('drainage', 'Drainage / Sewage'),
        ('lighting', 'Street Lighting'),
        ('garbage', 'Garbage Dump'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('acknowledged', 'Acknowledged'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    photo = models.ImageField(upload_to='issues/', blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True, default="Sector 4, City Center")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=28.6139)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=77.2090)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    upvotes = models.IntegerField(default=0)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    resolution_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    @property
    def ticket_id(self):
        return f"CP-{self.id:04d}"


class Upvote(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='upvote_records')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent spamming
        pass

    def __str__(self):
        return f"Upvote for {self.issue.title}"
