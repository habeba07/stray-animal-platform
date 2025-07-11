# Generated by Django 4.2.21 on 2025-05-27 17:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prediction_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('target_date', models.DateTimeField()),
                ('predicted_value', models.FloatField()),
                ('actual_value', models.FloatField(blank=True, null=True)),
                ('confidence_level', models.CharField(choices=[('LOW', 'Low Confidence (60-70%)'), ('MEDIUM', 'Medium Confidence (70-85%)'), ('HIGH', 'High Confidence (85-95%)'), ('VERY_HIGH', 'Very High Confidence (95%+)')], max_length=10)),
                ('confidence_score', models.FloatField()),
                ('prediction_context', models.JSONField(default=dict)),
                ('seasonal_factors', models.JSONField(default=dict)),
                ('prediction_error', models.FloatField(blank=True, null=True)),
                ('is_validated', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-target_date'],
            },
        ),
        migrations.CreateModel(
            name='PredictionModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('prediction_type', models.CharField(choices=[('ANIMAL_INTAKE', 'Animal Intake Forecasting'), ('DONATION_TRENDS', 'Donation Trend Prediction'), ('CAPACITY_PLANNING', 'Shelter Capacity Planning'), ('RESOURCE_DEMAND', 'Resource Demand Forecasting'), ('SEASONAL_PATTERNS', 'Seasonal Pattern Analysis'), ('ADOPTION_RATES', 'Adoption Rate Prediction')], max_length=20)),
                ('description', models.TextField()),
                ('is_active', models.BooleanField(default=True)),
                ('accuracy_score', models.FloatField(blank=True, null=True)),
                ('last_trained', models.DateTimeField(blank=True, null=True)),
                ('training_data_points', models.IntegerField(default=0)),
                ('model_parameters', models.JSONField(default=dict)),
                ('feature_importance', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TrendAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('trend_type', models.CharField(choices=[('ANIMAL_INTAKE', 'Animal Intake Trends'), ('DONATIONS', 'Donation Trends'), ('ADOPTIONS', 'Adoption Trends'), ('CAPACITY', 'Shelter Capacity Trends'), ('VOLUNTEER_ENGAGEMENT', 'Volunteer Engagement')], max_length=30)),
                ('analysis_period_start', models.DateField()),
                ('analysis_period_end', models.DateField()),
                ('trend_direction', models.CharField(choices=[('UPWARD', 'Increasing Trend'), ('DOWNWARD', 'Decreasing Trend'), ('STABLE', 'Stable/Flat'), ('SEASONAL', 'Seasonal Pattern'), ('VOLATILE', 'High Volatility')], max_length=15)),
                ('trend_strength', models.FloatField()),
                ('growth_rate', models.FloatField()),
                ('seasonality_detected', models.BooleanField(default=False)),
                ('correlation_coefficient', models.FloatField(blank=True, null=True)),
                ('r_squared', models.FloatField(blank=True, null=True)),
                ('volatility_index', models.FloatField(blank=True, null=True)),
                ('key_insights', models.JSONField(default=list)),
                ('seasonal_patterns', models.JSONField(default=dict)),
                ('anomalies_detected', models.JSONField(default=list)),
                ('recommendations', models.JSONField(default=list)),
                ('risk_factors', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Trend Analyses',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='SmartAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alert_type', models.CharField(choices=[('CAPACITY_WARNING', 'Capacity Warning'), ('DONATION_OPPORTUNITY', 'Donation Opportunity'), ('RESOURCE_SHORTAGE', 'Resource Shortage Prediction'), ('SEASONAL_PREPARATION', 'Seasonal Preparation'), ('TREND_ANOMALY', 'Trend Anomaly Detected'), ('OPTIMIZATION_SUGGESTION', 'Process Optimization')], max_length=25)),
                ('priority', models.CharField(choices=[('LOW', 'Low Priority'), ('MEDIUM', 'Medium Priority'), ('HIGH', 'High Priority'), ('CRITICAL', 'Critical Action Required')], max_length=10)),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('supporting_data', models.JSONField(default=dict)),
                ('recommended_actions', models.JSONField(default=list)),
                ('estimated_impact', models.TextField(blank=True)),
                ('deadline_date', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_acknowledged', models.BooleanField(default=False)),
                ('acknowledged_at', models.DateTimeField(blank=True, null=True)),
                ('action_taken', models.TextField(blank=True)),
                ('outcome_notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('acknowledged_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('related_prediction', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='analytics.prediction')),
                ('related_trend', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='analytics.trendanalysis')),
            ],
            options={
                'ordering': ['-priority', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='SeasonalPattern',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('metric_name', models.CharField(max_length=100)),
                ('pattern_type', models.CharField(choices=[('MONTHLY', 'Monthly Pattern'), ('QUARTERLY', 'Quarterly Pattern'), ('ANNUAL', 'Annual Pattern'), ('WEEKLY', 'Weekly Pattern')], max_length=15)),
                ('pattern_data', models.JSONField()),
                ('peak_periods', models.JSONField(default=list)),
                ('low_periods', models.JSONField(default=list)),
                ('seasonal_strength', models.FloatField()),
                ('pattern_reliability', models.FloatField()),
                ('discovered_date', models.DateField(auto_now_add=True)),
                ('data_points_used', models.IntegerField()),
                ('years_of_data', models.FloatField()),
                ('business_explanations', models.JSONField(default=list)),
                ('recommended_preparations', models.JSONField(default=list)),
                ('is_active', models.BooleanField(default=True)),
                ('last_validated', models.DateField(auto_now=True)),
            ],
            options={
                'ordering': ['-seasonal_strength'],
                'unique_together': {('metric_name', 'pattern_type')},
            },
        ),
        migrations.AddField(
            model_name='prediction',
            name='model',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='predictions', to='analytics.predictionmodel'),
        ),
        migrations.CreateModel(
            name='ForecastAccuracy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('evaluation_date', models.DateField()),
                ('mean_absolute_error', models.FloatField()),
                ('root_mean_square_error', models.FloatField()),
                ('mean_absolute_percentage_error', models.FloatField()),
                ('accuracy_percentage', models.FloatField()),
                ('predictions_evaluated', models.IntegerField()),
                ('evaluation_period_days', models.IntegerField()),
                ('data_quality_score', models.FloatField()),
                ('best_performing_scenarios', models.JSONField(default=list)),
                ('worst_performing_scenarios', models.JSONField(default=list)),
                ('improvement_suggestions', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accuracy_history', to='analytics.predictionmodel')),
            ],
            options={
                'ordering': ['-evaluation_date'],
                'unique_together': {('model', 'evaluation_date')},
            },
        ),
    ]
