from django.http import JsonResponse
from django.db import connections
from django.core.cache import cache  # ADD THIS IMPORT
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import time

# health/views.py - Replace the entire health_check function with this safe version:

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Simple health check to verify the system is working
    """
    health_status = {
        'status': 'healthy',
        'timestamp': time.time(),
        'services': {}
    }
    
    # Check PostgreSQL Database
    try:
        db_conn = connections['default']
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['services']['database'] = {
            'status': 'healthy',
            'message': 'Database connection successful'
        }
    except Exception as e:
        health_status['services']['database'] = {
            'status': 'unhealthy',
            'message': f'Database connection failed: {str(e)}'
        }
        health_status['status'] = 'unhealthy'
    
    # Check Redis Cache
    try:
        from django.core.cache import cache
        cache.set('health_check', 'ok', 10)
        result = cache.get('health_check')
        if result == 'ok':
            health_status['services']['redis'] = {
                'status': 'healthy',
                'message': 'Redis cache operational'
            }
        else:
            raise Exception('Cache test failed')
    except Exception as e:
        health_status['services']['redis'] = {
            'status': 'unhealthy',
            'message': f'Redis connection failed: {str(e)}'
        }
        health_status['status'] = 'unhealthy'
    
    # Check ML Model Status (SAFE VERSION)
    try:
        from adoptions.ml_matching import MLAdoptionMatcher
        ml_matcher = MLAdoptionMatcher()
        
        if ml_matcher.model is not None:
            health_status['services']['ml_model'] = {
                'status': 'healthy',
                'message': 'ML adoption matching model is loaded and ready'
            }
        else:
            health_status['services']['ml_model'] = {
                'status': 'warning',
                'message': 'ML model not trained yet - using rule-based matching'
            }
    except Exception as e:
        health_status['services']['ml_model'] = {
            'status': 'unhealthy',
            'message': f'ML system error: {str(e)}'
        }
    
    # Return appropriate HTTP status
    http_status = 200 if health_status['status'] == 'healthy' else 503
    
    return JsonResponse(health_status, status=http_status)

@csrf_exempt
@require_http_methods(["GET"])
def simple_check(request):
    """
    Very simple check that just says the app is running
    """
    return JsonResponse({
        'status': 'running',
        'message': 'Animal Management System is running!',
        'timestamp': time.time()
    })
