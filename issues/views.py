from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils import timezone
from .models import Issue, Upvote
import json


def home(request):
    """
    Landing page with dynamic civic issues, real-time statistics, and map data.
    """
    category_filter = request.GET.get('category', 'all')
    status_filter = request.GET.get('status', 'all')
    search_query = request.GET.get('q', '').strip()

    issues_qs = Issue.objects.all().order_by('-created_at')

    if category_filter and category_filter != 'all':
        issues_qs = issues_qs.filter(category=category_filter)

    if status_filter and status_filter != 'all':
        issues_qs = issues_qs.filter(status=status_filter)

    if search_query:
        issues_qs = issues_qs.filter(title__icontains=search_query) | issues_qs.filter(description__icontains=search_query) | issues_qs.filter(address__icontains=search_query)

    # Key statistics
    total_issues = Issue.objects.count()
    resolved_count = Issue.objects.filter(status='resolved').count()
    in_progress_count = Issue.objects.filter(status='in_progress').count()
    reported_count = Issue.objects.filter(status='reported').count()
    acknowledged_count = Issue.objects.filter(status='acknowledged').count()
    total_upvotes = sum(i.upvotes for i in Issue.objects.all())

    # Map GeoJSON / JSON data for Leaflet
    map_data = []
    for issue in Issue.objects.all():
        map_data.append({
            'id': issue.id,
            'ticket_id': issue.ticket_id,
            'title': issue.title,
            'category': issue.category,
            'category_display': issue.get_category_display(),
            'status': issue.status,
            'status_display': issue.get_status_display(),
            'urgency': issue.urgency,
            'lat': float(issue.latitude),
            'lng': float(issue.longitude),
            'address': issue.address or 'City Area',
            'upvotes': issue.upvotes,
            'created_at': issue.created_at.strftime('%b %d, %Y'),
            'photo_url': issue.photo.url if issue.photo else '',
        })

    context = {
        'issues': issues_qs,
        'all_issues': Issue.objects.all().order_by('-upvotes')[:6],
        'total_issues': total_issues,
        'resolved_count': resolved_count,
        'in_progress_count': in_progress_count,
        'reported_count': reported_count,
        'acknowledged_count': acknowledged_count,
        'total_upvotes': total_upvotes,
        'active_category': category_filter,
        'active_status': status_filter,
        'search_query': search_query,
        'map_data_json': json.dumps(map_data),
    }
    return render(request, 'index.html', context)


def api_issues(request):
    """
    API endpoint returning all issues in JSON for client-side map filtering and live updates.
    """
    issues_list = []
    for issue in Issue.objects.all().order_by('-created_at'):
        issues_list.append({
            'id': issue.id,
            'ticket_id': issue.ticket_id,
            'title': issue.title,
            'description': issue.description,
            'category': issue.category,
            'category_display': issue.get_category_display(),
            'status': issue.status,
            'status_display': issue.get_status_display(),
            'urgency': issue.urgency,
            'lat': float(issue.latitude),
            'lng': float(issue.longitude),
            'address': issue.address or '',
            'upvotes': issue.upvotes,
            'resolution_notes': issue.resolution_notes or '',
            'created_at': issue.created_at.strftime('%d %b %Y, %I:%M %p'),
            'photo_url': issue.photo.url if issue.photo else '',
        })
    return JsonResponse({'issues': issues_list})


@csrf_exempt
def report_issue(request):
    """
    Quick 30-second issue submission endpoint (accepts both multipart form data & JSON).
    """
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        category = request.POST.get('category', 'other')
        urgency = request.POST.get('urgency', 'medium')
        address = request.POST.get('address', 'Downtown')
        latitude = request.POST.get('latitude', '28.6139')
        longitude = request.POST.get('longitude', '77.2090')
        photo = request.FILES.get('photo', None)

        if not title:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'status': 'error', 'message': 'Title is required'}, status=400)
            messages.error(request, 'Please provide an issue title.')
            return redirect('home')

        try:
            lat = float(latitude)
            lng = float(longitude)
        except ValueError:
            lat = 28.6139
            lng = 77.2090

        user = request.user if request.user.is_authenticated else None

        issue = Issue.objects.create(
            title=title,
            description=description,
            category=category,
            urgency=urgency,
            address=address,
            latitude=lat,
            longitude=lng,
            photo=photo,
            reported_by=user,
            status='reported',
            upvotes=1
        )

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({
                'status': 'success',
                'ticket_id': issue.ticket_id,
                'message': 'Issue reported successfully! Municipal dispatch notified.',
                'issue_id': issue.id
            })

        messages.success(request, f'Issue #{issue.ticket_id} reported successfully!')
        return redirect('home')

    return redirect('home')


@csrf_exempt
def toggle_upvote(request, issue_id):
    """
    Asynchronous AJAX upvote endpoint.
    """
    issue = get_object_or_404(Issue, id=issue_id)
    issue.upvotes += 1
    issue.save(update_fields=['upvotes'])

    # Track upvote record
    user = request.user if request.user.is_authenticated else None
    ip = request.META.get('REMOTE_ADDR')
    Upvote.objects.create(user=user, issue=issue, ip_address=ip)

    return JsonResponse({
        'status': 'success',
        'issue_id': issue.id,
        'upvotes': issue.upvotes,
        'message': 'Thanks for supporting this report!'
    })


@csrf_exempt
def update_status(request, issue_id):
    """
    Municipal admin status update endpoint.
    """
    if request.method == 'POST':
        issue = get_object_or_404(Issue, id=issue_id)
        new_status = request.POST.get('status')
        notes = request.POST.get('resolution_notes', '')

        if new_status in dict(Issue.STATUS_CHOICES):
            issue.status = new_status
            if notes:
                issue.resolution_notes = notes
            issue.save()
            return JsonResponse({
                'status': 'success',
                'new_status': issue.status,
                'new_status_display': issue.get_status_display(),
                'resolution_notes': issue.resolution_notes
            })
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
