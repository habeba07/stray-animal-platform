# Create file: reports/management/commands/fix_animal_types.py

from django.core.management.base import BaseCommand
from reports.models import Report

class Command(BaseCommand):
    help = 'Fix animal types for existing reports by analyzing descriptions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write('🔍 Analyzing reports for animal type detection...')
        
        reports = Report.objects.all()
        
        updated_count = 0
        dog_count = 0
        cat_count = 0
        other_count = 0
        unknown_count = 0
        
        for report in reports:
            detected_type = self.detect_animal_type(report)
            
            # If we detected a specific type and it's different from current
            needs_update = False
            current_type = 'Unknown'
            
            # Check current animal type
            if hasattr(report, 'animal') and report.animal and hasattr(report.animal, 'animal_type'):
                current_type = report.animal.animal_type or 'Unknown'
            elif hasattr(report, 'animal_type'):
                current_type = report.animal_type or 'Unknown'
            
            if detected_type != 'Unknown Animal' and detected_type != current_type:
                needs_update = True
                
                self.stdout.write(f"📋 Report #{report.id}: '{current_type}' → '{detected_type}'")
                self.stdout.write(f"   Description: {report.description[:100]}...")
                
                if not dry_run:
                    # Update the report's animal object if it exists
                    if hasattr(report, 'animal') and report.animal:
                        report.animal.animal_type = detected_type
                        report.animal.save()
                    # Or add animal_type field to report if needed
                    # report.animal_type = detected_type
                    # report.save()
                
                updated_count += 1
            
            # Count by type
            final_type = detected_type if needs_update else current_type
            if 'dog' in final_type.lower():
                dog_count += 1
            elif 'cat' in final_type.lower():
                cat_count += 1
            elif final_type != 'Unknown':
                other_count += 1
            else:
                unknown_count += 1
        
        # Summary
        self.stdout.write('\n📊 SUMMARY:')
        self.stdout.write(f"   🐕 Dogs: {dog_count}")
        self.stdout.write(f"   🐱 Cats: {cat_count}")
        self.stdout.write(f"   🐾 Other: {other_count}")
        self.stdout.write(f"   ❓ Unknown: {unknown_count}")
        self.stdout.write(f"   📝 Updated: {updated_count}")
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('\n🔍 DRY RUN - No changes made. Run without --dry-run to apply changes.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\n✅ Successfully updated {updated_count} reports!')
            )

    def detect_animal_type(self, report):
        """Enhanced animal type detection from description"""
        # First check if report has linked animal object
        if hasattr(report, 'animal') and report.animal:
            animal = report.animal
            if hasattr(animal, 'animal_type') and animal.animal_type and animal.animal_type != 'Unknown':
                return animal.animal_type.title()
            if hasattr(animal, 'breed') and animal.breed:
                # Extract animal type from breed if possible
                breed_lower = animal.breed.lower()
                if any(dog_word in breed_lower for dog_word in ['dog', 'terrier', 'retriever', 'bulldog', 'shepherd', 'spaniel', 'husky', 'lab', 'poodle']):
                    return 'Dog'
                elif any(cat_word in breed_lower for cat_word in ['cat', 'persian', 'siamese', 'tabby', 'maine', 'ragdoll']):
                    return 'Cat'
                return animal.breed

        # Check if report has direct animal_type field
        if hasattr(report, 'animal_type') and report.animal_type and report.animal_type != 'Unknown':
            return report.animal_type.title()

        # Analyze description for animal type
        text_to_check = []
        if hasattr(report, 'description') and report.description:
            text_to_check.append(report.description.lower())
        if hasattr(report, 'animal_condition') and report.animal_condition:
            text_to_check.append(report.animal_condition.lower())

        combined_text = ' '.join(text_to_check)

        # Dog keywords (comprehensive)
        dog_keywords = [
            'dog', 'puppy', 'canine', 'pup', 'doggie', 'doggy',
            'terrier', 'retriever', 'bulldog', 'shepherd', 'spaniel', 
            'husky', 'labrador', 'lab', 'poodle', 'beagle', 'boxer',
            'rottweiler', 'pitbull', 'chihuahua', 'dachshund', 'collie',
            'barking', 'wagging', 'tail wagging'
        ]

        # Cat keywords (comprehensive)  
        cat_keywords = [
            'cat', 'kitten', 'feline', 'kitty', 'kitkat', 'meow',
            'persian', 'siamese', 'tabby', 'maine coon', 'ragdoll',
            'calico', 'tortoiseshell', 'purring', 'meowing', 'whiskers'
        ]

        # Other animal keywords
        bird_keywords = ['bird', 'chicken', 'duck', 'pigeon', 'parrot', 'crow', 'sparrow', 'flying', 'wings', 'feathers']
        rabbit_keywords = ['rabbit', 'bunny', 'hare', 'hopping', 'ears', 'fluffy tail']

        # Check for animal types
        if any(word in combined_text for word in dog_keywords):
            return 'Dog'
        elif any(word in combined_text for word in cat_keywords):
            return 'Cat'
        elif any(word in combined_text for word in bird_keywords):
            return 'Bird'
        elif any(word in combined_text for word in rabbit_keywords):
            return 'Rabbit'

        return 'Unknown Animal'
