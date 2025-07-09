# adoptions/management/commands/advanced_collaborative_filtering.py
from django.core.management.base import BaseCommand
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix

class Command(BaseCommand):
    help = 'Create advanced collaborative filtering system'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🤝 ADVANCED COLLABORATIVE FILTERING'))
        self.stdout.write('Creating research-grade recommendation system...')
        self.stdout.write('=' * 60)
        
        # Step 1: Create comprehensive user-item matrix
        self.create_user_item_matrix()
        
        # Step 2: Add implicit feedback data
        self.add_implicit_feedback()
        
        # Step 3: Apply matrix factorization
        self.apply_matrix_factorization()
        
        # Step 4: Generate similarity-based recommendations
        self.create_similarity_recommendations()
        
        # Step 5: Hybrid collaborative-content approach
        self.create_hybrid_recommendations()
    
    def create_user_item_matrix(self):
        """Create comprehensive user-item interaction matrix"""
        self.stdout.write('\n📊 Creating User-Item Matrix...')
        
        from adoptions.models import AdoptionApplication
        from django.contrib.auth.models import User
        from animals.models import Animal
        
        # Get all adoption interactions
        applications = AdoptionApplication.objects.all()
        
        if len(applications) < 5:
            self.stdout.write('⚠️  Limited adoption data, creating enhanced synthetic interactions...')
            self._create_enhanced_synthetic_data()
        
        # Create interaction matrix
        user_item_data = []
        
        for app in applications:
            interaction_score = self._calculate_interaction_score(app)
            
            user_item_data.append({
                'user_id': app.applicant.id,
                'animal_id': app.animal.id,
                'animal_type': app.animal.animal_type,
                'animal_size': self._get_animal_size(app.animal),
                'interaction_score': interaction_score,
                'application_status': app.status
            })
        
        self.interaction_df = pd.DataFrame(user_item_data)
        
        # Create user-animal_type matrix (more robust with limited data)
        self.user_type_matrix = self.interaction_df.pivot_table(
            index='user_id',
            columns='animal_type', 
            values='interaction_score',
            fill_value=0
        )
        
        # Create user-size preference matrix
        self.user_size_matrix = self.interaction_df.pivot_table(
            index='user_id',
            columns='animal_size',
            values='interaction_score', 
            fill_value=0
        )
        
        self.stdout.write(f'✅ Created interaction matrix: {len(self.interaction_df)} interactions')
        self.stdout.write(f'📊 User-Type Matrix: {self.user_type_matrix.shape}')
        self.stdout.write(f'📊 User-Size Matrix: {self.user_size_matrix.shape}')
    
    def _calculate_interaction_score(self, application):
        """Calculate interaction strength score"""
        base_score = 1.0
        
        # Status-based scoring
        if application.status == 'APPROVED':
            base_score = 5.0
        elif application.status == 'PENDING':
            base_score = 3.0
        elif application.status == 'UNDER_REVIEW':
            base_score = 2.0
        else:
            base_score = 1.0
        
        # Add time-based decay (more recent = higher score)
        try:
            days_since = (datetime.now().date() - application.created_at.date()).days
            time_factor = max(0.5, 1.0 - (days_since / 365))  # Decay over a year
            base_score *= time_factor
        except:
            pass
        
        return base_score
    
    def _get_animal_size(self, animal):
        """Get animal size from Kaggle data or estimate"""
        try:
            kaggle_data = animal.last_location_json.get('kaggle_data', {})
            return kaggle_data.get('size', self._estimate_size(animal))
        except:
            return self._estimate_size(animal)
    
    def _estimate_size(self, animal):
        """Estimate animal size based on type and weight"""
        if animal.animal_type == 'CAT':
            return 'Small'
        elif animal.weight:
            if animal.weight < 25:
                return 'Small'
            elif animal.weight < 60:
                return 'Medium' 
            else:
                return 'Large'
        else:
            return 'Medium'
    
    def _create_enhanced_synthetic_data(self):
        """Create enhanced synthetic interaction data for better collaborative filtering"""
        from django.contrib.auth.models import User
        from animals.models import Animal
        from adoptions.models import AdoptionApplication, AdopterProfile
        
        # Create realistic adopter personas
        personas = [
            {
                'username': 'young_professional',
                'preferences': {'CAT': 0.8, 'Small': 0.9, 'Medium': 0.5},
                'interaction_pattern': 'high_engagement'
            },
            {
                'username': 'family_with_kids', 
                'preferences': {'DOG': 0.9, 'Medium': 0.8, 'Large': 0.6},
                'interaction_pattern': 'selective'
            },
            {
                'username': 'senior_couple',
                'preferences': {'CAT': 0.7, 'DOG': 0.6, 'Small': 0.9, 'Medium': 0.5},
                'interaction_pattern': 'careful_consideration'
            },
            {
                'username': 'experienced_owner',
                'preferences': {'DOG': 0.8, 'Large': 0.7, 'Medium': 0.8},
                'interaction_pattern': 'breed_specific'
            }
        ]
        
        # Get available animals
        animals = Animal.objects.all()[:20]  # Use 20 animals for synthetic data
        
        created_interactions = 0
        
        for persona in personas:
            try:
                # Create or get user
                user, created = User.objects.get_or_create(
                    username=persona['username'],
                    defaults={'email': f"{persona['username']}@example.com"}
                )
                
                # Create adopter profile if needed
                profile, created = AdopterProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'activity_level': 'MODERATELY_ACTIVE',
                        'pet_experience': 'INTERMEDIATE',
                        'housing_type': 'HOUSE'
                    }
                )
                
                # Create interactions based on preferences
                for animal in animals:
                    animal_type = animal.animal_type
                    animal_size = self._get_animal_size(animal)
                    
                    # Calculate preference score
                    type_pref = persona['preferences'].get(animal_type, 0.3)
                    size_pref = persona['preferences'].get(animal_size, 0.5)
                    combined_pref = (type_pref + size_pref) / 2
                    
                    # Create interaction based on preference and randomness
                    if np.random.random() < combined_pref:
                        # Determine application status based on preference strength
                        if combined_pref > 0.8:
                            status = 'APPROVED'
                        elif combined_pref > 0.6:
                            status = 'PENDING' 
                        else:
                            status = 'UNDER_REVIEW'
                        
                        # Create application if it doesn't exist
                        app, created = AdoptionApplication.objects.get_or_create(
                            animal=animal,
                            applicant=user,
                            defaults={'status': status}
                        )
                        
                        if created:
                            created_interactions += 1
                            
            except Exception as e:
                continue
        
        self.stdout.write(f'✅ Created {created_interactions} synthetic interactions')
    
    def add_implicit_feedback(self):
        """Add implicit feedback signals"""
        self.stdout.write('\n🔍 Adding Implicit Feedback Signals...')
        
        # Add viewing patterns (simulated)
        viewing_data = []
        
        for _, interaction in self.interaction_df.iterrows():
            # Simulate viewing behavior based on interaction score
            view_count = max(1, int(interaction['interaction_score']))
            
            for _ in range(view_count):
                viewing_data.append({
                    'user_id': interaction['user_id'],
                    'animal_type': interaction['animal_type'],
                    'action': 'view',
                    'weight': 0.5
                })
        
        # Add search patterns (inferred from applications)
        search_data = []
        
        for user_id in self.interaction_df['user_id'].unique():
            user_interactions = self.interaction_df[self.interaction_df['user_id'] == user_id]
            
            # Infer search preferences
            preferred_types = user_interactions['animal_type'].value_counts()
            
            for animal_type, count in preferred_types.items():
                search_data.append({
                    'user_id': user_id,
                    'animal_type': animal_type,
                    'action': 'search',
                    'weight': min(2.0, count * 0.5)
                })
        
        self.implicit_feedback = {
            'viewing': viewing_data,
            'searching': search_data
        }
        
        self.stdout.write(f'✅ Added implicit feedback: {len(viewing_data)} views, {len(search_data)} searches')
    
    def apply_matrix_factorization(self):
        """Apply SVD matrix factorization for collaborative filtering"""
        self.stdout.write('\n🔢 Applying Matrix Factorization...')
        
        try:
            # Convert to sparse matrix for efficiency
            user_type_sparse = csr_matrix(self.user_type_matrix.values)
            
            # Apply SVD
            n_components = min(5, min(self.user_type_matrix.shape) - 1)
            
            self.svd_model = TruncatedSVD(n_components=n_components, random_state=42)
            user_factors = self.svd_model.fit_transform(user_type_sparse)
            
            # Calculate user similarity matrix
            self.user_similarity = cosine_similarity(user_factors)
            
            self.stdout.write(f'✅ SVD applied: {n_components} components')
            self.stdout.write(f'📊 Explained variance ratio: {self.svd_model.explained_variance_ratio_.sum():.3f}')
            
            # Store user factors for recommendations
            self.user_factors = user_factors
            
        except Exception as e:
            self.stdout.write(f'⚠️  SVD failed: {str(e)}, using alternative approach')
            
            # Fallback: simple user similarity based on preferences
            self.user_similarity = cosine_similarity(self.user_type_matrix.values)
            self.user_factors = self.user_type_matrix.values
    
    def create_similarity_recommendations(self):
        """Create recommendations based on user similarity"""
        self.stdout.write('\n👥 Creating Similarity-Based Recommendations...')
        
        recommendations = {}
        
        for i, user_id in enumerate(self.user_type_matrix.index):
            # Find similar users
            user_similarities = self.user_similarity[i]
            similar_user_indices = np.argsort(user_similarities)[::-1][1:4]  # Top 3 similar users
            
            user_recommendations = []
            
            for similar_idx in similar_user_indices:
                similar_user_id = self.user_type_matrix.index[similar_idx]
                similarity_score = user_similarities[similar_idx]
                
                # Get what similar users liked
                similar_user_prefs = self.user_type_matrix.iloc[similar_idx]
                
                for animal_type, score in similar_user_prefs.items():
                    if score > 0:  # Similar user interacted with this type
                        user_recommendations.append({
                            'animal_type': animal_type,
                            'score': score * similarity_score,
                            'reason': f'Users similar to you adopted {animal_type.lower()}s'
                        })
            
            # Aggregate and sort recommendations
            if user_recommendations:
                rec_df = pd.DataFrame(user_recommendations)
                aggregated = rec_df.groupby('animal_type').agg({
                    'score': 'sum',
                    'reason': 'first'
                }).sort_values('score', ascending=False)
                
                recommendations[user_id] = aggregated.to_dict('index')
            
        self.similarity_recommendations = recommendations
        
        self.stdout.write(f'✅ Generated similarity recommendations for {len(recommendations)} users')
    
    def create_hybrid_recommendations(self):
        """Create hybrid content-collaborative recommendations"""
        self.stdout.write('\n🔗 Creating Hybrid Recommendations...')
        
        hybrid_recommendations = {}
        
        for user_id in self.user_type_matrix.index:
            user_recs = []
            
            # Get collaborative filtering recommendations
            if user_id in self.similarity_recommendations:
                collab_recs = self.similarity_recommendations[user_id]
                
                for animal_type, data in collab_recs.items():
                    user_recs.append({
                        'type': 'collaborative',
                        'animal_type': animal_type,
                        'score': data['score'],
                        'reason': data['reason']
                    })
            
            # Add content-based recommendations (user's historical preferences)
            user_prefs = self.user_type_matrix.loc[user_id]
            
            for animal_type, score in user_prefs.items():
                if score > 0:
                    user_recs.append({
                        'type': 'content',
                        'animal_type': animal_type,
                        'score': score * 0.8,  # Weight content slightly lower
                        'reason': f'Based on your previous {animal_type.lower()} adoption'
                    })
            
            # Combine and deduplicate
            if user_recs:
                rec_df = pd.DataFrame(user_recs)
                
                # Aggregate scores by animal type
                aggregated = rec_df.groupby('animal_type').agg({
                    'score': 'sum',
                    'type': lambda x: 'hybrid' if len(set(x)) > 1 else x.iloc[0],
                    'reason': 'first'
                }).sort_values('score', ascending=False)
                
                hybrid_recommendations[user_id] = aggregated.to_dict('index')
        
        self.hybrid_recommendations = hybrid_recommendations
        
        # Save collaborative filtering model
        self.save_collaborative_model()
        
        # Display sample recommendations
        self._display_sample_recommendations()
        
        self.stdout.write('\n🎉 Advanced Collaborative Filtering Complete!')
    
    def save_collaborative_model(self):
        """Save collaborative filtering model"""
        from django.conf import settings
        import pickle
        import os
        
        model_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        
        collaborative_data = {
            'user_type_matrix': self.user_type_matrix,
            'user_size_matrix': self.user_size_matrix,
            'user_similarity': self.user_similarity,
            'similarity_recommendations': self.similarity_recommendations,
            'hybrid_recommendations': self.hybrid_recommendations,
            'implicit_feedback': self.implicit_feedback,
            'version': '1.0_advanced'
        }
        
        if hasattr(self, 'svd_model'):
            collaborative_data['svd_model'] = self.svd_model
            collaborative_data['user_factors'] = self.user_factors
        
        collab_file = os.path.join(model_dir, 'collaborative_filtering.pkl')
        with open(collab_file, 'wb') as f:
            pickle.dump(collaborative_data, f)
        
        self.stdout.write(f'💾 Collaborative filtering model saved to {collab_file}')
    
    def _display_sample_recommendations(self):
        """Display sample recommendations"""
        self.stdout.write('\n📋 Sample Hybrid Recommendations:')
        
        sample_users = list(self.hybrid_recommendations.keys())[:3]
        
        for user_id in sample_users:
            user_recs = self.hybrid_recommendations[user_id]
            
            self.stdout.write(f'\n👤 User {user_id} Recommendations:')
            
            for animal_type, data in list(user_recs.items())[:3]:  # Top 3
                self.stdout.write(f'    🎯 {animal_type}: Score {data["score"]:.2f} ({data["type"]})')
                self.stdout.write(f'        Reason: {data["reason"]}')
