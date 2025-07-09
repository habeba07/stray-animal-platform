# adoptions/management/commands/advanced_behavioral_clustering.py
from django.core.management.base import BaseCommand
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

class Command(BaseCommand):
    help = 'Create advanced behavioral clustering system'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧠 ADVANCED BEHAVIORAL CLUSTERING'))
        self.stdout.write('Creating research-grade behavioral analysis...')
        self.stdout.write('=' * 60)
        
        # Step 1: Load and analyze behavioral data
        self.load_behavioral_data()
        
        # Step 2: Find optimal number of clusters
        self.find_optimal_clusters()
        
        # Step 3: Create behavioral clusters
        self.create_behavioral_clusters()
        
        # Step 4: Analyze cluster characteristics
        self.analyze_cluster_characteristics()
        
        # Step 5: Generate adoption recommendations
        self.generate_cluster_recommendations()
    
    def load_behavioral_data(self):
        """Load and prepare behavioral data"""
        self.stdout.write('\n📊 Loading Behavioral Data...')
        
        from adoptions.models import AnimalBehaviorProfile
        from adoptions.ml_matching import MLAdoptionMatcher
        
        profiles = AnimalBehaviorProfile.objects.all()
        
        if len(profiles) < 10:
            self.stdout.write('❌ Need at least 10 behavioral profiles')
            return
        
        self.stdout.write(f'✅ Found {len(profiles)} behavioral profiles')
        
        # Extract comprehensive behavioral features
        matcher = MLAdoptionMatcher()
        behavioral_data = []
        profile_info = []
        
        for profile in profiles:
            try:
                # Create comprehensive behavioral feature vector
                features = [
                    # Energy and activity
                    matcher.encode_categorical('energy_level', profile.energy_level),
                    matcher.encode_categorical('training_level', profile.training_level),
                    
                    # Social characteristics
                    int(profile.good_with_children),
                    int(profile.good_with_dogs),
                    int(profile.good_with_cats),
                    int(profile.special_needs),
                    
                    # Animal characteristics
                    matcher.encode_categorical('animal_type', profile.animal.animal_type),
                    profile.animal.weight or 25,  # Default weight
                    profile.animal.adoption_fee or 100,  # Default fee
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
                    'special_needs': profile.special_needs
                })
                
            except Exception as e:
                continue
        
        self.behavioral_data = np.array(behavioral_data)
        self.profile_info = profile_info
        
        self.stdout.write(f'✅ Processed {len(self.behavioral_data)} behavioral profiles')
        self.stdout.write(f'📊 Feature dimensions: {self.behavioral_data.shape[1]}')
    
    def find_optimal_clusters(self):
        """Find optimal number of clusters using elbow method and silhouette score"""
        self.stdout.write('\n🔍 Finding Optimal Number of Clusters...')
        
        # Scale features
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(self.behavioral_data)
        
        # Test different numbers of clusters
        max_clusters = min(10, len(self.behavioral_data) // 2)
        inertias = []
        silhouette_scores = []
        cluster_range = range(2, max_clusters + 1)
        
        for n_clusters in cluster_range:
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(data_scaled)
            
            inertias.append(kmeans.inertia_)
            
            # Calculate silhouette score
            if len(set(cluster_labels)) > 1:  # Need at least 2 clusters
                sil_score = silhouette_score(data_scaled, cluster_labels)
                silhouette_scores.append(sil_score)
            else:
                silhouette_scores.append(0)
        
        # Find optimal clusters
        best_silhouette_idx = np.argmax(silhouette_scores)
        optimal_clusters = cluster_range[best_silhouette_idx]
        
        self.stdout.write(f'📊 Cluster Analysis Results:')
        for i, (n_clust, sil_score) in enumerate(zip(cluster_range, silhouette_scores)):
            self.stdout.write(f'    {n_clust} clusters: Silhouette = {sil_score:.3f}')
        
        self.stdout.write(f'✅ Optimal clusters: {optimal_clusters} (Silhouette: {silhouette_scores[best_silhouette_idx]:.3f})')
        
        self.optimal_clusters = optimal_clusters
        self.scaler = scaler
        self.data_scaled = data_scaled
    
    def create_behavioral_clusters(self):
        """Create behavioral clusters with optimal parameters"""
        self.stdout.write('\n🎯 Creating Behavioral Clusters...')
        
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
    
    def analyze_cluster_characteristics(self):
        """Analyze characteristics of each cluster"""
        self.stdout.write('\n🔬 Analyzing Cluster Characteristics...')
        
        # Group profiles by cluster
        cluster_analysis = {}
        
        for cluster_id in range(self.optimal_clusters):
            cluster_profiles = [p for p in self.profile_info if p['cluster'] == cluster_id]
            
            if not cluster_profiles:
                continue
            
            # Analyze cluster characteristics
            analysis = {
                'size': len(cluster_profiles),
                'animal_types': {},
                'energy_levels': {},
                'training_levels': {},
                'social_traits': {
                    'good_with_children': 0,
                    'good_with_dogs': 0,
                    'good_with_cats': 0,
                    'special_needs': 0
                }
            }
            
            # Count characteristics
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
                if profile['good_with_children']:
                    analysis['social_traits']['good_with_children'] += 1
                if profile['good_with_dogs']:
                    analysis['social_traits']['good_with_dogs'] += 1
                if profile['good_with_cats']:
                    analysis['social_traits']['good_with_cats'] += 1
                if profile['special_needs']:
                    analysis['social_traits']['special_needs'] += 1
            
            # Convert to percentages
            for trait, count in analysis['social_traits'].items():
                analysis['social_traits'][trait] = (count / analysis['size']) * 100
            
            cluster_analysis[cluster_id] = analysis
        
        # Display cluster analysis
        for cluster_id, analysis in cluster_analysis.items():
            self.stdout.write(f'\n🎯 CLUSTER {cluster_id} ANALYSIS ({analysis["size"]} animals):')
            
            # Most common animal type
            if analysis['animal_types']:
                most_common_type = max(analysis['animal_types'], key=analysis['animal_types'].get)
                type_percentage = (analysis['animal_types'][most_common_type] / analysis['size']) * 100
                self.stdout.write(f'    🐕 Primary Type: {most_common_type} ({type_percentage:.1f}%)')
            
            # Most common energy level
            if analysis['energy_levels']:
                most_common_energy = max(analysis['energy_levels'], key=analysis['energy_levels'].get)
                energy_percentage = (analysis['energy_levels'][most_common_energy] / analysis['size']) * 100
                self.stdout.write(f'    ⚡ Energy: {most_common_energy} ({energy_percentage:.1f}%)')
            
            # Social traits
            self.stdout.write(f'    👶 Good with children: {analysis["social_traits"]["good_with_children"]:.1f}%')
            self.stdout.write(f'    🐕 Good with dogs: {analysis["social_traits"]["good_with_dogs"]:.1f}%')
            self.stdout.write(f'    🐱 Good with cats: {analysis["social_traits"]["good_with_cats"]:.1f}%')
            self.stdout.write(f'    🏥 Special needs: {analysis["social_traits"]["special_needs"]:.1f}%')
        
        self.cluster_analysis = cluster_analysis
    
    def generate_cluster_recommendations(self):
        """Generate adoption recommendations based on clusters"""
        self.stdout.write('\n💡 Generating Cluster-Based Recommendations...')
        
        recommendations = {}
        
        for cluster_id, analysis in self.cluster_analysis.items():
            cluster_recs = []
            
            # High energy clusters
            if 'HIGH' in analysis['energy_levels'] or 'VERY_HIGH' in analysis['energy_levels']:
                cluster_recs.append("Best for active families with yards")
                cluster_recs.append("Requires daily exercise and mental stimulation")
            
            # Low energy clusters  
            if 'LOW' in analysis['energy_levels']:
                cluster_recs.append("Perfect for seniors or apartment living")
                cluster_recs.append("Lower exercise requirements")
            
            # Child-friendly clusters
            if analysis['social_traits']['good_with_children'] > 70:
                cluster_recs.append("Excellent family pets")
                cluster_recs.append("Great with children")
            
            # Multi-pet households
            if (analysis['social_traits']['good_with_dogs'] > 60 and 
                analysis['social_traits']['good_with_cats'] > 60):
                cluster_recs.append("Suitable for multi-pet households")
            
            # Special needs
            if analysis['social_traits']['special_needs'] > 30:
                cluster_recs.append("May require experienced adopters")
                cluster_recs.append("Special medical or behavioral care needed")
            
            # Training recommendations
            if 'NONE' in analysis['training_levels']:
                cluster_recs.append("Would benefit from basic training")
            elif 'ADVANCED' in analysis['training_levels']:
                cluster_recs.append("Well-trained and responsive")
            
            recommendations[cluster_id] = cluster_recs
        
        # Display recommendations
        for cluster_id, recs in recommendations.items():
            self.stdout.write(f'\n💡 CLUSTER {cluster_id} ADOPTION RECOMMENDATIONS:')
            for rec in recs:
                self.stdout.write(f'    • {rec}')
        
        # Save clustering model
        self.save_clustering_model(recommendations)
        
        self.stdout.write('\n🎉 Advanced Behavioral Clustering Complete!')
        self.stdout.write('🚀 Clusters can now be used for targeted adoption matching!')
    
    def save_clustering_model(self, recommendations):
        """Save the clustering model and recommendations"""
        from django.conf import settings
        import pickle
        import os
        
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(model_dir, exist_ok=True)
        
        clustering_data = {
            'kmeans_model': self.kmeans,
            'scaler': self.scaler,
            'optimal_clusters': self.optimal_clusters,
            'cluster_analysis': self.cluster_analysis,
            'recommendations': recommendations,
            'feature_names': [
                'energy_level', 'training_level', 'good_with_children',
                'good_with_dogs', 'good_with_cats', 'special_needs',
                'animal_type', 'weight', 'adoption_fee'
            ],
            'version': '1.0_advanced'
        }
        
        clustering_file = os.path.join(model_dir, 'behavioral_clustering.pkl')
        with open(clustering_file, 'wb') as f:
            pickle.dump(clustering_data, f)
        
        self.stdout.write(f'💾 Clustering model saved to {clustering_file}')
