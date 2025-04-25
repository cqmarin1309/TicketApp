# app/tickets/serializers.py
from rest_framework import serializers
from .models import Ticket, Category
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TicketSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer()
    category = CategorySerializer()
    can_edit = serializers.SerializerMethodField()
    
    # Cambia esto para que coincida con el nombre del campo en el modelo
    status_display = serializers.CharField(
        source='get_status_display', 
        read_only=True
    )

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'is_deleted', 'deleted_at', 'deleted_by']

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return False
        
    # Permitir edición al creador o a superusuarios
        return request.user == obj.created_by or request.user.is_superuser

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'category', 'assigned_to', 'status']