from django.apps import AppConfig


class TicketsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tickets'

def ready(self):
        # Importamos los natural keys cuando la app esté lista
        from . import natural_keys