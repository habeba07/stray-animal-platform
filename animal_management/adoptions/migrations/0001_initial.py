# Generated by Django 3.2.25 on 2025-05-21 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AdopterProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('housing_type', models.CharField(choices=[('HOUSE', 'House'), ('APARTMENT', 'Apartment'), ('CONDO', 'Condo'), ('OTHER', 'Other')], max_length=20)),
                ('has_yard', models.BooleanField(default=False)),
                ('yard_size', models.CharField(blank=True, choices=[('NONE', 'No Yard'), ('SMALL', 'Small Yard'), ('MEDIUM', 'Medium Yard'), ('LARGE', 'Large Yard')], max_length=20, null=True)),
                ('rent_permission', models.BooleanField(default=False, help_text='Do you have permission from landlord to keep pets?')),
                ('adults_in_home', models.PositiveIntegerField(default=1)),
                ('children_in_home', models.PositiveIntegerField(default=0)),
                ('children_ages', models.CharField(blank=True, help_text='Ages of children, separated by commas', max_length=100, null=True)),
                ('pet_experience', models.CharField(choices=[('NONE', 'No Experience'), ('BEGINNER', 'Some Experience'), ('INTERMEDIATE', 'Moderate Experience'), ('EXPERT', 'Extensive Experience')], max_length=20)),
                ('current_pets', models.TextField(blank=True, help_text='Description of current pets', null=True)),
                ('previous_pets', models.TextField(blank=True, help_text='Description of previous pets', null=True)),
                ('activity_level', models.CharField(choices=[('SEDENTARY', 'Sedentary'), ('MODERATELY_ACTIVE', 'Moderately Active'), ('ACTIVE', 'Active'), ('VERY_ACTIVE', 'Very Active')], max_length=20)),
                ('work_schedule', models.CharField(help_text='Typical work schedule', max_length=100)),
                ('hours_alone', models.PositiveIntegerField(help_text='Hours pet would be alone daily')),
                ('preferred_animal_type', models.CharField(blank=True, choices=[('DOG', 'Dog'), ('CAT', 'Cat'), ('OTHER', 'Other')], max_length=10, null=True)),
                ('preferred_age', models.CharField(blank=True, max_length=50, null=True)),
                ('preferred_size', models.CharField(blank=True, max_length=50, null=True)),
                ('preferred_gender', models.CharField(blank=True, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('UNKNOWN', 'Unknown')], max_length=10, null=True)),
                ('willing_to_train', models.BooleanField(default=True)),
                ('special_needs_capable', models.BooleanField(default=False)),
                ('budget_for_pet', models.CharField(help_text='Monthly budget for pet care', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='AdoptionApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('PENDING', 'Pending Review'), ('UNDER_REVIEW', 'Under Review'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected'), ('WITHDRAWN', 'Withdrawn')], default='PENDING', max_length=20)),
                ('compatibility_score', models.FloatField(blank=True, null=True)),
                ('why_adopt', models.TextField(help_text='Why do you want to adopt this animal?')),
                ('previous_adoption', models.BooleanField(default=False)),
                ('previous_adoption_details', models.TextField(blank=True, null=True)),
                ('veterinarian_info', models.TextField(blank=True, null=True)),
                ('personal_reference', models.TextField(blank=True, null=True)),
                ('agree_home_visit', models.BooleanField(default=False)),
                ('agree_follow_up', models.BooleanField(default=False)),
                ('review_notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='AdoptionMatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('overall_score', models.FloatField()),
                ('lifestyle_score', models.FloatField()),
                ('experience_score', models.FloatField()),
                ('housing_score', models.FloatField()),
                ('family_score', models.FloatField()),
                ('match_reasons', models.JSONField(blank=True, null=True)),
                ('potential_challenges', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-overall_score'],
            },
        ),
        migrations.CreateModel(
            name='AnimalBehaviorProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('energy_level', models.CharField(choices=[('LOW', 'Low Energy'), ('MEDIUM', 'Medium Energy'), ('HIGH', 'High Energy'), ('VERY_HIGH', 'Very High Energy')], max_length=20)),
                ('temperament', models.CharField(choices=[('CALM', 'Calm'), ('PLAYFUL', 'Playful'), ('INDEPENDENT', 'Independent'), ('AFFECTIONATE', 'Affectionate'), ('PROTECTIVE', 'Protective'), ('SHY', 'Shy'), ('ANXIOUS', 'Anxious')], max_length=20)),
                ('training_level', models.CharField(choices=[('NONE', 'No Training'), ('BASIC', 'Basic Commands'), ('INTERMEDIATE', 'Well Trained'), ('ADVANCED', 'Extensively Trained')], max_length=20)),
                ('good_with_children', models.BooleanField(default=False)),
                ('good_with_dogs', models.BooleanField(default=False)),
                ('good_with_cats', models.BooleanField(default=False)),
                ('good_with_strangers', models.BooleanField(default=False)),
                ('house_trained', models.BooleanField(default=False)),
                ('leash_trained', models.BooleanField(default=False)),
                ('special_needs', models.TextField(blank=True, null=True)),
                ('medical_needs', models.TextField(blank=True, null=True)),
                ('behavior_notes', models.TextField(blank=True, null=True)),
                ('ideal_home', models.TextField(blank=True, help_text='Description of ideal home environment', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
