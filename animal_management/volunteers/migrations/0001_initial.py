# Generated by Django 3.2.25 on 2025-05-21 12:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='VolunteerProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('skills', models.JSONField(default=list)),
                ('interests', models.JSONField(default=list)),
                ('availability', models.CharField(choices=[('WEEKDAYS', 'Weekdays'), ('WEEKENDS', 'Weekends'), ('EVENINGS', 'Evenings'), ('FLEXIBLE', 'Flexible Schedule')], max_length=20)),
                ('experience_level', models.CharField(choices=[('BEGINNER', 'Beginner'), ('INTERMEDIATE', 'Intermediate'), ('EXPERIENCED', 'Experienced'), ('PROFESSIONAL', 'Professional')], max_length=20)),
                ('has_animal_handling', models.BooleanField(default=False)),
                ('has_transportation', models.BooleanField(default=False)),
                ('preferred_animals', models.JSONField(default=list)),
                ('bio', models.TextField(blank=True, null=True)),
                ('emergency_contact', models.CharField(blank=True, max_length=255, null=True)),
                ('total_hours', models.FloatField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='volunteer_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='VolunteerOpportunity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('category', models.CharField(choices=[('ANIMAL_CARE', 'Animal Care'), ('ADOPTION_EVENT', 'Adoption Event'), ('FUNDRAISING', 'Fundraising'), ('TRANSPORT', 'Transportation'), ('ADMIN', 'Administrative'), ('MAINTENANCE', 'Facility Maintenance'), ('OTHER', 'Other')], max_length=20)),
                ('location', models.CharField(max_length=255)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('status', models.CharField(choices=[('OPEN', 'Open'), ('FILLED', 'Filled'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='OPEN', max_length=20)),
                ('skills_required', models.JSONField(default=list)),
                ('min_volunteers', models.IntegerField(default=1)),
                ('max_volunteers', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_opportunities', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='VolunteerAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('ASSIGNED', 'Assigned'), ('CONFIRMED', 'Confirmed'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled'), ('NO_SHOW', 'No Show')], default='ASSIGNED', max_length=20)),
                ('hours_logged', models.FloatField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('confirmed_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('opportunity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='volunteers.volunteeropportunity')),
                ('volunteer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='volunteer_assignments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('volunteer', 'opportunity')},
            },
        ),
    ]
