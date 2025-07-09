from .models import AdopterProfile, AnimalBehaviorProfile


class AdoptionMatchingSystem:
    """
    Simple matching algorithm for connecting adopters with suitable animals.
    Uses content-based filtering to match based on characteristics.
    """
    
    def calculate_compatibility(self, adopter_profile, animal):
        """
        Calculate compatibility score between an adopter and an animal.
        Returns a dictionary with various scores and explanations.
        """
        behavior_profile = animal.behavior_profile
        scores = {
            'lifestyle_score': self._calculate_lifestyle_score(adopter_profile, behavior_profile),
            'experience_score': self._calculate_experience_score(adopter_profile, behavior_profile),
            'housing_score': self._calculate_housing_score(adopter_profile, behavior_profile),
            'family_score': self._calculate_family_score(adopter_profile, behavior_profile),
            'match_reasons': [],
            'potential_challenges': []
        }
        
        # Calculate overall score (weighted average)
        scores['overall_score'] = (
            scores['lifestyle_score'] * 0.3 +
            scores['experience_score'] * 0.25 +
            scores['housing_score'] * 0.25 +
            scores['family_score'] * 0.2
        )
        
        # Generate match reasons and challenges
        self._generate_insights(adopter_profile, behavior_profile, scores)
        
        return scores
    
    def _calculate_lifestyle_score(self, adopter_profile, behavior_profile):
        """Calculate how well lifestyles match."""
        score = 0
        max_score = 100
        
        # Match activity levels
        activity_mapping = {
            'SEDENTARY': 1,
            'MODERATELY_ACTIVE': 2,
            'ACTIVE': 3,
            'VERY_ACTIVE': 4
        }
        
        energy_mapping = {
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'VERY_HIGH': 4
        }
        
        adopter_activity = activity_mapping.get(adopter_profile.activity_level, 2)
        animal_energy = energy_mapping.get(behavior_profile.energy_level, 2)
        
        # Perfect match: same level. Deduct points for mismatch
        activity_diff = abs(adopter_activity - animal_energy)
        activity_score = max(0, 40 - (activity_diff * 15))
        score += activity_score
        
        # Hours alone consideration
        if adopter_profile.hours_alone <= 4:
            score += 30
        elif adopter_profile.hours_alone <= 8:
            score += 20
        else:
            score += 10
            
        # Work schedule flexibility
        if 'flexible' in adopter_profile.work_schedule.lower():
            score += 30
        elif 'part' in adopter_profile.work_schedule.lower():
            score += 20
        else:
            score += 10
            
        return min(score, max_score)
    
    def _calculate_experience_score(self, adopter_profile, behavior_profile):
        """Calculate score based on experience match."""
        score = 0
        max_score = 100
        
        # Experience level mapping
        experience_mapping = {
            'NONE': 1,
            'BEGINNER': 2,
            'INTERMEDIATE': 3,
            'EXPERT': 4
        }
        
        training_mapping = {
            'NONE': 1,
            'BASIC': 2,
            'INTERMEDIATE': 3,
            'ADVANCED': 4
        }
        
        adopter_exp = experience_mapping.get(adopter_profile.pet_experience, 1)
        animal_training = training_mapping.get(behavior_profile.training_level, 1)
        
        # More experience is always good
        if adopter_exp >= animal_training:
            score += 40
        else:
            # Deduct points if animal needs more experience than adopter has
            exp_diff = animal_training - adopter_exp
            score += max(0, 40 - (exp_diff * 15))
        
        # Special needs consideration
        if behavior_profile.special_needs:
            if adopter_profile.special_needs_capable:
                score += 30
            else:
                score -= 20
        else:
            score += 30
        
        # Training willingness
        if adopter_profile.willing_to_train:
            score += 30
        else:
            if animal_training <= 2:  # Animal needs training
                score += 10
            else:
                score += 30
        
        return max(0, min(score, max_score))
    
    def _calculate_housing_score(self, adopter_profile, behavior_profile):
        """Calculate housing compatibility score."""
        score = 0
        max_score = 100
        
        # Housing type considerations
        if adopter_profile.housing_type == 'HOUSE':
            score += 30
        elif adopter_profile.housing_type == 'APARTMENT':
            if behavior_profile.energy_level in ['LOW', 'MEDIUM']:
                score += 25
            else:
                score += 15
        else:
            score += 20
        
        # Yard considerations
        if adopter_profile.has_yard:
            if behavior_profile.energy_level in ['HIGH', 'VERY_HIGH']:
                score += 30
            else:
                score += 20
        else:
            if behavior_profile.energy_level in ['LOW', 'MEDIUM']:
                score += 20
            else:
                score += 10
        
        # Rental considerations
        if adopter_profile.housing_type != 'HOUSE' and not adopter_profile.rent_permission:
            score -= 30
        else:
            score += 20
        
        # Space considerations based on animal size
        if behavior_profile.animal.animal_type == 'DOG':
            if adopter_profile.housing_type == 'HOUSE' or adopter_profile.has_yard:
                score += 20
            else:
                score += 10
        else:
            score += 20
        
        return max(0, min(score, max_score))
    
    def _calculate_family_score(self, adopter_profile, behavior_profile):
        """Calculate family compatibility score."""
        score = 0
        max_score = 100
        
        # Children compatibility
        if adopter_profile.children_in_home > 0:
            if behavior_profile.good_with_children:
                score += 40
            else:
                score -= 20
        else:
            score += 40
        
        # Other pets compatibility
        if adopter_profile.current_pets:
            if 'dog' in adopter_profile.current_pets.lower() and behavior_profile.good_with_dogs:
                score += 30
            elif 'cat' in adopter_profile.current_pets.lower() and behavior_profile.good_with_cats:
                score += 30
            else:
                score += 15
        else:
            score += 30
        
        # Stranger comfort (relevant for apartments/condos)
        if adopter_profile.housing_type in ['APARTMENT', 'CONDO']:
            if behavior_profile.good_with_strangers:
                score += 30
            else:
                score += 15
        else:
            score += 30
        
        return max(0, min(score, max_score))
    
    def _generate_insights(self, adopter_profile, behavior_profile, scores):
        """Generate match reasons and potential challenges."""
        # Lifestyle insights
        if scores['lifestyle_score'] > 70:
            scores['match_reasons'].append("Great lifestyle match - activity levels align well")
        elif scores['lifestyle_score'] < 40:
            scores['potential_challenges'].append("Activity level mismatch may require adjustment")
        
        # Experience insights
        if scores['experience_score'] > 70:
            scores['match_reasons'].append("Your experience level is well-suited for this pet")
        elif scores['experience_score'] < 40:
            scores['potential_challenges'].append("May require additional training support")
        
        # Housing insights
        if scores['housing_score'] > 70:
            scores['match_reasons'].append("Your housing situation is ideal for this pet")
        elif scores['housing_score'] < 40:
            scores['potential_challenges'].append("Housing situation may need modifications")
        
        # Family insights
        if scores['family_score'] > 70:
            scores['match_reasons'].append("Excellent family compatibility")
        elif scores['family_score'] < 40:
            scores['potential_challenges'].append("Family dynamics may need careful introduction")
        
        # Overall recommendation
        if scores['overall_score'] > 75:
            scores['match_reasons'].append("Highly recommended match!")
        elif scores['overall_score'] > 60:
            scores['match_reasons'].append("Good potential match with some considerations")
        elif scores['overall_score'] > 40:
            scores['match_reasons'].append("Possible match with careful planning")
        else:
            scores['potential_challenges'].append("Significant adjustments may be needed")
