# app/tickets/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    
    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
    
    def __str__(self):
        return self.name

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Abierto'),
        ('in_progress', 'En progreso'),
        ('closed', 'Cerrado'),
        ('deleted', 'Eliminado')  # Nuevo estado
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(verbose_name="Descripción")

    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='open',
        verbose_name="Estado"
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name="Categoría"
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='tickets_created',
        verbose_name="Creado por"
    )
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_assigned',
        verbose_name="Asignado a"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")
    #Campos de la eliminación lógica
    is_deleted = models.BooleanField(default=False, verbose_name="Eliminado")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha eliminación")
    deleted_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_deleted',
        verbose_name="Eliminado por"
    )

    def delete(self, user=None, *args, **kwargs):
        """Sobrescribimos el método delete para eliminación lógica"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.status = 'deleted'
        self.save()

    def restore(self):
        """Método para restaurar un ticket eliminado"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.status = 'open'
        self.save()
    
    class Meta:
        verbose_name = "Ticket"
        verbose_name_plural = "Tickets"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"