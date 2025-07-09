# animal_management/settings_production.py
from .settings import *
import os
import dj_database_url 

SECRET_KEY = os.environ.get('SECRET_KEY', '-sm0i3-y#yzn5^pd(@-j$ewldzsrjzjoike78g3#t&@sv*2ypy')

DEBUG = True 

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'ERROR',
        },
    },
}

# Allowed hosts for production
ALLOWED_HOSTS = [
    '.onrender.com',
    '.vercel.app', 
    'stray-animal-platform.vercel.app',
    'localhost',
    '127.0.0.1'
]

# Database configuration with DATABASE_URL priority
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
    DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'
else:
    # Fallback to individual database variables
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': os.environ.get('DB_NAME', 'postgres'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD'),
            'HOST': os.environ.get('DB_HOST'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }

# WhiteNoise Middleware Configuration (IMPORTANT: Order matters!)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add WhiteNoise early
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Static files configuration for production
STATIC_URL = '/static/'
STATIC_ROOT = '/app/staticfiles'

# WhiteNoise static files storage
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security settings
SECURE_SSL_REDIRECT = False  # Render handles SSL
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "https://stray-animal-platform.vercel.app",
    "http://localhost:3000",  # For development
]

CORS_ALLOW_CREDENTIALS = True

# MongoDB Atlas Configuration for Production
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb+srv://pawrescue:WIAFiBFLyAOritOy@pawrescue-cluster.zcdgeih.mongodb.net/?retryWrites=true&w=majority&appName=pawrescue-cluster')

# MongoDB Database Name
MONGODB_DATABASE = os.environ.get('MONGODB_DATABASE', 'stray_animal_management')

REDIS_URL = os.environ.get('REDIS_URL', 'rediss://default:AZv8AAIjcDE3MGRiMGE5YzdkOWI0ZjZkYTY2MzYwYTljZTA1ZTI1M3AxMA@integral-tarpon-39932.upstash.io:6379')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Use Redis for sessions (better performance)
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
