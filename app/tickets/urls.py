# app/tickets/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # URLs para renderizado tradicional (HTML)
    path('', views.ticket_list, name='ticket_list'),
    path('new/', views.create_ticket, name='create_ticket'),
    
    # URLs para API (AJAX/JSON)
    path('api/categories/', views.api_categories, name='api_categories'),
    path('api/users/', views.api_users, name='api_users'),
    path('api/tickets/', views.api_tickets, name='api_tickets'),
    path('api/tickets/create/', views.api_create_ticket, name='api_create_ticket'),
    path('api/tickets/<int:pk>/', views.api_ticket_detail, name='api_ticket_detail'),
]