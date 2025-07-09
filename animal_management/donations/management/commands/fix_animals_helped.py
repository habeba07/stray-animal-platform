from django.core.management.base import BaseCommand
from django.db.models import Sum, Count
from donations.models import DonorImpactSummary, DonationImpact, Donation
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Fix animals helped calculation for all donor impact summaries'

    def handle(self, *args, **options):
        User = get_user_model()
        
        self.stdout.write("🔄 Recalculating animals helped for all donors...")
        
        # Get all users who have made donations
        donors = User.objects.filter(donation__isnull=False).distinct()
        
        fixed_count = 0
        for donor in donors:
            # Calculate correct animals helped from donation impacts
            user_impacts = DonationImpact.objects.filter(donation__donor=donor)
            animals_helped_total = user_impacts.aggregate(
                total_animals=Sum('units_helped')
            )['total_animals'] or 0
            
            # Get or create donor summary
            summary, created = DonorImpactSummary.objects.get_or_create(
                donor=donor,
                defaults={
                    'animals_helped': animals_helped_total
                }
            )
            
            # Update animals helped
            old_value = summary.animals_helped
            summary.animals_helped = animals_helped_total
            
            # Also update other fields to be sure
            user_donations = Donation.objects.filter(donor=donor)
            totals = user_donations.aggregate(
                total=Sum('amount'),
                count=Count('id')
            )
            
            summary.total_donated = totals['total'] or 0
            summary.donations_count = totals['count'] or 0
            
            # Update first and last donation dates
            first_donation = user_donations.order_by('created_at').first()
            last_donation = user_donations.order_by('-created_at').first()
            
            if first_donation and not summary.first_donation_date:
                summary.first_donation_date = first_donation.created_at
            if last_donation:
                summary.last_donation_date = last_donation.created_at
            
            summary.save()
            summary.update_donor_level()
            
            if old_value != animals_helped_total:
                self.stdout.write(
                    f"✅ Fixed {donor.username}: {old_value} → {animals_helped_total} animals helped"
                )
                fixed_count += 1
            else:
                self.stdout.write(f"✓ {donor.username}: {animals_helped_total} animals helped (no change)")
        
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Successfully updated {fixed_count} donor summaries!")
        )
        
        # Show summary statistics
        self.stdout.write("\n📊 Final Statistics:")
        for summary in DonorImpactSummary.objects.all():
            self.stdout.write(
                f"  {summary.donor.username}: ${summary.total_donated}, "
                f"{summary.animals_helped} animals helped, {summary.donor_level} level"
            )
