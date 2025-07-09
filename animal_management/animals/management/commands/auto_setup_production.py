# animals/management/commands/auto_setup_production.py

import os
import glob
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import transaction
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Auto-setup production with data import'

    def handle(self, *args, **options):
        """Run production setup automatically"""
    
        # Only run in production
        if settings.DEBUG:
            self.stdout.write(self.style.WARNING("⚠️ Skipping auto-setup in development mode"))
            return
    
        # Clear existing data first
        try:
            self.stdout.write("🗑️ Clearing existing data...")
            call_command('clear_production', '--confirm')
            self.stdout.write("✅ Database cleared")
        except Exception as e:
            self.stdout.write(f"⚠️ Clear failed: {str(e)}")
    
        # Create admin user AFTER clearing
        self.stdout.write("🔧 Creating production admin user...")
        try:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@pawrescue.com',
                password='PawRescue2025!',
                user_type='STAFF',
                is_staff=True,
                is_superuser=True,
                is_email_verified=True
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Created admin user: {admin_user.username}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error creating admin user: {str(e)}"))
    
        # Look for export data and import
        export_dirs = glob.glob('data_export_*')
        if export_dirs:
            export_dir = sorted(export_dirs)[-1]
            self.stdout.write(f"📊 Found export data: {export_dir}")
        
            try:
                self.stdout.write("🚀 Importing production data...")
                call_command('transfer_to_production', '--mode=import', f'--file={export_dir}', '--confirm')
                self.stdout.write(self.style.SUCCESS("✅ Production data imported successfully!"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Import failed: {str(e)}"))
    
        # Final verification
        from animals.models import Animal
        animal_count = Animal.objects.count()
        user_count = User.objects.count()
        self.stdout.write(self.style.SUCCESS(f"🎉 Setup complete! {animal_count} animals, {user_count} users"))