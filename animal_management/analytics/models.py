
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import json

class PredictionModel(models.Model):
    """Store different prediction models and their configurations"""
    PREDICTION_TYPES = (
        ('ANIMAL_INTAKE', 'Animal Intake Forecasting'),
        ('DONATION_TRENDS', 'Donation Trend Prediction'),
        ('CAPACITY_PLANNING', 'Shelter Capacity Planning'),
        ('RESOURCE_DEMAND', 'Resource Demand Forecasting'),
        ('SEASONAL_PATTERNS', 'Seasonal Pattern Analysis'),
        ('ADOPTION_RATES', 'Adoption Rate Prediction'),
    )
    
    name = models.CharField(max_length=100)
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    accuracy_score = models.FloatField(null=True, blank=True)  # Model accuracy %
    last_trained = models.DateTimeField(null=True, blank=True)
    training_data_points = models.IntegerField(default=0)
    
    # Model parameters
    model_parameters = models.JSONField(default=dict)  # Store model config
    feature_importance = models.JSONField(default=dict)  # Feature weights
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.prediction_type})"


class Prediction(models.Model):
    """Store individual predictions made by the system"""
    CONFIDENCE_LEVELS = (
        ('LOW', 'Low Confidence (60-70%)'),
        ('MEDIUM', 'Medium Confidence (70-85%)'),
        ('HIGH', 'High Confidence (85-95%)'),
        ('VERY_HIGH', 'Very High Confidence (95%+)'),
    )
    
    model = models.ForeignKey(PredictionModel, on_delete=models.CASCADE, related_name='predictions')
    prediction_date = models.DateTimeField(default=timezone.now)
    target_date = models.DateTimeField()  # Date being predicted for
    
    # Prediction values
    predicted_value = models.FloatField()
    actual_value = models.FloatField(null=True, blank=True)  # Fill in later for accuracy tracking
    confidence_level = models.CharField(max_length=10, choices=CONFIDENCE_LEVELS)
    confidence_score = models.FloatField()  # 0-100%
    
    # Context data
    prediction_context = models.JSONField(default=dict)  # Factors that influenced prediction
    seasonal_factors = models.JSONField(default=dict)   # Seasonal adjustments applied
    
    # Accuracy tracking
    prediction_error = models.FloatField(null=True, blank=True)
    is_validated = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-target_date']
    
    def __str__(self):
        return f"{self.model.name}: {self.predicted_value} for {self.target_date.date()}"
    
    def calculate_accuracy(self):
        """Calculate prediction accuracy when actual value is available"""
        if self.actual_value is not None:
            error = abs(self.predicted_value - self.actual_value) / max(self.actual_value, 1)
            self.prediction_error = error * 100  # Convert to percentage
            self.is_validated = True
            self.save()
            return 100 - self.prediction_error
        return None


class TrendAnalysis(models.Model):
    """Store trend analysis results for different metrics"""
    TREND_TYPES = (
        ('ANIMAL_INTAKE', 'Animal Intake Trends'),
        ('DONATIONS', 'Donation Trends'),
        ('ADOPTIONS', 'Adoption Trends'),
        ('CAPACITY', 'Shelter Capacity Trends'),
        ('VOLUNTEER_ENGAGEMENT', 'Volunteer Engagement'),
    )
    
    TREND_DIRECTIONS = (
        ('UPWARD', 'Increasing Trend'),
        ('DOWNWARD', 'Decreasing Trend'),
        ('STABLE', 'Stable/Flat'),
        ('SEASONAL', 'Seasonal Pattern'),
        ('VOLATILE', 'High Volatility'),
    )
    
    trend_type = models.CharField(max_length=30, choices=TREND_TYPES)
    analysis_period_start = models.DateField()
    analysis_period_end = models.DateField()
    
    # Trend characteristics
    trend_direction = models.CharField(max_length=15, choices=TREND_DIRECTIONS)
    trend_strength = models.FloatField()  # 0-100, how strong the trend is
    growth_rate = models.FloatField()     # % change per period
    seasonality_detected = models.BooleanField(default=False)
    
    # Statistical measures
    correlation_coefficient = models.FloatField(null=True, blank=True)
    r_squared = models.FloatField(null=True, blank=True)
    volatility_index = models.FloatField(null=True, blank=True)
    
    # Insights and patterns
    key_insights = models.JSONField(default=list)      # List of key findings
    seasonal_patterns = models.JSONField(default=dict) # Monthly/seasonal patterns
    anomalies_detected = models.JSONField(default=list) # Unusual data points
    
    # Recommendations
    recommendations = models.JSONField(default=list)   # Action recommendations
    risk_factors = models.JSONField(default=list)     # Identified risks
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Trend Analyses'
    
    def __str__(self):
        return f"{self.trend_type} Analysis: {self.trend_direction} ({self.analysis_period_start} to {self.analysis_period_end})"


class SmartAlert(models.Model):
    """AI-generated alerts and recommendations based on predictions"""
    ALERT_TYPES = (
        ('CAPACITY_WARNING', 'Capacity Warning'),
        ('DONATION_OPPORTUNITY', 'Donation Opportunity'),
        ('RESOURCE_SHORTAGE', 'Resource Shortage Prediction'),
        ('SEASONAL_PREPARATION', 'Seasonal Preparation'),
        ('TREND_ANOMALY', 'Trend Anomaly Detected'),
        ('OPTIMIZATION_SUGGESTION', 'Process Optimization'),
    )
    
    PRIORITY_LEVELS = (
        ('LOW', 'Low Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('HIGH', 'High Priority'),
        ('CRITICAL', 'Critical Action Required'),
    )
    
    alert_type = models.CharField(max_length=25, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Data backing the alert
    related_prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE, null=True, blank=True)
    related_trend = models.ForeignKey(TrendAnalysis, on_delete=models.CASCADE, null=True, blank=True)
    supporting_data = models.JSONField(default=dict)
    
    # Recommended actions
    recommended_actions = models.JSONField(default=list)
    estimated_impact = models.TextField(blank=True)
    deadline_date = models.DateTimeField(null=True, blank=True)
    
    # Alert management
    is_active = models.BooleanField(default=True)
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    # Follow-up
    action_taken = models.TextField(blank=True)
    outcome_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.priority} Alert: {self.title}"
    
    def acknowledge(self, user):
        """Mark alert as acknowledged by a user"""
        self.is_acknowledged = True
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save()


class ForecastAccuracy(models.Model):
    """Track accuracy of different prediction models over time"""
    model = models.ForeignKey(PredictionModel, on_delete=models.CASCADE, related_name='accuracy_history')
    evaluation_date = models.DateField()
    
    # Accuracy metrics
    mean_absolute_error = models.FloatField()
    root_mean_square_error = models.FloatField()
    mean_absolute_percentage_error = models.FloatField()
    accuracy_percentage = models.FloatField()
    
    # Evaluation details
    predictions_evaluated = models.IntegerField()
    evaluation_period_days = models.IntegerField()
    data_quality_score = models.FloatField()  # 0-100, quality of input data
    
    # Performance insights
    best_performing_scenarios = models.JSONField(default=list)
    worst_performing_scenarios = models.JSONField(default=list)
    improvement_suggestions = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-evaluation_date']
        unique_together = ['model', 'evaluation_date']
    
    def __str__(self):
        return f"{self.model.name} Accuracy: {self.accuracy_percentage:.1f}% ({self.evaluation_date})"


class SeasonalPattern(models.Model):
    """Store identified seasonal patterns for different metrics"""
    PATTERN_TYPES = (
        ('MONTHLY', 'Monthly Pattern'),
        ('QUARTERLY', 'Quarterly Pattern'),
        ('ANNUAL', 'Annual Pattern'),
        ('WEEKLY', 'Weekly Pattern'),
    )
    
    metric_name = models.CharField(max_length=100)  # e.g., "Animal Intake", "Donations"
    pattern_type = models.CharField(max_length=15, choices=PATTERN_TYPES)
    
    # Pattern data
    pattern_data = models.JSONField()  # Seasonal multipliers/adjustments
    peak_periods = models.JSONField(default=list)     # When values are highest
    low_periods = models.JSONField(default=list)      # When values are lowest
    
    # Statistical measures
    seasonal_strength = models.FloatField()  # How strong the seasonal effect is
    pattern_reliability = models.FloatField()  # How consistent the pattern is
    
    # Context
    discovered_date = models.DateField(auto_now_add=True)
    data_points_used = models.IntegerField()
    years_of_data = models.FloatField()
    
    # Business insights
    business_explanations = models.JSONField(default=list)  # Why these patterns occur
    recommended_preparations = models.JSONField(default=list)  # How to prepare
    
    is_active = models.BooleanField(default=True)
    last_validated = models.DateField(auto_now=True)
    
    class Meta:
        unique_together = ['metric_name', 'pattern_type']
        ordering = ['-seasonal_strength']
    
    def __str__(self):
        return f"{self.metric_name} - {self.pattern_type} Pattern (Strength: {self.seasonal_strength:.1f})"
