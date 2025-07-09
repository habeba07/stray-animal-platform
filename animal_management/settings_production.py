# animal_management/settings_production.py
from .settings import *
import os

# Production mode
DEBUG = False

# Allowed hosts for production
ALLOWED_HOSTS = [
    '.onrender.com',
    '.vercel.app', 
    'stray-animal-platform.vercel.app',
    'localhost',
    '127.0.0.1'
]

# Production database (Supabase PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DB_NAME', 'postgres'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Required for Supabase
        },
    }
}

# Static files for production
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Security settings
SECURE_SSL_REDIRECT = False  # Render handles SSL
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "https://stray-animal-platform.vercel.app",
    "http://localhost:3000",  # For development
]

CORS_ALLOW_CREDENTIALS = True