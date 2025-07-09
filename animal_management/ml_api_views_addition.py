
# Add these to adoptions/views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def api_predict_adoption(request):
    """API endpoint for adoption likelihood prediction"""
    try:
        data = json.loads(request.body)
        animal_id = data.get('animal_id')
        
        from animals.models import Animal
        from .production_utils import predict_adoption_likelihood_safe
        
        animal = Animal.objects.get(id=animal_id)
        result = predict_adoption_likelihood_safe(animal)
        
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@csrf_exempt  
@require_http_methods(["GET"])
def api_collaborative_recommendations(request):
    """API endpoint for collaborative recommendations"""
    try:
        user_id = request.GET.get('user_id')
        
        from .production_utils import get_collaborative_recommendations_safe
        
        result = get_collaborative_recommendations_safe(int(user_id))
        
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def api_ml_status(request):
    """API endpoint for ML system status"""
    try:
        from .production_utils import get_ml_system_status
        
        status = get_ml_system_status()
        
        return JsonResponse(status)
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_behavioral_cluster(request):
    """API endpoint for behavioral clustering"""
    try:
        data = json.loads(request.body)
        profile_id = data.get('profile_id')
        
        from .models import AnimalBehaviorProfile
        from .production_utils import get_behavioral_cluster_safe
        
        profile = AnimalBehaviorProfile.objects.get(id=profile_id)
        result = get_behavioral_cluster_safe(profile)
        
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
