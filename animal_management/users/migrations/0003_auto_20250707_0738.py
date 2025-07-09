from django.db import migrations

def fix_email_verification_constraint(apps, schema_editor):
    """Fix null values and constraint for is_email_verified field"""
    User = apps.get_model('users', 'User')
    
    # Update all null values to False
    User.objects.filter(is_email_verified__isnull=True).update(is_email_verified=False)
    
    # Fix null tokens and timestamps
    User.objects.filter(email_verification_token__isnull=True).update(email_verification_token='')

def reverse_fix_email_verification_constraint(apps, schema_editor):
    """Reverse migration - no action needed"""
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_email_verification_sent_at_and_more'),
    ]

    operations = [
        migrations.RunPython(
            fix_email_verification_constraint,
            reverse_fix_email_verification_constraint
        ),
    ]