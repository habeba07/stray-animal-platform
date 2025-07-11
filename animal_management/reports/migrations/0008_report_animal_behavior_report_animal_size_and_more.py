# Generated by Django 4.2.23 on 2025-07-12 04:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0007_report_tracking_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='animal_behavior',
            field=models.CharField(choices=[('FRIENDLY', 'Friendly/Approachable'), ('NEUTRAL', 'Calm/Neutral'), ('SCARED', 'Scared/Timid'), ('DEFENSIVE', 'Defensive/Protective'), ('AGGRESSIVE', 'Aggressive/Dangerous'), ('UNKNOWN', 'Behavior Unknown')], default='UNKNOWN', help_text='Animal behavior for volunteer safety assessment', max_length=15),
        ),
        migrations.AddField(
            model_name='report',
            name='animal_size',
            field=models.CharField(choices=[('SMALL', 'Small (under 25 lbs)'), ('MEDIUM', 'Medium (25-60 lbs)'), ('LARGE', 'Large (60-100 lbs)'), ('EXTRA_LARGE', 'Extra Large (over 100 lbs)'), ('UNKNOWN', 'Size Unknown')], default='UNKNOWN', help_text='Animal size for volunteer safety assessment', max_length=15),
        ),
        migrations.AddField(
            model_name='report',
            name='special_handling_notes',
            field=models.TextField(blank=True, help_text='Special equipment or handling requirements', null=True),
        ),
    ]
