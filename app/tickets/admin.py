from django.contrib import admin
from .models import Category, Ticket

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'category', 'created_by', 'assigned_to', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'description')
    raw_id_fields = ('created_by', 'assigned_to')
