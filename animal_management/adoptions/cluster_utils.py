
def predict_animal_cluster(animal_behavior_profile):
    """Predict behavioral cluster for an animal"""
    import pickle
    import os
    from django.conf import settings
    
    try:
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        clustering_file = os.path.join(model_dir, 'behavioral_clustering.pkl')
        
        with open(clustering_file, 'rb') as f:
            clustering_data = pickle.load(f)
        
        # Safe boolean conversion
        def safe_bool_to_int(value):
            if isinstance(value, str):
                return 1 if value.lower() in ['true', '1', 'yes'] else 0
            elif isinstance(value, bool):
                return int(value)
            else:
                return int(bool(value))
        
        # Extract features (same as training)
        from adoptions.ml_matching import MLAdoptionMatcher
        matcher = MLAdoptionMatcher()
        
        features = [
            matcher.encode_categorical('energy_level', animal_behavior_profile.energy_level),
            matcher.encode_categorical('training_level', animal_behavior_profile.training_level),
            safe_bool_to_int(animal_behavior_profile.good_with_children),
            safe_bool_to_int(animal_behavior_profile.good_with_dogs),
            safe_bool_to_int(animal_behavior_profile.good_with_cats),
            safe_bool_to_int(animal_behavior_profile.special_needs),
            matcher.encode_categorical('animal_type', animal_behavior_profile.animal.animal_type),
            animal_behavior_profile.animal.weight or 25,
            animal_behavior_profile.animal.adoption_fee or 100,
        ]
        
        # Predict cluster
        features_scaled = clustering_data['scaler'].transform([features])
        cluster = clustering_data['kmeans_model'].predict(features_scaled)[0]
        
        # Get recommendations
        cluster_recommendations = clustering_data['recommendations'].get(cluster, ['No specific recommendations'])
        
        return {
            'cluster_id': int(cluster),
            'recommendations': cluster_recommendations,
            'cluster_description': f'Behavioral Cluster {cluster}',
            'success': True
        }
        
    except Exception as e:
        return {
            'cluster_id': -1,
            'recommendations': ['Cluster prediction unavailable'],
            'cluster_description': 'Unknown',
            'success': False,
            'error': str(e)
        }
