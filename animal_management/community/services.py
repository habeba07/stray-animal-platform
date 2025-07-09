# community/services.py - Enhanced version to integrate rescue activities

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Sum, Q
from .models import UserActivity, Achievement, UserAchievement
from notifications.services import create_notification
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def award_points(user, activity_type, related_object=None, custom_points=None, custom_description=None):
    """
    Enhanced point awarding system with rescue activity integration
    """

    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"AWARD_POINTS DEBUG: User {user.id}, Type {activity_type}, Points {custom_points}")

    try:
        # Get points for activity type
        points = custom_points or UserActivity.POINT_VALUES.get(activity_type, 0)
        
        # Enhanced descriptions for rescue activities
        description_map = {
            'RESCUE_ACCEPTED': f'Accepted emergency rescue: {get_rescue_description(related_object)}',
            'RESCUE_COMPLETED': f'Completed rescue mission: {get_rescue_description(related_object)}',
            'EMERGENCY_RESPONSE': f'Emergency response: {get_rescue_description(related_object)}',
            'FAST_RESPONSE': f'Lightning-fast response: {get_rescue_description(related_object)}',
            'MULTIPLE_RESCUES_DAY': f'Multiple rescues in one day',
            'RESCUE_COLLABORATION': f'Team rescue collaboration: {get_rescue_description(related_object)}',
            'TRAINING_COMPLETED': f'Completed training: {related_object.training_title if hasattr(related_object, "training_title") else "Unknown"}',
            'LEARNING_START': f'Started learning: {related_object.title if hasattr(related_object, "title") else "Training"}',
            'LEARNING_COMPLETE': f'Completed course: {related_object.title if hasattr(related_object, "title") else "Training"}',
            'QUIZ_PASSED': f'Passed quiz: {related_object.title if hasattr(related_object, "title") else "Assessment"}',
        }
        
        description = custom_description or description_map.get(
            activity_type, 
            dict(UserActivity.ACTIVITY_TYPES).get(activity_type, activity_type)
        )
        
        # Create activity record
        activity = UserActivity.objects.create(
            user=user,
            activity_type=activity_type,
            points_earned=points,
            description=description,
            related_object_id=related_object.id if related_object else None,
            related_object_type=related_object.__class__.__name__.lower() if related_object else None
        )
        
        # Award points to user
        user.points = (user.points or 0) + points
        user.save(update_fields=['points'])
        
        # Check for special bonus conditions
        check_bonus_conditions(user, activity_type, related_object)
        
        # Check for new achievements
        check_achievements(user)
        
        # Create notification for significant activities
        if activity_type in ['RESCUE_COMPLETED', 'EMERGENCY_RESPONSE', 'TRAINING_COMPLETED']:
            create_notification(
                recipient=user,
                notification_type='ACHIEVEMENT',
                title=f'🎉 Points Earned: +{points}',
                message=description,
                related_object=activity
            )
        
        logger.info(f"Awarded {points} points to {user.username} for {activity_type}")
        return activity
        
    except Exception as e:
        logger.error(f"Error awarding points to {user.username}: {e}")
        return None

def get_rescue_description(rescue_assignment):
    """Generate descriptive text for rescue activities"""
    if not rescue_assignment:
        return "Animal rescue"
    
    try:
        if hasattr(rescue_assignment, 'report'):
            report = rescue_assignment.report
            animal_type = getattr(report, 'animal_type', 'animal')


            if animal_type == 'None' or animal_type is None:
                # Try to extract from description
                desc = getattr(report, 'description', '').lower()
                if 'dog' in desc:
                    animal_type = 'Dog'
                elif 'cat' in desc:
                    animal_type = 'Cat'
                elif 'bird' in desc:
                    animal_type = 'Bird'
                else:
                    animal_type = 'Animal'


            urgency = getattr(report, 'urgency_level', 'normal')
            
            urgency_text = {
                'EMERGENCY': '🚨 EMERGENCY',
                'HIGH': '⚠️ HIGH PRIORITY',
                'NORMAL': '',
                'LOW': 'routine'
            }.get(urgency, '')
            
            return f"{urgency_text} {animal_type} rescue".strip()
        
        return "Animal rescue mission"
    except:
        return "Animal rescue"

def check_bonus_conditions(user, activity_type, related_object):
    """Check for bonus point conditions and award automatically"""
    
    if activity_type == 'RESCUE_ACCEPTED' and related_object:
        try:
            # Check for fast response (under 15 minutes)
            if hasattr(related_object, 'response_time_minutes') and related_object.response_time_minutes:
                if related_object.response_time_minutes <= 15:
                    award_points(user, 'FAST_RESPONSE', related_object)
            
            # Check for emergency response
            if hasattr(related_object, 'report') and related_object.report:
                urgency = getattr(related_object.report, 'urgency_level', 'NORMAL')
                if urgency in ['HIGH', 'EMERGENCY']:
                    award_points(user, 'EMERGENCY_RESPONSE', related_object)
            
        except Exception as e:
            logger.error(f"Error checking rescue bonus conditions: {e}")
    
    elif activity_type == 'RESCUE_COMPLETED':
        try:
            # Check for multiple rescues in one day
            today = timezone.now().date()
            
            # Count today's completed rescues
            todays_rescues = UserActivity.objects.filter(
                user=user,
                activity_type='RESCUE_COMPLETED',
                created_at__date=today
            ).count()
            
            # Award bonus for multiple rescues (3 or more)
            if todays_rescues >= 3:
                # Check if already awarded today
                already_awarded = UserActivity.objects.filter(
                    user=user,
                    activity_type='MULTIPLE_RESCUES_DAY',
                    created_at__date=today
                ).exists()
                
                if not already_awarded:
                    award_points(user, 'MULTIPLE_RESCUES_DAY')
            
            # Check for collaboration (multiple volunteers on same rescue)
            if hasattr(related_object, 'report'):
                other_volunteers = related_object.report.volunteer_assignments.exclude(
                    volunteer=user
                ).filter(status='COMPLETED').count()
                
                if other_volunteers > 0:
                    award_points(user, 'RESCUE_COLLABORATION', related_object)
                    
        except Exception as e:
            logger.error(f"Error checking completion bonus conditions: {e}")

def check_achievements(user):
    """Check if user has earned new achievements"""
    
    try:
        # Get all active achievements user hasn't earned yet
        unearned_achievements = Achievement.objects.filter(
            is_active=True
        ).exclude(
            id__in=user.achievements.values_list('achievement_id', flat=True)
        )
        
        for achievement in unearned_achievements:
            if achievement.check_criteria(user):
                # Award achievement
                UserAchievement.objects.create(
                    user=user,
                    achievement=achievement
                )
                
                # Award bonus points for achievement
                if achievement.points_reward > 0:
                    award_points(
                        user, 
                        'ACHIEVEMENT_EARNED', 
                        achievement,
                        custom_points=achievement.points_reward,
                        custom_description=f'Achievement unlocked: {achievement.name}'
                    )
                
                # Send achievement notification
                create_notification(
                    recipient=user,
                    notification_type='ACHIEVEMENT',
                    title=f'🏆 Achievement Unlocked!',
                    message=f'You earned: {achievement.name}',
                    related_object=achievement
                )
                
                logger.info(f"User {user.username} earned achievement: {achievement.name}")
                
    except Exception as e:
        logger.error(f"Error checking achievements for {user.username}: {e}")

def get_user_activity_stats(user, days=30):
    """Get comprehensive activity statistics for a user"""
    
    from datetime import timedelta
    cutoff_date = timezone.now() - timedelta(days=days)
    
    # Base activity query
    activities = UserActivity.objects.filter(
        user=user,
        created_at__gte=cutoff_date
    )
    
    # Rescue-specific stats
    rescue_stats = {
        'total_rescues': activities.filter(activity_type='RESCUE_COMPLETED').count(),
        'emergency_responses': activities.filter(activity_type='EMERGENCY_RESPONSE').count(),
        'fast_responses': activities.filter(activity_type='FAST_RESPONSE').count(),
        'team_collaborations': activities.filter(activity_type='RESCUE_COLLABORATION').count(),
    }
    
    # Training stats
    training_stats = {
        'courses_completed': activities.filter(activity_type='LEARNING_COMPLETE').count(),
        'quizzes_passed': activities.filter(activity_type='QUIZ_PASSED').count(),
        'training_certifications': activities.filter(activity_type='TRAINING_COMPLETED').count(),
    }
    
    # Point breakdown
    point_breakdown = {}
    for activity_type, _ in UserActivity.ACTIVITY_TYPES:
        points = activities.filter(activity_type=activity_type).aggregate(
            total_points=Sum('points_earned')
        )['total_points'] or 0
        if points > 0:
            point_breakdown[activity_type] = points
    
    # Recent activities
    recent_activities = activities.order_by('-created_at')[:10]
    
    return {
        'total_points_period': activities.aggregate(Sum('points_earned'))['points_earned__sum'] or 0,
        'total_activities': activities.count(),
        'rescue_stats': rescue_stats,
        'training_stats': training_stats,
        'point_breakdown': point_breakdown,
        'recent_activities': recent_activities,
        'period_days': days
    }

def get_leaderboard(activity_type=None, days=30, limit=10):
    """Get user leaderboard for activities"""
    
    from datetime import timedelta
    cutoff_date = timezone.now() - timedelta(days=days)
    
    # Build query
    query = UserActivity.objects.filter(created_at__gte=cutoff_date)
    
    if activity_type:
        query = query.filter(activity_type=activity_type)
    
    # Group by user and sum points
    leaderboard = query.values('user__username', 'user__id').annotate(
        total_points=Sum('points_earned'),
        activity_count=Count('id')
    ).order_by('-total_points')[:limit]
    
    return list(leaderboard)

def get_community_stats():
    """Get overall community activity statistics"""
    
    today = timezone.now().date()
    this_month = timezone.now().replace(day=1).date()
    
    stats = {
        'total_volunteers': User.objects.filter(user_type='VOLUNTEER').count(),
        'active_volunteers_today': UserActivity.objects.filter(
            created_at__date=today
        ).values('user').distinct().count(),
        'rescues_this_month': UserActivity.objects.filter(
            activity_type='RESCUE_COMPLETED',
            created_at__date__gte=this_month
        ).count(),
        'training_completions_this_month': UserActivity.objects.filter(
            activity_type__in=['LEARNING_COMPLETE', 'TRAINING_COMPLETED'],
            created_at__date__gte=this_month
        ).count(),
        'total_points_awarded': UserActivity.objects.aggregate(
            Sum('points_earned')
        )['points_earned__sum'] or 0,
        'achievements_earned': UserAchievement.objects.count(),
    }
    
    return stats

# Integration functions for volunteer views

def track_rescue_assignment_accepted(volunteer_assignment):
    """Track when a volunteer accepts a rescue assignment"""
    award_points(
        volunteer_assignment.volunteer,
        'RESCUE_ACCEPTED',
        volunteer_assignment
    )

def track_rescue_assignment_completed(volunteer_assignment):
    """Track when a volunteer completes a rescue assignment"""
    award_points(
        volunteer_assignment.volunteer,
        'RESCUE_COMPLETED',
        volunteer_assignment
    )

def track_training_started(user, resource):
    """Track when a user starts training"""
    award_points(user, 'LEARNING_START', resource)

def track_training_completed(user, resource):
    """Track when a user completes training"""
    award_points(user, 'LEARNING_COMPLETE', resource)

def track_quiz_passed(user, resource, score):
    """Track when a user passes a quiz"""
    if score >= 80:  # Passing score
        award_points(user, 'QUIZ_PASSED', resource)

def track_certification_earned(user, certification):
    """Track when a user earns a certification"""
    award_points(user, 'TRAINING_COMPLETED', certification)
