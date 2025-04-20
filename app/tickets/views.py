# app/tickets/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Ticket, Category
from .forms import TicketForm
from .serializers import TicketSerializer, TicketCreateSerializer
from django.contrib.auth.models import User

# Vista tradicional para renderizar templates
@login_required
def ticket_list(request):
    return render(request, 'tickets/list.html')

@login_required
def create_ticket(request):
    categories = Category.objects.all().order_by('name')
    users = User.objects.filter(is_active=True)
    return render(request, 'tickets/create.html', {
        'categories': categories,
        'users': users
    })

# API Views
@api_view(['GET'])
@permission_classes([])
def api_categories(request):
    categories = Category.objects.all().order_by('name')
    data = [{'id': cat.id, 'name': cat.name} for cat in categories]
    return Response(data)

@api_view(['GET'])
@permission_classes([])
def api_users(request):
    users = User.objects.filter(is_active=True)
    data = [{'id': user.id, 'username': user.username} for user in users]
    return Response(data)

@api_view(['GET'])
def api_tickets(request):
    tickets = Ticket.objects.select_related('category', 'created_by', 'assigned_to').filter(is_deleted=False)
    serializer = TicketSerializer(tickets, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
def api_create_ticket(request):
    serializer = TicketCreateSerializer(data=request.data)
    if serializer.is_valid():
        ticket = serializer.save(created_by=request.user)
        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT', 'DELETE'])
def api_ticket_detail(request, pk):
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TicketSerializer(ticket, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if ticket.is_deleted:
            return Response(
                {'error': 'No se puede editar un ticket eliminado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TicketCreateSerializer(ticket, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(TicketSerializer(ticket).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if ticket.is_deleted:
            return Response(
                {'error': 'El ticket ya está eliminado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ticket.delete(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)