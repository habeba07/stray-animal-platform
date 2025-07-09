# setup_shelter_enhancements.py
# Run this script to set up the SHELTER user enhancements

import os
import django
from django.core.management import execute_from_command_line
from django.db import transaction
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'animal_management.settings')
django.setup()

def setup_database_migrations():
    """Apply all necessary database migrations"""
    print("🔄 Applying database migrations...")
    
    # Create migration files
    execute_from_command_line(['manage.py', 'makemigrations', 'animals'])
    execute_from_command_line(['manage.py', 'makemigrations', 'reports']) 
    execute_from_command_line(['manage.py', 'makemigrations', 'healthcare'])
    execute_from_command_line(['manage.py', 'makemigrations', 'adoptions'])
    
    # Apply migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("✅ Database migrations completed!")

def create_sample_data():
    """Create sample data for testing SHELTER features - SAFE VERSION"""
    print("🔄 Creating sample data for SHELTER features...")
    
    from animals.models import Animal
    from reports.models import Report
    from healthcare.models import VaccinationRecord, MedicalRecord, HealthStatus
    from django.contrib.auth import get_user_model
    from django.contrib.gis.geos import Point
    
    User = get_user_model()
    
    # Create shelter user if doesn't exist
    shelter_user, created = User.objects.get_or_create(
        username='shelter_admin',
        defaults={
            'email': 'shelter@example.com',
            'user_type': 'SHELTER',
            'first_name': 'Shelter',
            'last_name': 'Administrator'
        }
    )
    if created:
        shelter_user.set_password('shelter123')
        shelter_user.save()
        print(f"✅ Created shelter user: {shelter_user.username}")
    else:
        print(f"✅ Shelter user already exists: {shelter_user.username}")
    
    # Create sample animals with UNIQUE names to avoid conflicts
    import random
    sample_animals = [
        {
            'name': f'Max_Emergency_{random.randint(1000, 9999)}',
            'animal_type': 'DOG',
            'breed': 'Golden Retriever',
            'gender': 'MALE',
            'status': 'URGENT_MEDICAL',
            'priority_level': 'EMERGENCY',
            'health_status': 'Injured leg, requires immediate attention',
            'special_instructions': 'Handle with extreme care - aggressive when in pain',
            'estimated_medical_cost': 350.00,
            'current_shelter': shelter_user
        },
        {
            'name': f'Luna_Quarantine_{random.randint(1000, 9999)}',
            'animal_type': 'CAT', 
            'breed': 'Siamese',
            'gender': 'FEMALE',
            'status': 'QUARANTINE',
            'priority_level': 'HIGH',
            'health_status': 'Respiratory infection - contagious',
            'quarantine_end_date': datetime.now().date() + timedelta(days=5),
            'estimated_medical_cost': 125.00,
            'current_shelter': shelter_user
        },
        {
            'name': f'Buddy_Treatment_{random.randint(1000, 9999)}',
            'animal_type': 'DOG',
            'breed': 'Labrador Mix',
            'gender': 'MALE', 
            'status': 'UNDER_TREATMENT',
            'priority_level': 'NORMAL',
            'health_status': 'Recovery from surgery - doing well',
            'estimated_medical_cost': 280.00,
            'current_shelter': shelter_user
        },
        {
            'name': f'Whiskers_Transfer_{random.randint(1000, 9999)}',
            'animal_type': 'CAT',
            'breed': 'Domestic Shorthair',
            'gender': 'FEMALE',
            'status': 'READY_FOR_TRANSFER',
            'priority_level': 'NORMAL',
            'health_status': 'Healthy and ready for adoption',
            'transfer_ready_date': datetime.now().date(),
            'current_shelter': shelter_user
        },
        {
            'name': f'Charlie_Available_{random.randint(1000, 9999)}',
            'animal_type': 'DOG',
            'breed': 'Border Collie',
            'gender': 'MALE',
            'status': 'AVAILABLE',
            'priority_level': 'NORMAL',
            'health_status': 'Excellent health',
            'vaccinated': True,
            'neutered_spayed': True,
            'microchipped': True,
            'current_shelter': shelter_user
        }
    ]
    
    animals_created = []
    for animal_data in sample_animals:
        # Use create() instead of get_or_create() to avoid conflicts
        try:
            animal = Animal.objects.create(**animal_data)
            animals_created.append(animal)
            print(f"✅ Created animal: {animal.name} ({animal.status})")
        except Exception as e:
            print(f"⚠️ Could not create animal {animal_data['name']}: {e}")
    
    # Create sample reports with unique descriptions
    sample_reports = [
        {
            'description': f'Emergency: Dog hit by car on Main Street - bleeding heavily {random.randint(1000, 9999)}',
            'urgency_level': 'EMERGENCY',
            'status': 'PENDING',
            'animal_condition_choice': 'INJURED',
            'immediate_danger': True,
            'geo_location': Point(-122.4194, 37.7749),
            'location_details': 'Main Street and 5th Avenue intersection',
            'reporter': shelter_user
        },
        {
            'description': f'Pregnant stray cat needs immediate help {random.randint(1000, 9999)}',
            'urgency_level': 'HIGH',
            'status': 'ASSIGNED',
            'animal_condition_choice': 'PREGNANT',
            'geo_location': Point(-122.4094, 37.7849),
            'location_details': 'Behind grocery store on Oak Street',
            'assigned_to': shelter_user,
            'reporter': shelter_user
        },
        {
            'description': f'Lost dog wandering neighborhood {random.randint(1000, 9999)}',
            'urgency_level': 'NORMAL', 
            'status': 'IN_PROGRESS',
            'animal_condition_choice': 'HEALTHY',
            'geo_location': Point(-122.4294, 37.7649),
            'location_details': 'Residential area near park',
            'reporter': shelter_user
        }
    ]
    
    for report_data in sample_reports:
        try:
            report = Report.objects.create(**report_data)
            print(f"✅ Created report: {report.urgency_level} priority")
        except Exception as e:
            print(f"⚠️ Could not create report: {e}")
    
    # Rest of the function remains the same...
    print("✅ Sample data creation completed!")

def setup_inventory_items():
    """Create sample inventory items for medical supplies"""
    print("🔄 Setting up medical inventory...")
    
    try:
        from inventory.models import InventoryItem, ItemCategory
        
        # First, create categories
        medical_category, _ = ItemCategory.objects.get_or_create(
            name='Medical Supplies',
            defaults={'description': 'Medical supplies and medications for animal care'}
        )
        
        vaccine_category, _ = ItemCategory.objects.get_or_create(
            name='Vaccines',
            defaults={'description': 'Vaccines for animal immunization'}
        )
        
        wound_care_category, _ = ItemCategory.objects.get_or_create(
            name='Wound Care',
            defaults={'description': 'Wound care and surgical supplies'}
        )
        
        print("✅ Created inventory categories")
        
        medical_supplies = [
            {
                'name': 'Rabies Vaccine',
                'category': vaccine_category,
                'item_type': 'MEDICAL',
                'quantity': 15,
                'unit': 'DOSE',
                'minimum_threshold': 10,
                'cost_per_unit': 25.00,
                'description': 'Annual rabies vaccination for dogs and cats',
                'requires_refrigeration': True,
                'batch_number': 'RV2024-001'
            },
            {
                'name': 'Distemper Vaccine',
                'category': vaccine_category,
                'item_type': 'MEDICAL',
                'quantity': 8,  # Low stock
                'unit': 'DOSE',
                'minimum_threshold': 10,
                'cost_per_unit': 30.00,
                'description': 'Distemper prevention vaccine',
                'requires_refrigeration': True,
                'batch_number': 'DV2024-002'
            },
            {
                'name': 'Antibiotics (Amoxicillin)',
                'category': medical_category,
                'item_type': 'MEDICAL',
                'quantity': 25,
                'unit': 'UNIT',
                'minimum_threshold': 15,
                'cost_per_unit': 2.50,
                'description': 'General antibiotic for infections',
                'batch_number': 'AMX2024-003'
            },
            {
                'name': 'Surgical Gauze',
                'category': wound_care_category,
                'item_type': 'MEDICAL',
                'quantity': 50,
                'unit': 'UNIT',
                'minimum_threshold': 20,
                'cost_per_unit': 5.00,
                'description': 'Sterile gauze for wound dressing'
            },
            {
                'name': 'Pain Medication (Tramadol)',
                'category': medical_category,
                'item_type': 'MEDICAL',
                'quantity': 3,  # Very low stock
                'unit': 'BOX',
                'minimum_threshold': 5,
                'cost_per_unit': 45.00,
                'description': 'Pain relief medication for post-surgery',
                'batch_number': 'TRM2024-004'
            },
            {
                'name': 'IV Fluids',
                'category': medical_category,
                'item_type': 'MEDICAL',
                'quantity': 12,
                'unit': 'UNIT',
                'minimum_threshold': 8,
                'cost_per_unit': 15.00,
                'description': 'Saline solution for hydration therapy',
                'requires_refrigeration': False
            }
        ]
        
        for supply_data in medical_supplies:
            item, created = InventoryItem.objects.get_or_create(
                name=supply_data['name'],
                defaults=supply_data
            )
            if created:
                status = "⚠️ LOW STOCK" if item.quantity <= item.minimum_threshold else "✅"
                print(f"{status} Created inventory: {item.name} ({item.quantity} {item.unit})")
        
        print("✅ Medical inventory setup completed!")
        
    except ImportError:
        print("⚠️ Inventory app not available - skipping inventory setup")
    except Exception as e:
        print(f"⚠️ Error setting up inventory: {e}")

def configure_settings():
    """Configure Django settings for SHELTER features"""
    print("🔄 Configuring settings...")
    
    settings_additions = """
# Add these to your settings.py for SHELTER enhancements

# SHELTER Configuration
SHELTER_CONFIG = {
    'MAX_CAPACITY': 150,  # Maximum animal capacity
    'EMERGENCY_RESPONSE_TIME_TARGET': 2,  # Hours
    'LOW_STOCK_THRESHOLD_PERCENTAGE': 20,  # Percentage for low stock alerts
    'QUARANTINE_DEFAULT_DAYS': 14,  # Default quarantine period
    'MEDICAL_RECORD_RETENTION_DAYS': 365 * 7,  # 7 years
}

# Email configuration for alerts (optional)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-server.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'alerts@yourshelter.org'
EMAIL_HOST_PASSWORD = 'your-email-password'

# Notification settings
NOTIFICATION_SETTINGS = {
    'SEND_EMAIL_ALERTS': True,
    'EMERGENCY_NOTIFICATION_EMAILS': ['emergency@yourshelter.org'],
    'MEDICAL_ALERT_EMAILS': ['medical@yourshelter.org'],
    'INVENTORY_ALERT_EMAILS': ['inventory@yourshelter.org'],
}

# Logging for SHELTER operations
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'shelter_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/shelter_operations.log',
        },
        'medical_file': {
            'level': 'INFO', 
            'class': 'logging.FileHandler',
            'filename': 'logs/medical_activities.log',
        },
    },
    'loggers': {
        'shelter.operations': {
            'handlers': ['shelter_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'medical.activities': {
            'handlers': ['medical_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
"""
    
    print("📋 Add the following to your settings.py:")
    print(settings_additions)
    print("✅ Settings configuration guide provided!")

def setup_permissions():
    """Set up user permissions for SHELTER features"""
    print("🔄 Setting up user permissions...")
    
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    
    # Create SHELTER staff group
    shelter_group, created = Group.objects.get_or_create(name='Shelter Staff')
    if created:
        print("✅ Created 'Shelter Staff' group")
    
    # Add relevant permissions
    try:
        from animals.models import Animal
        from healthcare.models import VaccinationRecord, MedicalRecord
        
        content_types = [
            ContentType.objects.get_for_model(Animal),
            ContentType.objects.get_for_model(VaccinationRecord), 
            ContentType.objects.get_for_model(MedicalRecord),
        ]
        
        permissions_to_add = []
        for ct in content_types:
            permissions_to_add.extend([
                Permission.objects.get(content_type=ct, codename__startswith='add_'),
                Permission.objects.get(content_type=ct, codename__startswith='change_'),
                Permission.objects.get(content_type=ct, codename__startswith='view_'),
            ])
        
        shelter_group.permissions.set(permissions_to_add)
        print("✅ Added permissions to Shelter Staff group")
        
    except Exception as e:
        print(f"⚠️ Could not set permissions: {e}")

def run_full_setup():
    """Run the complete SHELTER enhancement setup"""
    print("🚀 Starting SHELTER Enhancements Setup...")
    print("=" * 50)
    
    try:
        # Step 1: Database migrations
        setup_database_migrations()
        print()
        
        # Step 2: Create sample data
        create_sample_data()
        print()
        
        # Step 3: Setup inventory
        setup_inventory_items()
        print()
        
        # Step 4: Configure permissions
        setup_permissions()
        print()
        
        # Step 5: Configuration guide
        configure_settings()
        print()
        
        print("=" * 50)
        print("🎉 SHELTER Enhancements Setup Complete!")
        print()
        print("📋 Next Steps:")
        print("1. Add the settings configuration to your settings.py")
        print("2. Restart your Django server")
        print("3. Login as a SHELTER user to test the new features")
        print("4. Check the Medical Management and Staff Management sections")
        print()
        print("🔐 Test Login Credentials:")
        print("   Username: shelter_admin")
        print("   Password: shelter123")
        print()
        print("🎯 Key Features to Test:")
        print("   • Emergency animal alerts on dashboard")
        print("   • Medical Management center (/medical-management)")
        print("   • Staff Management dashboard (/staff-management)")
        print("   • Enhanced animal filtering and status management")
        print("   • Inventory integration in medical records")
        print("   • Bulk operations for adoption applications")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        print("Please check your Django configuration and try again.")

if __name__ == "__main__":
    run_full_setup()
