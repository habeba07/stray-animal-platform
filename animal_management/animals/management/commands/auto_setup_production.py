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
            self.stdout.write(
                self.style.WARNING("⚠️ Skipping auto-setup in development mode")
            )
            return
        
        # Check if we already have data
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.SUCCESS("✅ Production already has admin user, skipping setup")
            )
            return
        
        # Create admin user
        self.stdout.write("🔧 Creating production admin user...")
        
        try:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@pawrescue.com',
                password='PawRescue2025!',  # Change this!
                user_type='STAFF',
                is_staff=True,
                is_superuser=True,
                is_email_verified=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ Created admin user: {admin_user.username}")
            )
            self.stdout.write(
                self.style.WARNING("⚠️ Default password: PawRescue2025! - CHANGE THIS!")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error creating admin user: {str(e)}")
            )
        
        # Look for export data
        export_dirs = glob.glob('data_export_*')
        
        if not export_dirs:
            self.stdout.write(
                self.style.WARNING("⚠️ No export data found, skipping import")
            )
            return
        
        # Use the most recent export
        export_dir = sorted(export_dirs)[-1]
        
        self.stdout.write(f"📊 Found export data: {export_dir}")
        
        # Import the data
        try:
            self.stdout.write("🚀 Importing production data...")
            
            call_command(
                'transfer_to_production',
                '--mode=import',
                f'--file={export_dir}',
                '--confirm'
            )
            
            self.stdout.write(
                self.style.SUCCESS("✅ Production data imported successfully!")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Import failed: {str(e)}")
            )
        
        # Final verification
        animal_count = User.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Production setup complete! {animal_count} users imported")
        )