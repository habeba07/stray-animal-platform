# Create file: reports/management/commands/fix_report_urgency.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from reports.models import Report

class Command(BaseCommand):
    help = 'Fix urgency levels for existing reports'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write('🔍 Analyzing existing reports...')
        
        # Get all reports that might need urgency recalculation
        reports = Report.objects.all()
        
        updated_count = 0
        emergency_count = 0
        high_count = 0
        normal_count = 0
        low_count = 0
        
        for report in reports:
            old_urgency = report.urgency_level
            new_urgency = self.calculate_urgency(report)
            
            if old_urgency != new_urgency:
                self.stdout.write(
                    f"📋 Report #{report.id}: {old_urgency} → {new_urgency}"
                )
                self.stdout.write(f"   Description: {report.description[:100]}...")
                if hasattr(report, 'animal_condition') and report.animal_condition:
                    self.stdout.write(f"   Condition: {report.animal_condition[:50]}...")
                
                if not dry_run:
                    report.urgency_level = new_urgency
                    report.save(update_fields=['urgency_level'])
                
                updated_count += 1
            
            # Count by urgency level
            final_urgency = new_urgency if old_urgency != new_urgency else old_urgency
            if final_urgency == 'EMERGENCY':
                emergency_count += 1
            elif final_urgency == 'HIGH':
                high_count += 1
            elif final_urgency == 'LOW':
                low_count += 1
            else:
                normal_count += 1
        
        # Summary
        self.stdout.write('\n📊 SUMMARY:')
        self.stdout.write(f"   🚨 Emergency: {emergency_count}")
        self.stdout.write(f"   ⚠️  High Priority: {high_count}")
        self.stdout.write(f"   ℹ️  Normal: {normal_count}")
        self.stdout.write(f"   🔹 Low Priority: {low_count}")
        self.stdout.write(f"   📝 Updated: {updated_count}")
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('\n🔍 DRY RUN - No changes made. Run without --dry-run to apply changes.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\n✅ Successfully updated {updated_count} reports!')
            )

    def calculate_urgency(self, report):
        """Calculate urgency level based on animal condition and description"""
        # Check structured condition field first
        if hasattr(report, 'animal_condition_choice') and report.animal_condition_choice:
            emergency_conditions = ['INJURED', 'SICK']
            if report.animal_condition_choice in emergency_conditions:
                return 'EMERGENCY'
            
            high_priority_conditions = ['AGGRESSIVE', 'PREGNANT', 'WITH_BABIES']
            if report.animal_condition_choice in high_priority_conditions:
                return 'HIGH'
        
        # Enhanced text analysis
        text_to_check = []
        if hasattr(report, 'description') and report.description:
            text_to_check.append(report.description.lower())
        if hasattr(report, 'animal_condition') and report.animal_condition:
            text_to_check.append(report.animal_condition.lower())
        
        combined_text = ' '.join(text_to_check)
        
        # Emergency keywords (comprehensive list)
        emergency_keywords = [
            'injured', 'bleeding', 'blood', 'hit by car', 'accident', 'emergency', 
            'urgent', 'dying', 'trapped', 'stuck', 'broken', 'limping', 'wound',
            'cut', 'bite', 'attack', 'unconscious', 'collapse', 'can\'t move',
            'help immediately', 'critical', 'severe', 'distress', 'pain'
        ]
        
        # High priority keywords  
        high_priority_keywords = [
            'aggressive', 'attacking', 'biting', 'rabid', 'dangerous',
            'pregnant', 'giving birth', 'babies', 'puppies', 'kittens', 'newborn',
            'mother with', 'scared', 'terrified', 'hiding', 'won\'t come out',
            'multiple animals', 'pack', 'group', 'litter'
        ]
        
        # Low priority keywords
        low_priority_keywords = [
            'friendly', 'healthy', 'well', 'calm', 'peaceful', 'just wandering',
            'just walking', 'seems fine', 'looks good', 'playful'
        ]
        
        # Check for emergency conditions
        if any(keyword in combined_text for keyword in emergency_keywords):
            return 'EMERGENCY'
        
        # Check for high priority conditions  
        if any(keyword in combined_text for keyword in high_priority_keywords):
            return 'HIGH'
        
        # Check for low priority indicators
        if any(keyword in combined_text for keyword in low_priority_keywords):
            return 'LOW'
        
        return 'NORMAL'
