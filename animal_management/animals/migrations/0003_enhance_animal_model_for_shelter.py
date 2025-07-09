# animals/migrations/0003_enhance_animal_model_for_shelter.py
# Generated migration for enhanced Animal model with SHELTER-specific fields

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0002_animal_current_shelter'),
    ]

    operations = [
        # Add new status choices to existing status field
        migrations.AlterField(
            model_name='animal',
            name='status',
            field=models.CharField(
                choices=[
                    ('REPORTED', 'Reported'),
                    ('RESCUED', 'Rescued'),
                    ('IN_SHELTER', 'In Shelter'),
                    ('UNDER_TREATMENT', 'Under Treatment'),
                    ('QUARANTINE', 'In Quarantine'),
                    ('URGENT_MEDICAL', 'Urgent Medical Attention'),
                    ('READY_FOR_TRANSFER', 'Ready for Transfer'),
                    ('AVAILABLE', 'Available for Adoption'),
                    ('ADOPTED', 'Adopted'),
                    ('RETURNED', 'Returned to Owner'),
                ],
                default='REPORTED',
                max_length=20
            ),
        ),
        
        # Add priority level field
        migrations.AddField(
            model_name='animal',
            name='priority_level',
            field=models.CharField(
                choices=[
                    ('LOW', 'Low Priority'),
                    ('NORMAL', 'Normal'),
                    ('HIGH', 'High Priority'),
                    ('EMERGENCY', 'Emergency'),
                ],
                default='NORMAL',
                max_length=10
            ),
        ),
        
        # Add estimated medical cost field
        migrations.AddField(
            model_name='animal',
            name='estimated_medical_cost',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
                help_text='Estimated cost for medical treatment'
            ),
        ),
        
        # Add quarantine end date field
        migrations.AddField(
            model_name='animal',
            name='quarantine_end_date',
            field=models.DateField(
                blank=True,
                null=True,
                help_text='Expected end date of quarantine period'
            ),
        ),
        
        # Add transfer ready date field
        migrations.AddField(
            model_name='animal',
            name='transfer_ready_date',
            field=models.DateField(
                blank=True,
                null=True,
                help_text='Date when animal will be ready for transfer'
            ),
        ),
        
        # Add special instructions field
        migrations.AddField(
            model_name='animal',
            name='special_instructions',
            field=models.TextField(
                blank=True,
                null=True,
                help_text='Special care instructions for staff'
            ),
        ),
        
        # Add database indexes for performance
        migrations.AddIndex(
            model_name='animal',
            index=models.Index(
                fields=['status', 'priority_level'],
                name='animals_status_priority_idx'
            ),
        ),
        
        migrations.AddIndex(
            model_name='animal',
            index=models.Index(
                fields=['current_shelter', 'status'],
                name='animals_shelter_status_idx'
            ),
        ),
        
        migrations.AddIndex(
            model_name='animal',
            index=models.Index(
                fields=['quarantine_end_date'],
                name='animals_quarantine_date_idx'
            ),
        ),
        
        migrations.AddIndex(
            model_name='animal',
            index=models.Index(
                fields=['priority_level', 'created_at'],
                name='animals_priority_created_idx'
            ),
        ),
    ]