# animal_management/management/commands/transfer_to_production.py

import json
import os
import sys
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core import serializers
from django.db import transaction
from django.apps import apps
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Command(BaseCommand):
    help = 'Safely transfer local data to production with validation and rollback'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mode',
            choices=['export', 'import', 'validate', 'fix-users'],
            required=True,
            help='Operation mode'
        )
        parser.add_argument(
            '--file',
            type=str,
            help='JSON file for export/import'
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm destructive operations'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without executing'
        )

    def handle(self, *args, **options):
        mode = options['mode']
        
        if mode == 'export':
            self.export_data(options)
        elif mode == 'import':
            self.import_data(options)
        elif mode == 'validate':
            self.validate_data(options)
        elif mode == 'fix-users':
            self.fix_user_types(options)

    def export_data(self, options):
        """Export all data to JSON files with proper ordering"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        export_dir = f"data_export_{timestamp}"
        
        if not options['dry_run']:
            os.makedirs(export_dir, exist_ok=True)
        
        # Define model export order (dependencies first)
        export_order = [
            # Core models first
            'users.User',
            'animals.Animal',
            'reports.Report',
            'reports.ReportUpdate',
            
            # Healthcare
            'healthcare.VaccinationRecord',
            'healthcare.MedicalRecord',
            'healthcare.MedicalSupplyUsage',
            'healthcare.HealthStatus',
            
            # Adoptions
            'adoptions.AdopterProfile',
            'adoptions.AnimalBehaviorProfile',
            'adoptions.AdoptionApplication',
            'adoptions.AdoptionMatch',
            
            # Donations
            'donations.DonationCampaign',
            'donations.ImpactCategory',
            'donations.Donation',
            'donations.DonationImpact',
            'donations.SuccessStory',
            'donations.DonorImpactSummary',
            'donations.RecurringDonation',
            
            # Community
            'community.UserActivity',
            'community.Reward',
            'community.Achievement',
            'community.UserAchievement',
            'community.RewardRedemption',
            'community.ForumCategory',
            'community.ForumTopic',
            'community.ForumPost',
            'community.KnowledgeArticle',
            
            # Volunteers
            'volunteers.VolunteerProfile',
            'volunteers.VolunteerOpportunity',
            'volunteers.VolunteerAssignment',
            'volunteers.RescueVolunteerAssignment',
            
            # Resources
            'resources.ResourceCategory',
            'resources.EducationalResource',
            'resources.ResourceRating',
            'resources.InteractiveLearningModule',
            'resources.LearningProgress',
            'resources.QuizQuestion',
            'resources.UserQuizAttempt',
            
            # Virtual Adoptions
            'virtual_adoptions.VirtualAdoption',
            
            # Notifications
            'notifications.Notification',
            
            # Mental Health
            'mental_health.ResourceCategory',
            'mental_health.MentalHealthResource',
            'mental_health.SelfCareReminder',
            'mental_health.StressLogEntry',
            
            # Inventory
            'inventory.ItemCategory',
            'inventory.Supplier',
            'inventory.InventoryItem',
            'inventory.InventoryTransaction',
            'inventory.Purchase',
            'inventory.PurchaseItem',
            'inventory.InventoryAuditLog',
            
            # Analytics
            'analytics.PredictionModel',
            'analytics.Prediction',
        ]
        
        total_records = 0
        export_summary = {}
        
        for model_name in export_order:
            try:
                model = apps.get_model(model_name)
                queryset = model.objects.all()
                count = queryset.count()
                
                if count > 0:
                    self.stdout.write(f"Exporting {model_name}: {count} records")
                    
                    if not options['dry_run']:
                        # Export to individual files
                        filename = f"{export_dir}/{model_name.replace('.', '_')}.json"
                        with open(filename, 'w') as f:
                            serialized_data = serializers.serialize('json', queryset, indent=2)
                            f.write(serialized_data)
                    
                    total_records += count
                    export_summary[model_name] = count
                else:
                    self.stdout.write(f"Skipping {model_name}: no records")
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error exporting {model_name}: {str(e)}")
                )
        
        # Create summary file
        if not options['dry_run']:
            summary_file = f"{export_dir}/export_summary.json"
            with open(summary_file, 'w') as f:
                json.dump({
                    'timestamp': timestamp,
                    'total_records': total_records,
                    'models': export_summary,
                    'database_info': {
                        'engine': settings.DATABASES['default']['ENGINE'],
                        'name': settings.DATABASES['default']['NAME'],
                    }
                }, f, indent=2)
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Export complete! {total_records} total records"
            )
        )
        
        if not options['dry_run']:
            self.stdout.write(f"📁 Files saved to: {export_dir}/")
            self.stdout.write("🚀 Ready for production import!")

    def import_data(self, options):
        """Import data to production with validation"""
        
        if not options['file']:
            self.stdout.write(
                self.style.ERROR("❌ Please specify --file with export directory")
            )
            return
        
        export_dir = options['file']
        
        if not os.path.exists(export_dir):
            self.stdout.write(
                self.style.ERROR(f"❌ Directory not found: {export_dir}")
            )
            return
        
        # Check if production
        if not settings.DEBUG and not options['confirm']:
            self.stdout.write(
                self.style.ERROR(
                    "❌ Production import requires --confirm flag"
                )
            )
            return
        
        # Load summary
        summary_file = f"{export_dir}/export_summary.json"
        if os.path.exists(summary_file):
            with open(summary_file, 'r') as f:
                summary = json.load(f)
            self.stdout.write(f"📊 Importing {summary['total_records']} records")
        
        # Import in same order as export
        with transaction.atomic():
            try:
                for model_name, count in summary['models'].items():
                    filename = f"{export_dir}/{model_name.replace('.', '_')}.json"
                    
                    if os.path.exists(filename):
                        self.stdout.write(f"Importing {model_name}: {count} records")
                        
                        if not options['dry_run']:
                            with open(filename, 'r') as f:
                                objects = serializers.deserialize('json', f.read())
                                for obj in objects:
                                    obj.save()
                
                self.stdout.write(
                    self.style.SUCCESS("✅ All data imported successfully!")
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Import failed: {str(e)}")
                )
                raise  # This will trigger rollback

    def validate_data(self, options):
        """Validate data integrity"""
        
        self.stdout.write("🔍 Validating data integrity...")
        
        issues = []
        
        # Check user types
        users_without_type = User.objects.filter(
            models.Q(user_type='') | models.Q(user_type__isnull=True)
        )
        
        if users_without_type.exists():
            issues.append(f"❌ {users_without_type.count()} users have empty user_type")
        
        # Check animals without locations
        animals_no_location = apps.get_model('animals.Animal').objects.filter(
            geo_location__isnull=True,
            last_location_json__isnull=True
        )
        
        if animals_no_location.exists():
            issues.append(f"⚠️ {animals_no_location.count()} animals have no location data")
        
        # Check orphaned records
        Animal = apps.get_model('animals.Animal')
        orphaned_adoptions = apps.get_model('adoptions.AdoptionMatch').objects.exclude(
            animal__in=Animal.objects.all()
        )
        
        if orphaned_adoptions.exists():
            issues.append(f"❌ {orphaned_adoptions.count()} adoption matches have invalid animals")
        
        if issues:
            self.stdout.write(self.style.ERROR("⚠️ Issues found:"))
            for issue in issues:
                self.stdout.write(f"  {issue}")
        else:
            self.stdout.write(self.style.SUCCESS("✅ Data validation passed!"))
        
        return len(issues) == 0

    def fix_user_types(self, options):
        """Fix users with empty user_type"""
        
        users_without_type = User.objects.filter(
            models.Q(user_type='') | models.Q(user_type__isnull=True)
        )
        
        if not users_without_type.exists():
            self.stdout.write(self.style.SUCCESS("✅ All users have valid user_type"))
            return
        
        self.stdout.write(f"Found {users_without_type.count()} users with empty user_type:")
        
        for user in users_without_type:
            self.stdout.write(f"  - {user.username} ({user.email})")
        
        if options['dry_run']:
            self.stdout.write("🔍 Dry run - no changes made")
            return
        
        if not options['confirm']:
            self.stdout.write(
                self.style.ERROR("❌ Use --confirm to fix user types")
            )
            return
        
        # Fix users by setting default type based on patterns
        fixed_count = 0
        
        for user in users_without_type:
            # Logic to determine user type
            new_type = 'PUBLIC'  # Default
            
            # Check if user has volunteer profile
            if hasattr(user, 'volunteerprofile'):
                new_type = 'VOLUNTEER'
            # Check if user has shelter-related activity
            elif user.sheltered_animals.exists():
                new_type = 'SHELTER'
            # Check if user has staff permissions
            elif user.is_staff:
                new_type = 'STAFF'
            
            user.user_type = new_type
            user.save()
            fixed_count += 1
            
            self.stdout.write(f"✅ Fixed {user.username} -> {new_type}")
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ Fixed {fixed_count} users")
        )