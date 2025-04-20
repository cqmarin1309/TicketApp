# app/tickets/api.py
from django.http import JsonResponse
from .models import Ticket
from django.core import serializers

def ticket_list_api(request):
    tickets = Ticket.objects.select_related('category', 'created_by', 'assigned_to').all()
    
    data = {
        'tickets': [
            {
                'title': t.title,
                'status_display': t.get_status_display(),
                'category_name': t.category.name if t.category else None,
                'created_by': t.created_by.username,
                'assigned_to': t.assigned_to.username if t.assigned_to else None,
                'created_at': t.created_at.strftime('%d/%m/%Y %H:%M')
            }
            for t in tickets
        ]
    }
    
    return JsonResponse(data)