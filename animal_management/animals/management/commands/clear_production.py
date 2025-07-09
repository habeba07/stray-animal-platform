# animals/management/commands/clear_production.py

from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
from django.apps import apps

class Command(BaseCommand):
    help = 'Clear production database (DESTRUCTIVE)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm destructive operation'
        )

    def handle(self, *args, **options):
        if settings.DEBUG:
            self.stdout.write(self.style.ERROR("❌ This command only works in production"))
            return
        
        if not options['confirm']:
            self.stdout.write(self.style.ERROR("❌ Use --confirm to clear production database"))
            return
        
        self.stdout.write(self.style.WARNING("🗑️ Clearing production database..."))
        
        # Get all models
        all_models = apps.get_models()
        
        # Clear data from all models
        for model in all_models:
            if hasattr(model, 'objects'):
                count = model.objects.count()
                if count > 0:
                    model.objects.all().delete()
                    self.stdout.write(f"  ✅ Cleared {count} records from {model._meta.label}")
        
        # Reset sequences
        with connection.cursor() as cursor:
            cursor.execute("SELECT setval(pg_get_serial_sequence('auth_user', 'id'), 1, false);")
            cursor.execute("SELECT setval(pg_get_serial_sequence('animals_animal', 'id'), 1, false);")
            cursor.execute("SELECT setval(pg_get_serial_sequence('notifications_notification', 'id'), 1, false);")
        
        self.stdout.write(self.style.SUCCESS("✅ Production database cleared!"))