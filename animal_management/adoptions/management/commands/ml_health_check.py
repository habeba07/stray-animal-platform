# adoptions/management/commands/ml_health_check.py
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Run ML system health check'
    
    def handle(self, *args, **options):
        from adoptions.monitoring import ml_monitor
        
        self.stdout.write('🏥 Running ML System Health Check...')
        
        health_report = ml_monitor.run_full_health_check()
        
        self.stdout.write(f'\n📊 Health Report:')
        self.stdout.write(f'  Overall Health: {health_report["overall_health"].upper()}')
        
        # Model files
        self.stdout.write(f'\n📁 Model Files:')
        for file_name, status in health_report['model_files'].items():
            icon = '✅' if status == 'OK' else '❌'
            self.stdout.write(f'    {icon} {file_name}: {status}')
        
        # System performance
        perf = health_report['system_performance']
        self.stdout.write(f'\n⚡ System Performance:')
        self.stdout.write(f'    Status: {perf["status"]}')
        self.stdout.write(f'    Response Time: {perf["response_time_ms"]}ms')
        self.stdout.write(f'    Production Ready: {perf["ready_for_production"]}')
        
        # Prediction pipeline
        pipeline = health_report['prediction_pipeline']
        self.stdout.write(f'\n🎯 Prediction Pipeline:')
        self.stdout.write(f'    Status: {pipeline["status"]}')
        if pipeline.get('prediction_time_ms'):
            self.stdout.write(f'    Prediction Time: {pipeline["prediction_time_ms"]}ms')
        
        if health_report['overall_health'] == 'healthy':
            self.stdout.write('\n🎉 ML system is healthy and production-ready!')
        else:
            self.stdout.write('\n⚠️  ML system has health issues that need attention.')
