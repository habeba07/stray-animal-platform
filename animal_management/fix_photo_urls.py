"""
Script to fix photo URLs in existing reports
Run this from the Django project root with:
python manage.py shell < fix_photo_urls.py
"""

from reports.models import Report

def fix_photo_urls():
    # Get all reports with photos
    reports = Report.objects.exclude(photos__isnull=True).exclude(photos=[])
    
    print(f"Found {reports.count()} reports with photos")
    
    for report in reports:
        original_photos = report.photos
        fixed_photos = []
        
        for photo in original_photos:
            # If already has /media/ prefix, keep as is
            if photo.startswith('/media/'):
                fixed_photos.append(photo)
                continue
                
            # If it's a path without /media/ prefix
            if photo.startswith('reports/'):
                fixed_photo = f'/media/{photo}'
                fixed_photos.append(fixed_photo)
                print(f"Fixed: {photo} -> {fixed_photo}")
                continue
                
            # If it's a full URL with reports/ but no media/
            if '/reports/' in photo and '/media/' not in photo:
                parts = photo.split('/reports/')
                if len(parts) > 1:
                    fixed_photo = f'/media/reports/{parts[1]}'
                    fixed_photos.append(fixed_photo)
                    print(f"Fixed: {photo} -> {fixed_photo}")
                    continue
            
            # If we can't determine how to fix it, keep the original
            fixed_photos.append(photo)
            print(f"Couldn't fix: {photo}")
        
        # Only update if changes were made
        if original_photos != fixed_photos:
            report.photos = fixed_photos
            report.save()
            print(f"Updated report #{report.id}: {original_photos} -> {fixed_photos}")
        else:
            print(f"No changes needed for report #{report.id}")

# Run the function
fix_photo_urls()
print("URL fixing complete!")
