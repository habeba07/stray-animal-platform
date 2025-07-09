import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.metrics import mean_absolute_error, mean_squared_error
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

from .models import PredictionModel, Prediction, TrendAnalysis, SmartAlert, SeasonalPattern
from animals.models import Animal
from donations.models import Donation
from reports.models import Report

class PredictionEngine:
    """
    AI-powered prediction engine for animal management forecasting
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}

    def make_json_serializable(self, obj):
        """Convert non-serializable types to JSON-safe types"""
        if isinstance(obj, dict):
            return {key: self.make_json_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self.make_json_serializable(item) for item in obj]
        elif isinstance(obj, (np.float64, np.float32)):
            return float(obj)
        elif isinstance(obj, (np.int64, np.int32, np.int16)):
            return int(obj)
        elif isinstance(obj, (date, datetime)):
            return obj.isoformat() if hasattr(obj, 'isoformat') else str(obj)
        else:
            return obj
        
    def generate_all_predictions(self, days_ahead=90):
        """Generate predictions for all active prediction models"""
        results = {}
        
        try:
            # Animal intake forecasting
            results['animal_intake'] = self.predict_animal_intake(days_ahead)
            
            # Donation trend predictions
            results['donations'] = self.predict_donation_trends(days_ahead)
            
            # Capacity planning
            results['capacity'] = self.predict_shelter_capacity(days_ahead)
            
            # Resource demand
            results['resources'] = self.predict_resource_demand(days_ahead)
            
            # Generate smart alerts
            results['alerts'] = self.generate_smart_alerts(results)
            
            return results
            
        except Exception as e:
            print(f"Prediction engine error: {str(e)}")
            return {"error": str(e)}
    
    def predict_animal_intake(self, days_ahead=90):
        """Predict animal intake patterns"""
        
        # Get historical animal intake data
        end_date = timezone.now()
        start_date = end_date - timedelta(days=365)  # Use 1 year of data
        
        # Group animals by intake date
        intake_data = Animal.objects.filter(
            intake_date__gte=start_date,
            intake_date__lte=end_date
        ).extra(
            select={'day': 'date(intake_date)'}
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        if not intake_data:
            return {"error": "Insufficient intake data"}
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(list(intake_data))
        df['day'] = pd.to_datetime(df['day'])
        
        # Create features for ML model
        df['dayofweek'] = df['day'].dt.dayofweek
        df['month'] = df['day'].dt.month
        df['quarter'] = df['day'].dt.quarter
        df['day_of_year'] = df['day'].dt.dayofyear
        
        # Add rolling averages
        df['count_7day_avg'] = df['count'].rolling(window=7).mean()
        df['count_30day_avg'] = df['count'].rolling(window=30).mean()
        
        # Prepare features and target
        features = ['dayofweek', 'month', 'quarter', 'day_of_year', 'count_7day_avg', 'count_30day_avg']
        X = df[features].fillna(df[features].mean())
        y = df['count']
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        # Generate predictions
        future_dates = [end_date + timedelta(days=i) for i in range(1, days_ahead + 1)]
        predictions = []
        
        for future_date in future_dates:
            # Create features for future date
            future_features = [
                future_date.weekday(),
                future_date.month,
                (future_date.month - 1) // 3 + 1,  # quarter
                future_date.timetuple().tm_yday,   # day of year
                df['count'].tail(7).mean(),        # recent 7-day average
                df['count'].tail(30).mean()        # recent 30-day average
            ]
            
            prediction = model.predict([future_features])[0]
            confidence = min(95, max(60, 90 - abs(prediction - df['count'].mean()) / df['count'].std() * 10))
            
            predictions.append({
                'date': future_date.date(),
                'predicted_intake': max(0, round(prediction)),
                'confidence': round(confidence, 1)
            })
        
        # Calculate seasonal patterns
        seasonal_analysis = self._analyze_seasonal_patterns(df, 'animal_intake')
        
        # Generate insights
        insights = self._generate_intake_insights(predictions, seasonal_analysis)
        
        return {
            'predictions': predictions,
            'seasonal_patterns': seasonal_analysis,
            'insights': insights,
            'model_accuracy': round(model.score(X, y) * 100, 1),
            'data_points': len(df)
        }
    
    def predict_donation_trends(self, days_ahead=90):
        """Predict donation patterns and optimal fundraising times"""
        
        # Get historical donation data
        end_date = timezone.now()
        start_date = end_date - timedelta(days=365)
        
        # Group donations by day
        donation_data = Donation.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(
            total_amount=Sum('amount'),
            donation_count=Count('id'),
            avg_donation=Avg('amount')
        ).order_by('day')
        
        if not donation_data:
            return {"error": "Insufficient donation data"}
        
        # Convert to DataFrame
        df = pd.DataFrame(list(donation_data))
        df['day'] = pd.to_datetime(df['day'])
        df['total_amount'] = df['total_amount'].astype(float)
        
        # Create features
        df['dayofweek'] = df['day'].dt.dayofweek
        df['month'] = df['day'].dt.month
        df['is_weekend'] = df['dayofweek'].isin([5, 6]).astype(int)
        df['is_month_end'] = (df['day'].dt.day > 25).astype(int)
        
        # Add trend features
        df['amount_7day_avg'] = df['total_amount'].rolling(window=7).mean()
        df['amount_30day_avg'] = df['total_amount'].rolling(window=30).mean()
        
        # Prepare for ML
        features = ['dayofweek', 'month', 'is_weekend', 'is_month_end', 'amount_7day_avg', 'amount_30day_avg']
        X = df[features].fillna(df[features].mean())
        y = df['total_amount']
        
        # Train models for different metrics
        amount_model = RandomForestRegressor(n_estimators=100, random_state=42)
        count_model = RandomForestRegressor(n_estimators=100, random_state=42)
        
        amount_model.fit(X, df['total_amount'])
        count_model.fit(X, df['donation_count'])
        
        # Generate predictions
        future_dates = [end_date + timedelta(days=i) for i in range(1, days_ahead + 1)]
        predictions = []
        
        for future_date in future_dates:
            future_features = [
                future_date.weekday(),
                future_date.month,
                1 if future_date.weekday() >= 5 else 0,  # is_weekend
                1 if future_date.day > 25 else 0,         # is_month_end
                df['total_amount'].tail(7).mean(),        # recent average
                df['total_amount'].tail(30).mean()        # monthly average
            ]
            
            predicted_amount = amount_model.predict([future_features])[0]
            predicted_count = count_model.predict([future_features])[0]
            
            predictions.append({
                'date': future_date.date(),
                'predicted_amount': max(0, round(predicted_amount, 2)),
                'predicted_donations': max(0, round(predicted_count)),
                'avg_donation': round(predicted_amount / max(1, predicted_count), 2)
            })
        
        # Find optimal fundraising days
        optimal_days = self._find_optimal_fundraising_days(predictions)
        
        return {
            'predictions': predictions,
            'optimal_fundraising_days': optimal_days,
            'insights': self._generate_donation_insights(predictions, df),
            'model_accuracy': {
                'amount_accuracy': round(amount_model.score(X, df['total_amount']) * 100, 1),
                'count_accuracy': round(count_model.score(X, df['donation_count']) * 100, 1)
            },
            'historical_patterns': self._analyze_donation_patterns(df)
        }
    
    def predict_shelter_capacity(self, days_ahead=90):
        """Predict shelter capacity and occupancy"""
        
        # Get current animal counts by status
        current_animals = Animal.objects.values('status').annotate(count=Count('id'))
        current_capacity = {item['status']: item['count'] for item in current_animals}
        
        # Historical trends
        end_date = timezone.now()
        start_date = end_date - timedelta(days=180)
        
        # Daily capacity changes
        daily_changes = []
        for i in range(180):
            check_date = start_date + timedelta(days=i)
            day_animals = Animal.objects.filter(
                intake_date__lte=check_date
            ).exclude(
                status__in=['ADOPTED', 'RETURNED']
            ).count()
            
            daily_changes.append({
                'date': check_date.date(),
                'occupancy': day_animals
            })
        
        if not daily_changes:
            return {"error": "Insufficient capacity data"}
        
        # Analyze trends
        df = pd.DataFrame(daily_changes)
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate moving average trend
        df['trend_7day'] = df['occupancy'].rolling(window=7).mean()
        df['trend_30day'] = df['occupancy'].rolling(window=30).mean()
        
        # Simple trend projection
        recent_trend = df['occupancy'].tail(30).mean() - df['occupancy'].head(30).mean()
        daily_change = recent_trend / 30
        
        # Generate capacity predictions
        current_occupancy = df['occupancy'].iloc[-1]
        predictions = []
        
        for i in range(1, days_ahead + 1):
            future_date = end_date + timedelta(days=i)
            predicted_occupancy = current_occupancy + (daily_change * i)
            
            # Add some seasonality (higher in summer)
            seasonal_factor = 1.0 + (0.2 * np.sin(2 * np.pi * future_date.month / 12))
            predicted_occupancy *= seasonal_factor
            
            capacity_percentage = (predicted_occupancy / 100) * 100  # Assume max capacity of 100
            
            predictions.append({
                'date': future_date.date(),
                'predicted_occupancy': max(0, round(predicted_occupancy)),
                'capacity_percentage': min(100, max(0, round(capacity_percentage, 1))),
                'status': 'normal' if capacity_percentage < 80 else 'warning' if capacity_percentage < 95 else 'critical'
            })
        
        # Generate capacity alerts
        capacity_alerts = []
        for pred in predictions:
            if pred['capacity_percentage'] > 90:
                capacity_alerts.append({
                    'date': pred['date'],
                    'severity': 'critical' if pred['capacity_percentage'] > 95 else 'warning',
                    'message': f"Capacity expected to reach {pred['capacity_percentage']}%"
                })
        
        return {
            'predictions': predictions,
            'current_capacity': current_capacity,
            'capacity_alerts': capacity_alerts,
            'trend_analysis': {
                'daily_change': round(daily_change, 2),
                'trend_direction': 'increasing' if daily_change > 0 else 'decreasing' if daily_change < 0 else 'stable'
            }
        }
    
    def predict_resource_demand(self, days_ahead=90):
        """Predict resource needs (food, medical supplies, etc.)"""
        
        # Get current animal population
        current_animals = Animal.objects.exclude(status__in=['ADOPTED', 'RETURNED']).count()
        
        # Estimate daily resource consumption per animal
        resources = {
            'food_kg_per_day': 0.3,      # kg per animal per day
            'medical_budget_per_month': 25.0,  # $ per animal per month
            'cleaning_supplies_per_week': 2.0,  # $ per animal per week
            'volunteer_hours_per_day': 0.5     # hours per animal per day
        }
        
        # Predict animal population growth (from intake predictions)
        intake_predictions = self.predict_animal_intake(days_ahead)
        
        predictions = []
        cumulative_animals = current_animals
        
        for i in range(1, days_ahead + 1):
            future_date = timezone.now() + timedelta(days=i)
            
            # Estimate population change
            if isinstance(intake_predictions, dict) and 'predictions' in intake_predictions:
                daily_intake = intake_predictions['predictions'][min(i-1, len(intake_predictions['predictions'])-1)]['predicted_intake']
                daily_adoptions = max(0, daily_intake * 0.7)  # Assume 70% adoption rate
                cumulative_animals += daily_intake - daily_adoptions
            
            # Calculate resource needs
            food_needed = cumulative_animals * resources['food_kg_per_day']
            medical_budget = (cumulative_animals * resources['medical_budget_per_month']) / 30
            cleaning_budget = (cumulative_animals * resources['cleaning_supplies_per_week']) / 7
            volunteer_hours = cumulative_animals * resources['volunteer_hours_per_day']
            
            predictions.append({
                'date': future_date.date(),
                'estimated_animal_count': round(cumulative_animals),
                'food_needed_kg': round(food_needed, 1),
                'medical_budget_daily': round(medical_budget, 2),
                'cleaning_budget_daily': round(cleaning_budget, 2),
                'volunteer_hours_needed': round(volunteer_hours, 1),
                'total_daily_cost': round(medical_budget + cleaning_budget + (food_needed * 2), 2)  # $2 per kg food
            })
        
        # Generate resource alerts
        resource_alerts = []
        avg_daily_cost = sum(p['total_daily_cost'] for p in predictions) / len(predictions)
        
        if avg_daily_cost > 500:  # Threshold for high cost
            resource_alerts.append({
                'type': 'budget_alert',
                'message': f"Predicted daily costs averaging ${avg_daily_cost:.2f}",
                'severity': 'high' if avg_daily_cost > 1000 else 'medium'
            })
        
        return {
            'predictions': predictions,
            'resource_alerts': resource_alerts,
            'summary': {
                'avg_daily_animals': round(sum(p['estimated_animal_count'] for p in predictions) / len(predictions)),
                'avg_daily_cost': round(avg_daily_cost, 2),
                'total_predicted_cost': round(sum(p['total_daily_cost'] for p in predictions), 2)
            }
        }
    
    def generate_smart_alerts(self, prediction_results):
        """Generate AI-powered smart alerts based on predictions"""
        
        alerts = []
        
        # Check animal intake alerts
        if 'animal_intake' in prediction_results and isinstance(prediction_results['animal_intake'], dict):
            intake_data = prediction_results['animal_intake']
            if 'predictions' in intake_data:
                avg_intake = sum(p['predicted_intake'] for p in intake_data['predictions'][:30]) / 30
                if avg_intake > 10:  # High intake threshold
                    alerts.append({
                        'type': 'high_intake_warning',
                        'priority': 'high',
                        'title': 'High Animal Intake Predicted',
                        'message': f"Predicted average of {avg_intake:.1f} animals per day in next 30 days",
                        'recommendations': [
                            'Increase volunteer recruitment',
                            'Prepare additional shelter space',
                            'Stock up on food and medical supplies'
                        ]
                    })
        
        # Check capacity alerts
        if 'capacity' in prediction_results and isinstance(prediction_results['capacity'], dict):
            capacity_data = prediction_results['capacity']
            if 'capacity_alerts' in capacity_data and capacity_data['capacity_alerts']:
                alerts.append({
                    'type': 'capacity_warning',
                    'priority': 'critical',
                    'title': 'Shelter Capacity Warning',
                    'message': f"{len(capacity_data['capacity_alerts'])} days with high capacity predicted",
                    'recommendations': [
                        'Accelerate adoption events',
                        'Contact partner shelters for transfers',
                        'Increase marketing for adoptions'
                    ]
                })
        
        # Check donation opportunities
        if 'donations' in prediction_results and isinstance(prediction_results['donations'], dict):
            donation_data = prediction_results['donations']
            if 'optimal_fundraising_days' in donation_data:
                optimal_days = donation_data['optimal_fundraising_days'][:5]  # Top 5 days
                alerts.append({
                    'type': 'donation_opportunity',
                    'priority': 'medium',
                    'title': 'Optimal Fundraising Opportunities',
                    'message': f"Next 5 optimal fundraising days identified",
                    'recommendations': [
                        'Plan special campaigns for optimal days',
                        'Prepare compelling success stories',
                        'Coordinate with marketing team'
                    ],
                    'data': optimal_days
                })
        
        return alerts
    
    # Helper methods
    def _analyze_seasonal_patterns(self, df, metric_type):
        """Analyze seasonal patterns in the data"""
        monthly_avg = df.groupby(df['day'].dt.month)['count'].mean().to_dict()
        weekly_avg = df.groupby(df['day'].dt.dayofweek)['count'].mean().to_dict()
        
        return {
            'monthly_patterns': monthly_avg,
            'weekly_patterns': weekly_avg,
            'peak_month': max(monthly_avg, key=monthly_avg.get),
            'low_month': min(monthly_avg, key=monthly_avg.get),
            'best_day_of_week': max(weekly_avg, key=weekly_avg.get)
        }
    
    def _generate_intake_insights(self, predictions, seasonal_analysis):
        """Generate insights from intake predictions"""
        insights = []
        
        # High vs low periods
        high_days = [p for p in predictions if p['predicted_intake'] > 8]
        if high_days:
            insights.append(f"Expect {len(high_days)} high-intake days (8+ animals) in next {len(predictions)} days")
        
        # Seasonal insight
        if seasonal_analysis:
            peak_month = seasonal_analysis.get('peak_month', 'Unknown')
            insights.append(f"Historically, month {peak_month} has the highest intake")
        
        return insights
    
    def _find_optimal_fundraising_days(self, predictions):
        """Find the best days for fundraising based on predictions"""
        # Sort by predicted amount and return top days
        sorted_days = sorted(predictions, key=lambda x: x['predicted_amount'], reverse=True)
        return sorted_days[:10]  # Top 10 days
    
    def _generate_donation_insights(self, predictions, historical_df):
        """Generate insights from donation predictions"""
        insights = []
        
        total_predicted = sum(p['predicted_amount'] for p in predictions)
        insights.append(f"Total predicted donations: ${total_predicted:,.2f}")
        
        # Weekly patterns
        weekday_avg = historical_df.groupby('dayofweek')['total_amount'].mean()
        best_weekday = weekday_avg.idxmax()
        insights.append(f"Best day of week for donations: {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][best_weekday]}")
        
        return insights
    
    def _analyze_donation_patterns(self, df):
        """Analyze historical donation patterns"""
        return {
            'avg_daily_amount': round(df['total_amount'].mean(), 2),
            'avg_daily_count': round(df['donation_count'].mean(), 1),
            'best_month': df.groupby('month')['total_amount'].mean().idxmax(),
            'weekend_vs_weekday': {
                'weekend_avg': round(df[df['is_weekend'] == 1]['total_amount'].mean(), 2),
                'weekday_avg': round(df[df['is_weekend'] == 0]['total_amount'].mean(), 2)
            }
        }
