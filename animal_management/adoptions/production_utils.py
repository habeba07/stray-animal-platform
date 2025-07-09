# adoptions/production_utils.py - FIXED VERSION FOR ADVANCED MODELS
"""
Production utilities for ML system - FIXED FOR ADVANCED MODELS
"""

def get_ml_system_status():
    """Get current status of ML system - FIXED FOR ADVANCED MODELS"""
    try:
        from .ml_matching import MLAdoptionMatcher
        import os
        from django.conf import settings
        
        matcher = MLAdoptionMatcher()
        
        # Check models - UPDATED to recognize advanced models
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        
        models_status = {
            'advanced_model': hasattr(matcher, 'advanced_model_data') and matcher.advanced_model_data is not None,
            'collaborative': hasattr(matcher, 'collaborative_model') and matcher.collaborative_model is not None,
            'basic_compatibility': matcher.compatibility_model is not None,
            'basic_likelihood': matcher.adoption_likelihood_model is not None,
        }
        
        # Check files
        files_status = {
            'production_model': os.path.exists(os.path.join(model_dir, 'production_model.pkl')),
            'collaborative_filtering': os.path.exists(os.path.join(model_dir, 'collaborative_filtering.pkl')),
            'behavioral_clustering': os.path.exists(os.path.join(model_dir, 'behavioral_clustering.pkl')),
            'adoption_matcher': os.path.exists(os.path.join(model_dir, 'adoption_matcher.pkl')),
        }
        
        # Count loaded models
        loaded_count = sum(models_status.values())
        file_count = sum(files_status.values())
        
        # System is ready if we have advanced models (which you do!)
        has_advanced_system = models_status['advanced_model'] and models_status['collaborative']
        
        return {
            'status': 'operational' if has_advanced_system else ('partial' if loaded_count >= 1 else 'minimal'),
            'models_loaded': models_status,
            'files_available': files_status,
            'loaded_model_count': loaded_count,
            'available_file_count': file_count,
            'ready_for_production': has_advanced_system,
            'system_type': 'advanced_ml' if has_advanced_system else 'basic_ml'
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'models_loaded': {},
            'files_available': {},
            'loaded_model_count': 0,
            'available_file_count': 0,
            'ready_for_production': False
        }

def predict_adoption_likelihood_safe(animal):
    """Safe wrapper for adoption likelihood prediction"""
    try:
        from .ml_matching import MLAdoptionMatcher
        
        matcher = MLAdoptionMatcher()
        result = matcher.predict_adoption_likelihood(animal)
        
        return {
            'success': True,
            'prediction': result
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'prediction': {
                'adoption_likelihood': 0.5,
                'confidence': 'low',
                'method': 'fallback'
            }
        }

def get_collaborative_recommendations_safe(user_id):
    """Safe wrapper for collaborative recommendations"""
    try:
        from .ml_matching import MLAdoptionMatcher
        
        matcher = MLAdoptionMatcher()
        recommendations = matcher.get_collaborative_recommendations(user_id)
        
        return {
            'success': True,
            'recommendations': recommendations
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'recommendations': []
        }

def get_behavioral_cluster_safe(animal_behavior_profile):
    """Safe wrapper for behavioral clustering"""
    try:
        from .cluster_utils import predict_animal_cluster
        
        result = predict_animal_cluster(animal_behavior_profile)
        
        return {
            'success': True,
            'cluster_info': result
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'cluster_info': {
                'cluster_id': -1,
                'recommendations': ['Cluster prediction unavailable'],
                'cluster_description': 'Unknown'
            }
        }
