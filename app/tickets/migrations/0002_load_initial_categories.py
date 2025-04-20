from django.db import migrations

def add_initial_categories(apps, schema_editor):
    Category = apps.get_model('tickets', 'Category')
    
    initial_categories = [
        {
            'name': 'Soporte Técnico',
            'description': 'Problemas con hardware o software'
        },
        {
            'name': 'Facturación',
            'description': 'Consultas sobre pagos y facturas'
        },
        {
            'name': 'Ventas',
            'description': 'Consultas previas a la compra'
        },
        {
            'name': 'Reclamos',
            'description': 'Problemas con productos o servicios'
        }
    ]
    
    for category_data in initial_categories:
        Category.objects.get_or_create(**category_data)

def remove_initial_categories(apps, schema_editor):
    Category = apps.get_model('tickets', 'Category')
    Category.objects.filter(
        name__in=['Soporte Técnico', 'Facturación', 'Ventas', 'Reclamos']
    ).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('tickets', '0001_initial'),  # Asegúrate que este sea el nombre correcto de tu migración inicial
    ]

    operations = [
        migrations.RunPython(
            add_initial_categories,
            remove_initial_categories  # Función para revertir los cambios
        ),
    ]