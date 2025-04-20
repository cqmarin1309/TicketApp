from django.db import migrations

def update_categories(apps, schema_editor):
    Category = apps.get_model('tickets', 'Category')
    
    updates = {
        # 'Nombre actual': ('Nuevo nombre', 'Nueva descripción'),
        'Soporte Técnico': ('Informes y Paneles', 'Problemas con la visualización y precisión de datos en informes y paneles'),
        'Facturación': ('Acceso y Permisos', 'Solicitudes y problemas relacionados con el acceso a datos e informes'),
        'Ventas': ('ETL y Datos', 'Incidencias relacionadas con la extracción, transformación y carga de datos'),
        'Reclamos': ('Herramientas BI', 'Incidencias técnicas con el software de inteligencia empresarial')
    }
    
    for old_name, (new_name, new_desc) in updates.items():
        Category.objects.filter(name=old_name).update(
            name=new_name,
            description=new_desc
        )

def reverse_updates(apps, schema_editor):
    Category = apps.get_model('tickets', 'Category')
    
    reverses = {
        'Soporte IT': ('Soporte Técnico', 'Problemas con hardware o software'),
        'Incidencias': ('Reclamos', 'Problemas con productos/servicios')
    }
    
    for new_name, (old_name, old_desc) in reverses.items():
        Category.objects.filter(name=new_name).update(
            name=old_name,
            description=old_desc
        )

class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0002_load_initial_categories'),  # Depende de tu última migración
    ]

    operations = [
        migrations.RunPython(update_categories, reverse_updates),
    ]