# Generated by Django 4.2.23 on 2025-07-07 02:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0006_alter_reportupdate_updated_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='tracking_id',
            field=models.CharField(blank=True, help_text='User-friendly tracking ID for public report tracking', max_length=20, null=True, unique=True),
        ),
    ]
