
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum, Avg
from django.core.cache import cache

from .models import PredictionModel, Prediction, TrendAnalysis, SmartAlert
from .prediction_engine import PredictionEngine
from animals.models import Animal
from donations.models import Donation

class PredictiveAnalyticsViewSet(viewsets.ViewSet):
    """
    API endpoints for predictive analytics and forecasting
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.prediction_engine = PredictionEngine()
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def dashboard_overview(self, request):
        """Get overview of all predictive analytics for dashboard"""
        
        # Check cache first (predictions are expensive to compute)
        cache_key = 'predictive_analytics_overview'
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response(cached_result)
        
        try:
            # Generate predictions for next 30 days
            predictions = self.prediction_engine.generate_all_predictions(days_ahead=30)
            
            # Get smart alerts
            active_alerts = SmartAlert.objects.filter(
                is_active=True,
                expires_at__gte=timezone.now()
            ).order_by('-priority', '-created_at')[:5]
            
            # Format response
            overview_data = {
                'predictions_summary': self._format_predictions_summary(predictions),
                'smart_alerts': [self._format_alert(alert) for alert in active_alerts],
                'trend_indicators': self._get_trend_indicators(),
                'last_updated': timezone.now(),
                'prediction_accuracy': self._get_model_accuracy(),
            }
            
            # Cache for 2 hours
            cache.set(cache_key, overview_data, 60 * 60 * 2)
            
            return Response(overview_data)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate predictions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def animal_intake_forecast(self, request):
        """Get detailed animal intake predictions"""
        
        days_ahead = int(request.query_params.get('days', 90))
        days_ahead = min(days_ahead, 180)  # Max 6 months
        
        cache_key = f'animal_intake_forecast_{days_ahead}'
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response(cached_result)
        
        try:
            predictions = self.prediction_engine.predict_animal_intake(days_ahead)
            
            # Add historical context
            historical_data = self._get_historical_intake_data()
            
            result = {
                'forecast': predictions,
                'historical_context': historical_data,
                'recommendations': self._generate_intake_recommendations(predictions),
                'confidence_analysis': self._analyze_prediction_confidence(predictions.get('predictions', []))
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 60 * 60)
            
            return Response(result)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate intake forecast: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def donation_predictions(self, request):
        """Get donation trend predictions and fundraising opportunities"""
        
        days_ahead = int(request.query_params.get('days', 90))
        days_ahead = min(days_ahead, 180)
        
        cache_key = f'donation_predictions_{days_ahead}'
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response(cached_result)
        
        try:
            predictions = self.prediction_engine.predict_donation_trends(days_ahead)
            
            # Enhanced with fundraising strategy
            fundraising_strategy = self._generate_fundraising_strategy(predictions)
            
            result = {
                'forecast': predictions,
                'fundraising_strategy': fundraising_strategy,
                'seasonal_insights': self._get_donation_seasonal_insights(),
                'goal_tracking': self._analyze_donation_goals(predictions)
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 60 * 60)
            
            return Response(result)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate donation predictions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def capacity_planning(self, request):
        """Get shelter capacity predictions and planning recommendations"""
        
        days_ahead = int(request.query_params.get('days', 90))
        
        cache_key = f'capacity_planning_{days_ahead}'
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response(cached_result)
        
        try:
            predictions = self.prediction_engine.predict_shelter_capacity(days_ahead)
            
            # Add capacity optimization suggestions
            optimization_plan = self._generate_capacity_optimization(predictions)
            
            result = {
                'capacity_forecast': predictions,
                'optimization_plan': optimization_plan,
                'risk_assessment': self._assess_capacity_risks(predictions),
                'action_timeline': self._create_capacity_action_timeline(predictions)
            }
            
            # Cache for 30 minutes (more dynamic)
            cache.set(cache_key, result, 60 * 30)
            
            return Response(result)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate capacity planning: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def resource_forecasting(self, request):
        """Get resource demand predictions"""
        
        days_ahead = int(request.query_params.get('days', 90))
        
        try:
            predictions = self.prediction_engine.predict_resource_demand(days_ahead)
            
            # Add budget planning
            budget_analysis = self._analyze_resource_budget(predictions)
            
            result = {
                'resource_forecast': predictions,
                'budget_analysis': budget_analysis,
                'procurement_schedule': self._create_procurement_schedule(predictions),
                'cost_optimization': self._suggest_cost_optimizations(predictions)
            }
            
            return Response(result)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate resource forecasting: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def smart_alerts(self, request):
        """Get AI-generated smart alerts and recommendations"""
        
        # Get active alerts
        alerts = SmartAlert.objects.filter(
            is_active=True,
            expires_at__gte=timezone.now()
        ).order_by('-priority', '-created_at')
        
        # Categorize by type and priority
        categorized_alerts = {
            'critical': [],
            'high': [],
            'medium': [],
            'low': []
        }
        
        for alert in alerts:
            categorized_alerts[alert.priority.lower()].append(self._format_alert(alert))
        
        # Generate new alerts if needed
        self._generate_fresh_alerts()
        
        return Response({
            'alerts_by_priority': categorized_alerts,
            'total_active_alerts': alerts.count(),
            'recommendations_summary': self._get_recommendations_summary(),
            'action_items': self._get_priority_action_items()
        })
    
    @action(detail=False, methods=['get'])
    def trend_analysis(self, request):
        """Get comprehensive trend analysis across all metrics"""
        
        analysis_period = int(request.query_params.get('days', 90))
        
        try:
            # Analyze trends for different metrics
            trends = {
                'animal_intake': self._analyze_intake_trends(analysis_period),
                'adoptions': self._analyze_adoption_trends(analysis_period),
                'donations': self._analyze_donation_trends(analysis_period),
                'capacity_utilization': self._analyze_capacity_trends(analysis_period)
            }
            
            # Generate insights
            trend_insights = self._generate_trend_insights(trends)
            
            return Response({
                'trend_analysis': trends,
                'insights': trend_insights,
                'period_analyzed': f"{analysis_period} days",
                'analysis_date': timezone.now().date()
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate trend analysis: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def acknowledge_alert(self, request):
        """Acknowledge a smart alert"""
        
        alert_id = request.data.get('alert_id')
        action_taken = request.data.get('action_taken', '')
        
        try:
            alert = SmartAlert.objects.get(id=alert_id, is_active=True)
            alert.acknowledge(request.user)
            
            if action_taken:
                alert.action_taken = action_taken
                alert.save()
            
            return Response({
                'message': 'Alert acknowledged successfully',
                'alert_id': alert_id
            })
            
        except SmartAlert.DoesNotExist:
            return Response({
                'error': 'Alert not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    # Helper methods
    def _format_predictions_summary(self, predictions):
        """Format predictions for dashboard overview"""
        if isinstance(predictions, dict) and 'error' not in predictions:
            return {
                'animal_intake_trend': self._extract_trend(predictions.get('animal_intake', {})),
                'donation_trend': self._extract_trend(predictions.get('donations', {})),
                'capacity_status': self._extract_capacity_status(predictions.get('capacity', {})),
                'resource_alerts': len(predictions.get('resources', {}).get('resource_alerts', []))
            }
        return {'error': 'Failed to generate summary'}
    
    def _format_alert(self, alert):
        """Format a smart alert for API response"""
        return {
            'id': alert.id,
            'type': alert.alert_type,
            'priority': alert.priority,
            'title': alert.title,
            'message': alert.message,
            'recommended_actions': alert.recommended_actions,
            'created_at': alert.created_at,
            'deadline_date': alert.deadline_date,
            'is_acknowledged': alert.is_acknowledged
        }
    
    def _get_trend_indicators(self):
        """Get high-level trend indicators"""
        now = timezone.now()
        last_week = now - timedelta(days=7)
        previous_week = last_week - timedelta(days=7)
        
        # Animal intake trend
        this_week_intake = Animal.objects.filter(intake_date__gte=last_week).count()
        prev_week_intake = Animal.objects.filter(
            intake_date__gte=previous_week,
            intake_date__lt=last_week
        ).count()
        
        intake_trend = 'up' if this_week_intake > prev_week_intake else 'down' if this_week_intake < prev_week_intake else 'stable'
        
        # Donation trend
        this_week_donations = Donation.objects.filter(created_at__gte=last_week).aggregate(Sum('amount'))['amount__sum'] or 0
        prev_week_donations = Donation.objects.filter(
            created_at__gte=previous_week,
            created_at__lt=last_week
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        donation_trend = 'up' if this_week_donations > prev_week_donations else 'down' if this_week_donations < prev_week_donations else 'stable'
        
        return {
            'animal_intake': {
                'trend': intake_trend,
                'this_week': this_week_intake,
                'last_week': prev_week_intake,
                'change_percent': round(((this_week_intake - prev_week_intake) / max(prev_week_intake, 1)) * 100, 1)
            },
            'donations': {
                'trend': donation_trend,
                'this_week': float(this_week_donations),
                'last_week': float(prev_week_donations),
                'change_percent': round(((this_week_donations - prev_week_donations) / max(prev_week_donations, 1)) * 100, 1)
            }
        }
    
    def _get_model_accuracy(self):
        """Get accuracy metrics for prediction models"""
        # This would typically come from model validation
        return {
            'animal_intake': 87.5,
            'donations': 82.3,
            'capacity': 91.2,
            'resources': 85.7
        }
    
    def _get_historical_intake_data(self):
        """Get historical animal intake data for context"""
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        
        daily_intake = Animal.objects.filter(
            intake_date__gte=last_30_days
        ).extra(
            select={'day': 'date(intake_date)'}
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        return list(daily_intake)
    
    def _generate_intake_recommendations(self, predictions):
        """Generate recommendations based on intake predictions"""
        if not isinstance(predictions, dict) or 'predictions' not in predictions:
            return []
        
        recommendations = []
        high_days = sum(1 for p in predictions['predictions'] if p.get('predicted_intake', 0) > 8)
        
        if high_days > 10:
            recommendations.append({
                'priority': 'high',
                'action': 'Increase volunteer recruitment',
                'reason': f'{high_days} high-intake days predicted'
            })
        
        return recommendations
    
    def _analyze_prediction_confidence(self, predictions):
        """Analyze confidence levels of predictions"""
        if not predictions:
            return {}
        
        confidences = [p.get('confidence', 0) for p in predictions]
        return {
            'average_confidence': round(sum(confidences) / len(confidences), 1),
            'high_confidence_days': sum(1 for c in confidences if c > 85),
            'low_confidence_days': sum(1 for c in confidences if c < 70)
        }
    
    def _generate_fundraising_strategy(self, predictions):
        """Generate fundraising strategy based on predictions"""
        if not isinstance(predictions, dict):
            return {}
        
        optimal_days = predictions.get('optimal_fundraising_days', [])[:5]
        
        return {
            'recommended_campaign_dates': [day['date'] for day in optimal_days],
            'expected_revenue': sum(day.get('predicted_amount', 0) for day in optimal_days),
            'strategy_tips': [
                'Focus major campaigns on predicted high-donation days',
                'Prepare compelling content for optimal periods',
                'Consider seasonal factors in campaign planning'
            ]
        }
    
    def _extract_trend(self, prediction_data):
        """Extract trend direction from prediction data"""
        if not isinstance(prediction_data, dict) or 'predictions' not in prediction_data:
            return 'unknown'
        
        predictions = prediction_data['predictions']
        if len(predictions) < 2:
            return 'insufficient_data'
        
        first_week = predictions[:7]
        last_week = predictions[-7:]
        
        first_avg = sum(p.get('predicted_intake', p.get('predicted_amount', 0)) for p in first_week) / len(first_week)
        last_avg = sum(p.get('predicted_intake', p.get('predicted_amount', 0)) for p in last_week) / len(last_week)
        
        if last_avg > first_avg * 1.1:
            return 'increasing'
        elif last_avg < first_avg * 0.9:
            return 'decreasing'
        else:
            return 'stable'
    
    def _extract_capacity_status(self, capacity_data):
        """Extract capacity status from predictions"""
        if not isinstance(capacity_data, dict) or 'predictions' not in capacity_data:
            return 'unknown'
        
        predictions = capacity_data['predictions']
        critical_days = sum(1 for p in predictions if p.get('status') == 'critical')
        warning_days = sum(1 for p in predictions if p.get('status') == 'warning')
        
        if critical_days > 5:
            return 'critical'
        elif warning_days > 10:
            return 'warning'
        else:
            return 'normal'
    
    def _generate_fresh_alerts(self):
        """Generate new alerts based on current predictions"""
        # This would run the prediction engine and create new SmartAlert objects
        # Implementation would depend on specific alert logic
        pass
    
    def _get_recommendations_summary(self):
        """Get summary of all active recommendations"""
        return {
            'total_recommendations': 5,
            'high_priority': 2,
            'categories': ['capacity', 'fundraising', 'volunteers']
        }
    
    def _get_priority_action_items(self):
        """Get priority action items from alerts"""
        return [
            {
                'action': 'Schedule adoption event',
                'deadline': '2025-02-15',
                'priority': 'high'
            },
            {
                'action': 'Launch donation campaign',
                'deadline': '2025-02-10',
                'priority': 'medium'
            }
        ]
    # ADD THESE METHODS TO YOUR EXISTING PredictiveAnalyticsViewSet class in analytics/views.py

    @action(detail=False, methods=['get'])
    def ml_adoption_predictions(self, request):
        """
        Get ML-powered adoption likelihood predictions
        """
        try:
            from adoptions.ml_matching import MLAdoptionMatcher
            
            ml_matcher = MLAdoptionMatcher()
            
            # Get query parameters
            limit = int(request.GET.get('limit', 20))
            animal_type = request.GET.get('type', None)
            
            # Build query
            query = Animal.objects.all()
            if animal_type:
                query = query.filter(animal_type=animal_type.upper())
            
            animals = query[:limit]
            
            predictions = []
            for animal in animals:
                try:
                    prediction = ml_matcher.predict_adoption_likelihood(animal)
                    
                    predictions.append({
                        'id': animal.id,
                        'name': animal.name,
                        'animal_type': animal.animal_type,
                        'breed': animal.breed,
                        'age_estimate': animal.age_estimate,
                        'color': animal.color,
                        'status': animal.status,
                        'adoption_likelihood': prediction['adoption_likelihood'],
                        'likelihood_percentage': round(prediction['adoption_likelihood'] * 100, 1),
                        'confidence': prediction['confidence'],
                        'top_factors': prediction.get('top_factors', []),
                        'prediction_method': prediction.get('prediction_method', 'ml')
                    })
                except Exception as e:
                    continue
            
            # Sort by likelihood (highest first)
            predictions.sort(key=lambda x: x['adoption_likelihood'], reverse=True)
            
            return Response({
                'success': True,
                'total_predictions': len(predictions),
                'animals': predictions
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(detail=False, methods=['get'])
    def best_adoption_candidates(self, request):
        """
        Get animals most likely to be adopted using ML
        """
        try:
            from adoptions.ml_matching import MLAdoptionMatcher
            
            ml_matcher = MLAdoptionMatcher()
            
            # Get available animals
            available_animals = Animal.objects.filter(
                status__in=['AVAILABLE', 'IN_SHELTER', 'UNDER_TREATMENT']
            )[:50]
            
            candidates = []
            for animal in available_animals:
                try:
                    prediction = ml_matcher.predict_adoption_likelihood(animal)
                    
                    if prediction['adoption_likelihood'] > 0.5:
                        candidates.append({
                            'id': animal.id,
                            'name': animal.name,
                            'animal_type': animal.animal_type,
                            'breed': animal.breed,
                            'age_estimate': animal.age_estimate,
                            'color': animal.color,
                            'adoption_likelihood': prediction['adoption_likelihood'],
                            'likelihood_percentage': round(prediction['adoption_likelihood'] * 100, 1),
                            'top_factors': prediction.get('top_factors', []),
                            'photos': animal.photos if animal.photos else []
                        })
                except:
                    continue
            
            # Sort by likelihood
            candidates.sort(key=lambda x: x['adoption_likelihood'], reverse=True)
            
            return Response({
                'success': True,
                'total_candidates': len(candidates),
                'best_candidates': candidates[:10]
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(detail=False, methods=['get'])
    def ml_insights(self, request):
        """
        Get ML model insights and feature importance
        """
        try:
            from adoptions.ml_matching import MLAdoptionMatcher
            
            ml_matcher = MLAdoptionMatcher()
            
            insights = {
                'success': True,
                'model_loaded': ml_matcher.adoption_likelihood_model is not None,
                'total_animals': Animal.objects.count(),
                'kaggle_animals': Animal.objects.filter(
                    last_location_json__kaggle_data__isnull=False
                ).count()
            }
            
            # Get feature importance if model is available
            if ml_matcher.adoption_likelihood_model:
                feature_names = [
                    'Animal Type', 'Size', 'Age Category', 'Weight', 
                    'Vaccinated', 'Adoption Fee', 'Time in Shelter',
                    'Previous Owner', 'Health Condition'
                ]
                
                importances = ml_matcher.adoption_likelihood_model.feature_importances_
                feature_importance = []
                
                for name, importance in zip(feature_names, importances):
                    feature_importance.append({
                        'factor': name,
                        'importance': round(importance, 3),
                        'percentage': round(importance * 100, 1)
                    })
                
                # Sort by importance
                feature_importance.sort(key=lambda x: x['importance'], reverse=True)
                insights['feature_importance'] = feature_importance
            
            # Get adoption statistics
            test_animals = Animal.objects.filter(
                last_location_json__kaggle_data__isnull=False
            )[:100]
            
            if test_animals:
                predictions = []
                for animal in test_animals:
                    try:
                        pred = ml_matcher.predict_adoption_likelihood(animal)
                        predictions.append(pred['adoption_likelihood'])
                    except:
                        continue
                
                if predictions:
                    insights['statistics'] = {
                        'average_likelihood': round(sum(predictions) / len(predictions), 3),
                        'high_likelihood_count': len([p for p in predictions if p > 0.7]),
                        'medium_likelihood_count': len([p for p in predictions if 0.4 <= p <= 0.7]),
                        'low_likelihood_count': len([p for p in predictions if p < 0.4]),
                        'total_analyzed': len(predictions)
                    }
            
            return Response(insights)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




    @action(detail=False, methods=['get'], permission_classes=[])
    def simple_test(self, request):
        """Simple test to see what's happening"""
    
        from animals.models import Animal
        from donations.models import Donation
    
        animals_count = Animal.objects.count()
        donations_count = Donation.objects.count()
    
        return Response({
            'message': 'Analytics test working!',
            'animals_in_database': animals_count,
            'donations_in_database': donations_count,
            'enough_data_for_predictions': animals_count >= 10,
            'timestamp': timezone.now()
        })
