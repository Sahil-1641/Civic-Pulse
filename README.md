# CivicPulse

**A Crowdsourced Civic Issue Reporting and Resolution Tracking Platform**

> Bridging citizens and government �� report local problems, track resolution, make your city better.

---

## What is CivicPulse?

CivicPulse is a web platform where citizens can report local infrastructure problems like broken roads, water logging, overflowing garbage, and non-functional streetlights — using just their phone. Every issue is tracked publicly on an interactive map with full transparency from report to resolution.

---

## Key Features

- Issue Reporting — Take a photo, auto-detect GPS location, select category, submit in 30 seconds
- Interactive Map — Leaflet.js map with color-coded markers showing all issues by status
- Status Tracking — Track issues through 4 stages: Reported, Acknowledged, In Progress, Resolved
- Community Upvoting — Citizens upvote issues they face, pushing critical problems to the top
- Analytics Dashboard — Charts showing issue categories, monthly trends, and resolution rates
- Admin Panel — Government officials manage all issues, update statuses, view analytics
- Authentication — Secure user registration and login system
- Responsive Design — Works seamlessly on mobile, tablet, and desktop
- AI Auto-Categorization — AI automatically categorizes reported issues based on description
- Trending Algorithm — AI detects trending issues based on upvote velocity

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+), Tailwind CSS |
| Backend | Django 6.0 (Python 3.14) |
| Database | PostgreSQL (Production) / SQLite (Development) |
| Maps | Leaflet.js with OpenStreetMap |
| Charts | Chart.js |
| Icons | Font Awesome 6.5 |
| Cloud Storage | Cloudinary (Image Uploads) |
| Version Control | Git and GitHub |

---

## Project Structure

```
CivicPulse/
├── civicpulse/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── issues/                  # Main app
│   ├── models.py            # Issue and Upvote models
│   ├── views.py             # View functions
│   ├── admin.py             # Admin panel config
│   ├── urls.py              # App URL routes
│   └── migrations/
├── templates/               # HTML templates
│   └── index.html           # Landing page
├── static/                  # CSS, JS, Images
│   ├── css/
│   ├── js/
│   └── images/
├── media/                   # User uploaded files
├── manage.py                # Django management
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sahil-1641/CivicPulse.git
cd CivicPulse

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment (Windows)
venv\Scripts\activate

# 4. Install dependencies
pip install django cloudinary django-cloudinary-storage pillow

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create superuser (admin account)
python manage.py createsuperuser

# 7. Run the development server
python manage.py runserver
```

### Open in Browser
- Landing Page: http://127.0.0.1:8000/
- Admin Panel: http://127.0.0.1:8000/admin/

---

## Database Models

### Issue Model
| Field | Type | Description |
|---|---|---|
| title | CharField | Short title of the issue |
| description | TextField | Detailed description |
| category | CharField | Road / Water / Drainage / Lighting / Garbage / Other |
| photo | ImageField | Uploaded photo via Cloudinary |
| latitude | DecimalField | GPS latitude |
| longitude | DecimalField | GPS longitude |
| status | CharField | Reported / Acknowledged / In Progress / Resolved |
| upvotes | IntegerField | Number of upvotes |
| reported_by | ForeignKey | Link to User model |
| created_at | DateTimeField | When the issue was reported |
| updated_at | DateTimeField | Last status update |

### Upvote Model
| Field | Type | Description |
|---|---|---|
| user | ForeignKey | Who upvoted |
| issue | ForeignKey | Which issue was upvoted |
| created_at | DateTimeField | When the upvote was given |

---

## User Roles

| Role | Access | Capabilities |
|---|---|---|
| Citizen | /dashboard/ | Report issues, upvote, track status |
| Admin | /admin-dashboard/ | Manage all issues, view analytics, update status |
| Public | / (Landing Page) | View map, see issues, no login required |

---

## Pages

| Page | URL | Description |
|---|---|---|
| Landing Page | / | Hero section, stats, how it works, map preview |
| Login | /login/ | User authentication |
| Register | /register/ | New user signup |
| Report Issue | /report/ | Submit new issue with photo and GPS |
| Map View | /map/ | Full interactive map |
| Issue Detail | /issue/id/ | Single issue with status timeline |
| Dashboard | /dashboard/ | User personal dashboard |
| Admin Dashboard | /admin-dashboard/ | Analytics and issue management |
| About Us | /about/ | Project information |
| Contact | /contact/ | Contact form |

---

## AI Features

| Feature | How It Works |
|---|---|
| Auto-Categorization | NLP analyzes issue description and auto-suggests category |
| Priority Scoring | AI calculates priority based on upvotes, severity, location density |
| Duplicate Detection | Text similarity detects similar nearby issues |
| Trending Algorithm | Upvote velocity determines trending issues |

---

## Future Scope

- Mobile app (Flutter / React Native)
- WhatsApp bot for issue reporting
- AI-powered resolution time prediction
- Automated department routing
- Real-time notifications via WebSocket
- Multi-language support (Hindi, Marathi, etc.)
- Government API integration

---

## Acknowledgements

- FixMyStreet (fixmystreet.com) — Inspiration for civic issue reporting
- SeeClickFix (seeclickfix.com) — Admin dashboard design reference
- Leaflet.js (leafletjs.com) — Open-source mapping library
- Tailwind CSS (tailwindcss.com) — Utility-first CSS framework
- Django (djangoproject.com) — Python web framework
- Cloudinary (cloudinary.com) — Image hosting service

---

## Author

**Sahil Goswami**
- GitHub: Sahil-1641
- Email: sahilgoswami0921@gmail.com

---

> Built with heart for a better city. CivicPulse — Your Voice, Your City.
