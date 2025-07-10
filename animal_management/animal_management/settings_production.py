# animal_management/settings_production.py
from .settings import *
import os
import dj_database_url 
import ssl

SECRET_KEY = os.environ.get('SECRET_KEY', '-sm0i3-y#yzn5^pd(@-j$ewldzsrjzjoike78g3#t&@sv*2ypy')

DEBUG = False 

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

# Smart Redis Configuration with Database Fallback
try:
    REDIS_URL = os.environ.get('REDIS_URL', 'rediss://default:AZv8AAIjcDE3MGRiMGE5YzdkOWI0ZjZkYTY2MzYwYTljZTA1ZTI1M3AxMA@integral-tarpon-39932.upstash.io:6379')
    
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'IGNORE_EXCEPTIONS': True,
            }
        }
    }
    
    # Use Redis for sessions
    SESSION_ENGINE = 'django.contrib.sessions.backends.db'
    SESSION_CACHE_ALIAS = 'default'
    
    print("✅ Redis configuration loaded")
    
except Exception as e:
    print(f"⚠️ Redis failed, using database cache: {e}")
    
    # Fallback to database cache
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'cache_table',
        }
    }
    
    # Use database sessions
    SESSION_ENGINE = 'django.contrib.sessions.backends.db'

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
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.contrib.auth': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.db': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Auto-fix database sequences after data import (Render production only)
if os.environ.get('DATABASE_URL'):
    print("🔧 Production database detected - registering sequence fix")
    
    def fix_database_sequences():
        """Fix database sequences after data import to prevent duplicate key errors"""
        try:
            from django.core.management.color import no_style
            from django.db import connection
            
            print("🔄 Fixing database sequences...")
            style = no_style()
            with connection.cursor() as cursor:
                reset_count = 0
                for query in connection.ops.sequence_reset_sql(style, connection.introspection.installed_models()):
                    cursor.execute(query)
                    reset_count += 1
            print(f"✅ Successfully reset {reset_count} database sequences!")
            
        except Exception as e:
            print(f"⚠️ Could not fix database sequences: {str(e)}")
    
    # Register the sequence fix to run after Django fully loads
    import atexit
    atexit.register(fix_database_sequences)