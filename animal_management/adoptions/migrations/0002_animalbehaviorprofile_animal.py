# Generated by Django 3.2.25 on 2025-05-21 12:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('animals', '0001_initial'),
        ('adoptions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='animalbehaviorprofile',
            name='animal',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='behavior_profile', to='animals.animal'),
        ),
    ]
