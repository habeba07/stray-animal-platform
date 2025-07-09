# community/management/commands/setup_forum_categories.py
from django.core.management.base import BaseCommand
from community.models import ForumCategory

class Command(BaseCommand):
    help = 'Create initial forum categories with proper user type restrictions'
    
    def handle(self, *args, **options):
        self.stdout.write('Setting up forum categories with user type filtering...')
        
        # Define categories with their user type restrictions
        categories = [
            {
                'name': 'Operational Coordination',
                'description': 'Daily operations, shift coordination, and workflow discussions for shelter management',
                'icon': '⚙️',
                'order': 1,
                'allowed_user_types': ['SHELTER', 'STAFF']
            },
            {
                'name': 'Emergency Response',
                'description': 'Emergency protocols, urgent situations, and crisis management coordination',
                'icon': '🚨',
                'order': 2,
                'allowed_user_types': ['SHELTER', 'STAFF', 'VOLUNTEER', 'AUTHORITY']
            },
            {
                'name': 'Health & Veterinary',
                'description': 'Medical protocols, health concerns, and veterinary coordination for professionals',
                'icon': '🏥',
                'order': 3,
                'allowed_user_types': ['SHELTER', 'STAFF', 'AUTHORITY']
            },
            {
                'name': 'Resource Management',
                'description': 'Inventory management, supply coordination, and resource planning discussions',
                'icon': '📦',
                'order': 4,
                'allowed_user_types': ['SHELTER', 'STAFF']
            },
            {
                'name': 'Staff Wellness & Support',
                'description': 'Mental health resources, stress management, and peer support for shelter workers',
                'icon': '💚',
                'order': 5,
                'allowed_user_types': ['SHELTER', 'STAFF']
            },
            {
                'name': 'Volunteer Coordination',
                'description': 'Volunteer schedules, training coordination, and community volunteer management',
                'icon': '🤝',
                'order': 6,
                'allowed_user_types': ['SHELTER', 'STAFF', 'VOLUNTEER']
            },
            {
                'name': 'Policy & Advocacy',
                'description': 'Animal welfare policies, legislation updates, and advocacy coordination',
                'icon': '🏛️',
                'order': 7,
                'allowed_user_types': ['AUTHORITY', 'SHELTER']
            },
            {
                'name': 'Adoption Success Stories',
                'description': 'Share successful adoptions, positive outcomes, and heartwarming stories',
                'icon': '🎉',
                'order': 8,
                'allowed_user_types': ['SHELTER', 'STAFF', 'PUBLIC', 'VOLUNTEER', 'AUTHORITY']
            },
            {
                'name': 'Pet Care Basics',
                'description': 'General questions about pet care, feeding, health, and basic animal welfare',
                'icon': '🐾',
                'order': 9,
                'allowed_user_types': ['PUBLIC', 'VOLUNTEER']
            },
            {
                'name': 'Training & Behavior',
                'description': 'Tips and questions about animal training, behavior modification, and pet development',
                'icon': '🎓',
                'order': 10,
                'allowed_user_types': ['PUBLIC', 'VOLUNTEER']
            },
            {
                'name': 'General Discussion',
                'description': 'General discussion about animal welfare, community issues, and open topics',
                'icon': '💬',
                'order': 11,
                'allowed_user_types': ['SHELTER', 'STAFF', 'PUBLIC', 'VOLUNTEER', 'AUTHORITY']
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for category_data in categories:
            category, created = ForumCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'icon': category_data['icon'],
                    'order': category_data['order'],
                    'allowed_user_types': category_data['allowed_user_types'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created category: {category.name}')
                )
            else:
                # Update existing category with new user type restrictions
                category.description = category_data['description']
                category.icon = category_data['icon']
                category.order = category_data['order']
                category.allowed_user_types = category_data['allowed_user_types']
                category.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'🔄 Updated category: {category.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Setup complete! Created {created_count} new categories, updated {updated_count} existing categories.'
            )
        )
        
        # Display user type access summary
        self.stdout.write('\n📋 User Type Access Summary:')
        user_types = ['SHELTER', 'STAFF', 'VOLUNTEER', 'PUBLIC', 'AUTHORITY']
        
        for user_type in user_types:
            accessible_categories = ForumCategory.objects.filter(
                is_active=True,
                allowed_user_types__contains=user_type
            ).order_by('order')
            
            self.stdout.write(f'\n{user_type} users can access:')
            for category in accessible_categories:
                self.stdout.write(f'  • {category.icon} {category.name}')
            
            if not accessible_categories:
                self.stdout.write(f'  • No categories available')
        
        self.stdout.write('\n✨ Forum categories are now properly configured for role-based access!')
