# adoptions/monitoring.py
"""
ML System Monitoring and Health Checks
"""

import os
import time
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class MLSystemMonitor:
    """Monitor ML system health and performance"""
    
    def __init__(self):
        self.model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        self.health_checks = []
    
    def check_model_files(self):
        """Check if all model files exist and are readable"""
        required_files = [
            'adoption_matcher.pkl',
            'production_model.pkl', 
            'collaborative_filtering.pkl',
            'behavioral_clustering.pkl'
        ]
        
        results = {}
        for file_name in required_files:
            file_path = os.path.join(self.model_dir, file_name)
            
            if os.path.exists(file_path):
                try:
                    # Check if file is readable
                    with open(file_path, 'rb') as f:
                        f.read(1)  # Read first byte
                    results[file_name] = 'OK'
                except Exception as e:
                    results[file_name] = f'Error: {str(e)}'
            else:
                results[file_name] = 'Missing'
        
        return results
    
    def check_ml_system_performance(self):
        """Test ML system performance"""
        try:
            from .production_utils import get_ml_system_status
            
            start_time = time.time()
            status = get_ml_system_status()
            end_time = time.time()
            
            response_time = end_time - start_time
            
            return {
                'status': status.get('status', 'unknown'),
                'response_time_ms': round(response_time * 1000, 2),
                'models_loaded': status.get('models_loaded', {}),
                'ready_for_production': status.get('ready_for_production', False)
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'response_time_ms': None,
                'models_loaded': {},
                'ready_for_production': False
            }
    
    def test_prediction_pipeline(self):
        """Test the full prediction pipeline"""
        try:
            from animals.models import Animal
            from .production_utils import predict_adoption_likelihood_safe
            
            # Get a test animal
            test_animal = Animal.objects.filter(
                last_location_json__kaggle_data__isnull=False
            ).first()
            
            if not test_animal:
                return {
                    'status': 'no_test_data',
                    'message': 'No animals with Kaggle data for testing'
                }
            
            start_time = time.time()
            result = predict_adoption_likelihood_safe(test_animal)
            end_time = time.time()
            
            prediction_time = end_time - start_time
            
            return {
                'status': 'success' if result['success'] else 'error',
                'prediction_time_ms': round(prediction_time * 1000, 2),
                'prediction_result': result.get('prediction', {}),
                'error': result.get('error') if not result['success'] else None
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'prediction_time_ms': None
            }
    
    def run_full_health_check(self):
        """Run complete health check"""
        logger.info("Running ML system health check")
        
        health_report = {
            'timestamp': timezone.now().isoformat(),
            'model_files': self.check_model_files(),
            'system_performance': self.check_ml_system_performance(),
            'prediction_pipeline': self.test_prediction_pipeline()
        }
        
        # Determine overall health
        files_ok = all(status == 'OK' for status in health_report['model_files'].values())
        system_ok = health_report['system_performance']['status'] == 'operational'
        pipeline_ok = health_report['prediction_pipeline']['status'] == 'success'
        
        health_report['overall_health'] = 'healthy' if (files_ok and system_ok and pipeline_ok) else 'unhealthy'
        
        # Log results
        if health_report['overall_health'] == 'healthy':
            logger.info("ML system health check: HEALTHY")
        else:
            logger.warning(f"ML system health check: UNHEALTHY - {health_report}")
        
        return health_report

# Global monitor instance
ml_monitor = MLSystemMonitor()
