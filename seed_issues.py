import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civicpulse.settings')
django.setup()

from issues.models import Issue
from django.contrib.auth.models import User

# Create a demo admin and citizen user if they don't exist
admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@civicpulse.gov', 'is_staff': True, 'is_superuser': True}
)
if not admin_user.password:
    admin_user.set_password('admin123')
    admin_user.save()

citizen_user, _ = User.objects.get_or_create(
    username='rahul_sharma',
    defaults={'email': 'rahul@example.com', 'first_name': 'Rahul', 'last_name': 'Sharma'}
)
if not citizen_user.password:
    citizen_user.set_password('citizen123')
    citizen_user.save()

sample_issues = [
    {
        "title": "Massive Deep Pothole on Sector 14 Main Boulevard",
        "description": "A hazardous 2-foot wide pothole right in front of the metro station exit. Multiple two-wheelers have lost balance during night hours.",
        "category": "road",
        "urgency": "critical",
        "address": "Opposite Gate 2, Metro Station, Sector 14",
        "latitude": 28.6289,
        "longitude": 77.2182,
        "status": "in_progress",
        "upvotes": 48,
        "resolution_notes": "PWD inspection team dispatched. Asphalt cold-mix patching scheduled for tonight.",
        "days_ago": 2,
    },
    {
        "title": "Severe Water Logging After Monsoon Rain at Ring Road Underpass",
        "description": "Knee-deep water accumulation causing heavy traffic gridlock and stalling cars. Stormwater pump appears non-functional.",
        "category": "water",
        "urgency": "high",
        "address": "Ring Road Underpass, Near Green Park Junction",
        "latitude": 28.5584,
        "longitude": 77.2045,
        "status": "acknowledged",
        "upvotes": 86,
        "resolution_notes": "Drainage department alerted. Mobile suction pumps mobilized to clear stagnant water.",
        "days_ago": 1,
    },
    {
        "title": "Row of 6 Non-Functional Streetlights on Hill Road",
        "description": "Entire 400m stretch is pitch black at night creating safety hazards for pedestrians, especially women and elderly residents.",
        "category": "lighting",
        "urgency": "high",
        "address": "Hill Road, Between Block B and C Residential Complex",
        "latitude": 28.6358,
        "longitude": 77.2245,
        "status": "reported",
        "upvotes": 34,
        "resolution_notes": "",
        "days_ago": 3,
    },
    {
        "title": "Overflowing Public Garbage Dump & Stray Cattle Hazard",
        "description": "Municipal waste bin has not been cleared for 4 days. Waste spilled over pedestrian pathway emitting foul odor and attracting flies.",
        "category": "garbage",
        "urgency": "critical",
        "address": "Market Complex Back Alley, Sector 7",
        "latitude": 28.5921,
        "longitude": 77.2274,
        "status": "resolved",
        "upvotes": 62,
        "resolution_notes": "Sanitation compactor truck deployed. Area cleared, disinfected, and new secondary bin installed.",
        "days_ago": 4,
    },
    {
        "title": "Broken Open Drainage Slab Near Primary School",
        "description": "Concrete cover over deep storm drain has collapsed completely. Immediate threat to school children and cyclists.",
        "category": "drainage",
        "urgency": "critical",
        "address": "Directly outside Model Public School Gate, Ward 9",
        "latitude": 28.6140,
        "longitude": 77.1990,
        "status": "in_progress",
        "upvotes": 115,
        "resolution_notes": "Warning barricades erected immediately. Heavy reinforced concrete replacement slab being installed.",
        "days_ago": 1,
    },
    {
        "title": "Damaged Speed Breaker with Exposed Rebar Rods",
        "description": "Unmarked broken speed bump with metal spikes protruding. Causing tyre punctures and vehicle underbody damage.",
        "category": "road",
        "urgency": "medium",
        "address": "Outer Ring Service Lane, Near Apollo Pharmacy",
        "latitude": 28.5355,
        "longitude": 77.2600,
        "status": "reported",
        "upvotes": 19,
        "resolution_notes": "",
        "days_ago": 5,
    },
    {
        "title": "Flickering High-Mast Lighting at Central Community Park",
        "description": "High mast floodlight keeps tripping every few minutes, leaving evening joggers and families in sudden darkness.",
        "category": "lighting",
        "urgency": "low",
        "address": "Central Park Playground, Sector 21",
        "latitude": 28.5830,
        "longitude": 77.2340,
        "status": "resolved",
        "upvotes": 27,
        "resolution_notes": "Faulty capacitor and LED driver replaced by Municipal Electrical Wing.",
        "days_ago": 6,
    },
    {
        "title": "Illegal Construction Debris Blocking Storm Water Channel",
        "description": "Dumping of cement sacks and bricks into the natural stormwater stream will cause localized flooding during the upcoming rains.",
        "category": "drainage",
        "urgency": "high",
        "address": "Plot 42, Green Avenue Expansion",
        "latitude": 28.6410,
        "longitude": 77.1850,
        "status": "acknowledged",
        "upvotes": 41,
        "resolution_notes": "Notice issued to site contractor. Earthmover scheduled for channel clearing.",
        "days_ago": 2,
    }
]

# Clear existing issues if needed or populate if empty
if Issue.objects.count() < 5:
    for item in sample_issues:
        created_time = timezone.now() - timedelta(days=item['days_ago'], hours=random.randint(1, 12))
        Issue.objects.create(
            title=item['title'],
            description=item['description'],
            category=item['category'],
            urgency=item['urgency'],
            address=item['address'],
            latitude=item['latitude'],
            longitude=item['longitude'],
            status=item['status'],
            upvotes=item['upvotes'],
            reported_by=citizen_user,
            resolution_notes=item['resolution_notes'],
            created_at=created_time
        )
    print(f"Successfully seeded {len(sample_issues)} sample civic issues!")
else:
    print(f"Database already contains {Issue.objects.count()} issues.")
