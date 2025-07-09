# analytics/management/commands/test_predictions.py
from django.core.management.base import BaseCommand
from analytics.prediction_engine import PredictionEngine
from analytics.models import SmartAlert
import json

class Command(BaseCommand):
    help = 'Test the predictive analytics system'

    def handle(self, *args, **options):
        self.stdout.write('🔮 Testing Predictive Analytics System...')
        
        # Initialize prediction engine
        engine = PredictionEngine()
        
        try:
            # Test all predictions
            self.stdout.write('📊 Generating predictions...')
            results = engine.generate_all_predictions(days_ahead=30)
            
            if 'error' in results:
                self.stdout.write(
                    self.style.ERROR(f'❌ Prediction failed: {results["error"]}')
                )
                return
            
            # Display results
            self.stdout.write(
                self.style.SUCCESS('✅ Predictions generated successfully!')
            )
            
            # Animal intake predictions
            if 'animal_intake' in results and isinstance(results['animal_intake'], dict):
                intake_data = results['animal_intake']
                if 'predictions' in intake_data:
                    avg_intake = sum(p['predicted_intake'] for p in intake_data['predictions'][:7]) / 7
                    self.stdout.write(f'🐕 Average daily intake (next 7 days): {avg_intake:.1f} animals')
                    self.stdout.write(f'🎯 Model accuracy: {intake_data.get("model_accuracy", "N/A")}%')
            
            # Donation predictions
            if 'donations' in results and isinstance(results['donations'], dict):
                donation_data = results['donations']
                if 'predictions' in donation_data:
                    total_predicted = sum(p['predicted_amount'] for p in donation_data['predictions'][:7])
                    self.stdout.write(f'💰 Predicted donations (next 7 days): ${total_predicted:.2f}')
            
            # Capacity predictions
            if 'capacity' in results and isinstance(results['capacity'], dict):
                capacity_data = results['capacity']
                if 'capacity_alerts' in capacity_data:
                    alert_count = len(capacity_data['capacity_alerts'])
                    self.stdout.write(f'🏠 Capacity alerts: {alert_count}')
            
            # Smart alerts
            if 'alerts' in results:
                alert_count = len(results['alerts'])
                self.stdout.write(f'🚨 Smart alerts generated: {alert_count}')
                
                for alert in results['alerts'][:3]:  # Show first 3 alerts
                    self.stdout.write(f'   • {alert.get("title", "Alert")}: {alert.get("message", "")[:100]}...')
            
            # Test individual prediction types
            self.stdout.write('\n🧪 Testing individual prediction components...')
            
            # Test animal intake prediction
            try:
                intake_test = engine.predict_animal_intake(7)
                if isinstance(intake_test, dict) and 'predictions' in intake_test:
                    self.stdout.write('✅ Animal intake prediction: Working')
                else:
                    self.stdout.write('⚠️ Animal intake prediction: Limited data')
            except Exception as e:
                self.stdout.write(f'❌ Animal intake prediction: {str(e)}')
            
            # Test donation prediction
            try:
                donation_test = engine.predict_donation_trends(7)
                if isinstance(donation_test, dict) and 'predictions' in donation_test:
                    self.stdout.write('✅ Donation prediction: Working')
                else:
                    self.stdout.write('⚠️ Donation prediction: Limited data')
            except Exception as e:
                self.stdout.write(f'❌ Donation prediction: {str(e)}')
            
            # Test capacity planning
            try:
                capacity_test = engine.predict_shelter_capacity(7)
                if isinstance(capacity_test, dict) and 'predictions' in capacity_test:
                    self.stdout.write('✅ Capacity planning: Working')
                else:
                    self.stdout.write('⚠️ Capacity planning: Limited data')
            except Exception as e:
                self.stdout.write(f'❌ Capacity planning: {str(e)}')
            
            self.stdout.write(
                self.style.SUCCESS('\n🎉 Predictive Analytics System Test Complete!')
            )
            self.stdout.write('💡 Visit /predictive-dashboard to see the AI predictions in action!')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ System test failed: {str(e)}')
            )
            self.stdout.write('💡 This is likely due to insufficient historical data.')
            self.stdout.write('   Try running with more sample data or check the logs for details.')