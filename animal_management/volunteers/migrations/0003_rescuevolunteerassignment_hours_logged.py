# Generated by Django 4.2.23 on 2025-07-12 05:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0002_volunteeropportunity_is_emergency_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='rescuevolunteerassignment',
            name='hours_logged',
            field=models.FloatField(blank=True, help_text='Hours spent on this rescue mission', null=True),
        ),
    ]
