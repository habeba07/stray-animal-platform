# adoptions/management/commands/fixed_behavioral_clustering.py
from django.core.management.base import BaseCommand
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import numpy as np
import pickle
import os

class Command(BaseCommand):
    help = 'Create behavioral clustering system (no external dependencies)'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧠 FIXED BEHAVIORAL CLUSTERING'))
        self.stdout.write('Creating production-ready behavioral analysis...')
        self.stdout.write('=' * 60)
        
        # Step 1: Load behavioral data
        success = self.load_behavioral_data()
        if not success:
            return
        
        # Step 2: Find optimal clusters
        self.find_optimal_clusters()
        
        # Step 3: Create clusters
        self.create_clusters()
        
        # Step 4: Analyze clusters
        self.analyze_clusters()
        
        # Step 5: Generate recommendations
        self.generate_recommendations()
        
        # Step 6: Integrate with ML system
        self.integrate_with_ml_system()
        
        self.stdout.write('\n🎉 Behavioral clustering system complete!')
    
    def load_behavioral_data(self):
        """Load and prepare behavioral data"""
        self.stdout.write('\n📊 Loading Behavioral Data...')
        
        from adoptions.models import AnimalBehaviorProfile
        from adoptions.ml_matching import MLAdoptionMatcher
        
        profiles = AnimalBehaviorProfile.objects.all()
        
        if len(profiles) < 5:
            self.stdout.write('❌ Need at least 5 behavioral profiles')
            return False
        
        self.stdout.write(f'✅ Found {len(profiles)} behavioral profiles')
        
        # Extract behavioral features
        matcher = MLAdoptionMatcher()
        behavioral_data = []
        profile_info = []
        
        for profile in profiles:
            try:
                # Comprehensive behavioral feature vector
                features = [
                    # Energy and training
                    matcher.encode_categorical('energy_level', profile.energy_level),
                    matcher.encode_categorical('training_level', profile.training_level),
                    
                    # Social characteristics
                    int(profile.good_with_children),
                    int(profile.good_with_dogs),
                    int(profile.good_with_cats),
                    int(profile.special_needs),
                    
                    # Animal characteristics
                    matcher.encode_categorical('animal_type', profile.animal.animal_type),
                    profile.animal.weight or 25,
                    profile.animal.adoption_fee or 100,
                ]
                
                behavioral_data.append(features)
                profile_info.append({
                    'id': profile.id,
                    'animal_name': profile.animal.name,
                    'animal_type': profile.animal.animal_type,
                    'energy_level': profile.energy_level,
                    'training_level': profile.training_level,
                    'good_with_children': profile.good_with_children,
                    'good_with_dogs': profile.good_with_dogs,
                    'good_with_cats': profile.good_with_cats,
                    'special_needs': profile.special_needs,
                    'weight': profile.animal.weight or 25,
                    'adoption_fee': profile.animal.adoption_fee or 100
                })
                
            except Exception as e:
                self.stdout.write(f'  ⚠️ Skipping profile {profile.id}: {str(e)}')
                continue
        
        if len(behavioral_data) < 5:
            self.stdout.write('❌ Not enough valid behavioral data')
            return False
        
        self.behavioral_data = np.array(behavioral_data)
        self.profile_info = profile_info
        
        self.stdout.write(f'✅ Processed {len(self.behavioral_data)} valid profiles')
        self.stdout.write(f'📊 Feature dimensions: {self.behavioral_data.shape[1]}')
        
        return True
    
    def find_optimal_clusters(self):
        """Find optimal number of clusters"""
        self.stdout.write('\n🔍 Finding Optimal Clusters...')
        
        # Scale features
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(self.behavioral_data)
        
        # Test different numbers of clusters
        max_clusters = min(8, len(self.behavioral_data) // 3)
        if max_clusters < 2:
            max_clusters = 2
        
        cluster_scores = []
        
        for n_clusters in range(2, max_clusters + 1):
            try:
                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                cluster_labels = kmeans.fit_predict(data_scaled)
                
                # Calculate silhouette score
                if len(set(cluster_labels)) > 1:
                    sil_score = silhouette_score(data_scaled, cluster_labels)
                    cluster_scores.append((n_clusters, sil_score))
                    self.stdout.write(f'    {n_clusters} clusters: Silhouette = {sil_score:.3f}')
                
            except Exception as e:
                self.stdout.write(f'    {n_clusters} clusters: Failed - {str(e)}')
                continue
        
        if not cluster_scores:
            # Fallback to simple clustering
            self.optimal_clusters = 3
            self.optimal_score = 0.5
            self.stdout.write(f'  ⚠️ Using fallback: {self.optimal_clusters} clusters')
        else:
            # Select best clustering
            best_result = max(cluster_scores, key=lambda x: x[1])
            self.optimal_clusters = best_result[0]
            self.optimal_score = best_result[1]
            self.stdout.write(f'✅ Optimal: {self.optimal_clusters} clusters (score: {self.optimal_score:.3f})')
        
        self.scaler = scaler
        self.data_scaled = data_scaled
    
    def create_clusters(self):
        """Create final clustering"""
        self.stdout.write('\n🎯 Creating Final Clusters...')
        
        # Create final clustering model
        self.kmeans = KMeans(
            n_clusters=self.optimal_clusters,
            random_state=42,
            n_init=10
        )
        
        cluster_labels = self.kmeans.fit_predict(self.data_scaled)
        
        # Add cluster labels to profile info
        for i, profile in enumerate(self.profile_info):
            profile['cluster'] = cluster_labels[i]
        
        self.cluster_labels = cluster_labels
        
        # Display cluster distribution
        unique_clusters, counts = np.unique(cluster_labels, return_counts=True)
        
        self.stdout.write(f'✅ Created {len(unique_clusters)} behavioral clusters:')
        for cluster_id, count in zip(unique_clusters, counts):
            percentage = (count / len(cluster_labels)) * 100
            self.stdout.write(f'    Cluster {cluster_id}: {count} animals ({percentage:.1f}%)')
    
    def analyze_clusters(self):
        """Analyze cluster characteristics"""
        self.stdout.write('\n🔬 Analyzing Cluster Characteristics...')
        
        self.cluster_analysis = {}
        
        for cluster_id in range(self.optimal_clusters):
            cluster_profiles = [p for p in self.profile_info if p['cluster'] == cluster_id]
            
            if not cluster_profiles:
                continue
            
            cluster_size = len(cluster_profiles)
            
            # Analyze characteristics
            analysis = {
                'size': cluster_size,
                'animal_types': {},
                'energy_levels': {},
                'training_levels': {},
                'social_percentages': {},
                'avg_weight': 0,
                'avg_fee': 0
            }
            
            # Count characteristics
            total_weight = 0
            total_fee = 0
            social_counts = {
                'good_with_children': 0,
                'good_with_dogs': 0, 
                'good_with_cats': 0,
                'special_needs': 0
            }
            
            for profile in cluster_profiles:
                # Animal types
                animal_type = profile['animal_type']
                analysis['animal_types'][animal_type] = analysis['animal_types'].get(animal_type, 0) + 1
                
                # Energy levels
                energy = profile['energy_level']
                analysis['energy_levels'][energy] = analysis['energy_levels'].get(energy, 0) + 1
                
                # Training levels
                training = profile['training_level']
                analysis['training_levels'][training] = analysis['training_levels'].get(training, 0) + 1
                
                # Social traits
                for trait in social_counts:
                    if profile[trait]:
                        social_counts[trait] += 1
                
                # Numeric traits
                total_weight += profile['weight']
                total_fee += profile['adoption_fee']
            
            # Calculate percentages and averages
            for trait, count in social_counts.items():
                analysis['social_percentages'][trait] = (count / cluster_size) * 100
            
            analysis['avg_weight'] = total_weight / cluster_size
            analysis['avg_fee'] = total_fee / cluster_size
            
            self.cluster_analysis[cluster_id] = analysis
            
            # Display analysis
            self.stdout.write(f'\n  🎯 CLUSTER {cluster_id} ({cluster_size} animals):')
            
            # Most common characteristics
            if analysis['animal_types']:
                most_common_type = max(analysis['animal_types'], key=analysis['animal_types'].get)
                type_percentage = (analysis['animal_types'][most_common_type] / cluster_size) * 100
                self.stdout.write(f'    🐕 Primary: {most_common_type} ({type_percentage:.1f}%)')
            
            if analysis['energy_levels']:
                most_common_energy = max(analysis['energy_levels'], key=analysis['energy_levels'].get)
                energy_percentage = (analysis['energy_levels'][most_common_energy] / cluster_size) * 100
                self.stdout.write(f'    ⚡ Energy: {most_common_energy} ({energy_percentage:.1f}%)')
            
            # Social traits
            self.stdout.write(f'    👶 Good with children: {analysis["social_percentages"]["good_with_children"]:.1f}%')
            self.stdout.write(f'    🐕 Good with dogs: {analysis["social_percentages"]["good_with_dogs"]:.1f}%')
            self.stdout.write(f'    🐱 Good with cats: {analysis["social_percentages"]["good_with_cats"]:.1f}%')
            self.stdout.write(f'    🏥 Special needs: {analysis["social_percentages"]["special_needs"]:.1f}%')
            self.stdout.write(f'    ⚖️ Avg weight: {analysis["avg_weight"]:.1f} lbs')
            self.stdout.write(f'    💰 Avg fee: ${analysis["avg_fee"]:.0f}')
    
    def generate_recommendations(self):
        """Generate adoption recommendations per cluster"""
        self.stdout.write('\n💡 Generating Cluster Recommendations...')
        
        self.recommendations = {}
        
        for cluster_id, analysis in self.cluster_analysis.items():
            cluster_recs = []
            
            # Energy-based recommendations
            if 'HIGH' in analysis['energy_levels'] or 'VERY_HIGH' in analysis['energy_levels']:
                cluster_recs.append("Best for active families with yards")
                cluster_recs.append("Requires daily exercise and mental stimulation")
                cluster_recs.append("Great for runners and hikers")
            elif 'LOW' in analysis['energy_levels']:
                cluster_recs.append("Perfect for seniors or apartment living")
                cluster_recs.append("Lower exercise requirements")
                cluster_recs.append("Ideal lap companions")
            
            # Family-friendly recommendations
            if analysis['social_percentages']['good_with_children'] > 70:
                cluster_recs.append("Excellent family pets")
                cluster_recs.append("Great with children of all ages")
            elif analysis['social_percentages']['good_with_children'] < 30:
                cluster_recs.append("Better suited for adult-only homes")
            
            # Multi-pet recommendations
            dogs_ok = analysis['social_percentages']['good_with_dogs']
            cats_ok = analysis['social_percentages']['good_with_cats']
            
            if dogs_ok > 60 and cats_ok > 60:
                cluster_recs.append("Excellent for multi-pet households")
                cluster_recs.append("Social and adaptable")
            elif dogs_ok > 60:
                cluster_recs.append("Good with other dogs")
            elif cats_ok > 60:
                cluster_recs.append("Good with cats")
            else:
                cluster_recs.append("May prefer to be the only pet")
            
            # Special needs recommendations
            if analysis['social_percentages']['special_needs'] > 30:
                cluster_recs.append("May require experienced adopters")
                cluster_recs.append("Special medical or behavioral care needed")
                cluster_recs.append("Extra patience and understanding required")
            
            # Size and cost recommendations
            if analysis['avg_weight'] > 60:
                cluster_recs.append("Large breed considerations needed")
                cluster_recs.append("Requires space and strong handling")
            elif analysis['avg_weight'] < 20:
                cluster_recs.append("Small and portable")
                cluster_recs.append("Good for apartments")
            
            if analysis['avg_fee'] > 200:
                cluster_recs.append("Higher adoption fee - premium animals")
            elif analysis['avg_fee'] < 100:
                cluster_recs.append("Budget-friendly adoption option")
            
            self.recommendations[cluster_id] = cluster_recs
            
            # Display recommendations
            self.stdout.write(f'\n  💡 CLUSTER {cluster_id} RECOMMENDATIONS:')
            for rec in cluster_recs:
                self.stdout.write(f'    • {rec}')
    
    def integrate_with_ml_system(self):
        """Integrate clustering with ML system"""
        self.stdout.write('\n🔗 Integrating with ML System...')
        
        # Save clustering model
        from django.conf import settings
        
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(model_dir, exist_ok=True)
        
        clustering_data = {
            'kmeans_model': self.kmeans,
            'scaler': self.scaler,
            'optimal_clusters': self.optimal_clusters,
            'silhouette_score': self.optimal_score,
            'cluster_analysis': self.cluster_analysis,
            'recommendations': self.recommendations,
            'cluster_labels': self.cluster_labels.tolist(),
            'profile_info': self.profile_info,
            'feature_names': [
                'energy_level', 'training_level', 'good_with_children',
                'good_with_dogs', 'good_with_cats', 'special_needs',
                'animal_type', 'weight', 'adoption_fee'
            ],
            'version': '2.0_production_ready'
        }
        
        clustering_file = os.path.join(model_dir, 'behavioral_clustering.pkl')
        with open(clustering_file, 'wb') as f:
            pickle.dump(clustering_data, f)
        
        self.stdout.write(f'✅ Clustering model saved to {clustering_file}')
        
        # Create cluster prediction function
        self.create_cluster_predictor()
        
        self.stdout.write('✅ Behavioral clustering integrated with ML system')
    
    def create_cluster_predictor(self):
        """Create function to predict cluster for new animals"""
        
        predictor_code = '''
def predict_animal_cluster(animal_behavior_profile):
    """Predict which behavioral cluster an animal belongs to"""
    import pickle
    import os
    from django.conf import settings
    
    try:
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        clustering_file = os.path.join(model_dir, 'behavioral_clustering.pkl')
        
        with open(clustering_file, 'rb') as f:
            clustering_data = pickle.load(f)
        
        kmeans = clustering_data['kmeans_model']
        scaler = clustering_data['scaler']
        recommendations = clustering_data['recommendations']
        
        # Extract features (same as training)
        from adoptions.ml_matching import MLAdoptionMatcher
        matcher = MLAdoptionMatcher()
        
        features = [
            matcher.encode_categorical('energy_level', animal_behavior_profile.energy_level),
            matcher.encode_categorical('training_level', animal_behavior_profile.training_level),
            int(animal_behavior_profile.good_with_children),
            int(animal_behavior_profile.good_with_dogs),
            int(animal_behavior_profile.good_with_cats),
            int(animal_behavior_profile.special_needs),
            matcher.encode_categorical('animal_type', animal_behavior_profile.animal.animal_type),
            animal_behavior_profile.animal.weight or 25,
            animal_behavior_profile.animal.adoption_fee or 100,
        ]
        
        # Scale and predict
        features_scaled = scaler.transform([features])
        cluster = kmeans.predict(features_scaled)[0]
        
        # Get recommendations for this cluster
        cluster_recommendations = recommendations.get(cluster, [])
        
        return {
            'cluster_id': int(cluster),
            'recommendations': cluster_recommendations,
            'cluster_description': f'Behavioral Cluster {cluster}',
            'success': True
        }
        
    except Exception as e:
        return {
            'cluster_id': -1,
            'recommendations': ['Unable to determine cluster'],
            'cluster_description': 'Unknown',
            'success': False,
            'error': str(e)
        }
'''
        
        # Save predictor function to a utils file
        from django.conf import settings
        
        utils_file = os.path.join(settings.BASE_DIR, 'adoptions', 'cluster_utils.py')
        with open(utils_file, 'w') as f:
            f.write(predictor_code)
        
        self.stdout.write('✅ Cluster predictor function created')
