from django.contrib import admin
from .models import PredictionModel, Prediction, SmartAlert, TrendAnalysis

@admin.register(PredictionModel)
class PredictionModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'prediction_type', 'is_active', 'accuracy_score', 'last_trained']
    list_filter = ['prediction_type', 'is_active']

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ['model', 'target_date', 'predicted_value', 'confidence_level', 'is_validated']
    list_filter = ['confidence_level', 'is_validated']

@admin.register(SmartAlert)
class SmartAlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'priority', 'is_active', 'is_acknowledged', 'created_at']
    list_filter = ['alert_type', 'priority', 'is_active', 'is_acknowledged']

@admin.register(TrendAnalysis)
class TrendAnalysisAdmin(admin.ModelAdmin):
    list_display = ['trend_type', 'trend_direction', 'analysis_period_start', 'analysis_period_end']
    list_filter = ['trend_type', 'trend_direction']
