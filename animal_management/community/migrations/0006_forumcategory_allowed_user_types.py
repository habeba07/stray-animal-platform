# Generated by Django 4.2.23 on 2025-07-04 11:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('community', '0005_alter_achievement_category_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='forumcategory',
            name='allowed_user_types',
            field=models.JSONField(default=list, help_text="List of user types that can access this category (e.g., ['SHELTER', 'STAFF'])"),
        ),
    ]
