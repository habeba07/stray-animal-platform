# Generated by Django 4.2.21 on 2025-06-04 20:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('resources', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InteractiveLearningModule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('module_type', models.CharField(choices=[('QUIZ', 'Interactive Quiz'), ('VIDEO', 'Interactive Video'), ('CHECKLIST', 'Interactive Checklist'), ('SIMULATION', 'Virtual Simulation'), ('PROGRESS_TRACKER', 'Progress Tracker')], max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('content_data', models.JSONField(default=dict, help_text='Interactive content structure')),
                ('requires_completion', models.BooleanField(default=False)),
                ('passing_score', models.IntegerField(default=70, help_text='Minimum score to pass (for quizzes)')),
                ('estimated_duration', models.IntegerField(default=10, help_text='Estimated minutes to complete')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resource', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='interactive_module', to='resources.educationalresource')),
            ],
        ),
        migrations.CreateModel(
            name='LearningProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('NOT_STARTED', 'Not Started'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('PASSED', 'Passed'), ('FAILED', 'Failed')], default='NOT_STARTED', max_length=20)),
                ('completion_percentage', models.IntegerField(default=0)),
                ('current_step', models.IntegerField(default=0)),
                ('latest_score', models.IntegerField(blank=True, help_text='Latest quiz score percentage', null=True)),
                ('best_score', models.IntegerField(blank=True, help_text='Best quiz score achieved', null=True)),
                ('attempts_count', models.IntegerField(default=0)),
                ('progress_data', models.JSONField(default=dict)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('last_accessed', models.DateTimeField(auto_now=True)),
                ('total_time_spent', models.IntegerField(default=0, help_text='Total minutes spent')),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='resources.interactivelearningmodule')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'module')},
            },
        ),
        migrations.CreateModel(
            name='UserQuizAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score_percentage', models.IntegerField()),
                ('correct_answers', models.IntegerField()),
                ('total_questions', models.IntegerField()),
                ('answers_data', models.JSONField(default=dict, help_text="User's answers to each question")),
                ('started_at', models.DateTimeField()),
                ('completed_at', models.DateTimeField()),
                ('time_spent_minutes', models.IntegerField()),
                ('progress', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quiz_attempts', to='resources.learningprogress')),
            ],
        ),
        migrations.CreateModel(
            name='QuizQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_text', models.TextField()),
                ('question_type', models.CharField(choices=[('MULTIPLE_CHOICE', 'Multiple Choice'), ('TRUE_FALSE', 'True/False'), ('FILL_BLANK', 'Fill in the Blank'), ('MATCHING', 'Matching')], max_length=20)),
                ('order', models.IntegerField(default=0)),
                ('question_data', models.JSONField(default=dict)),
                ('explanation', models.TextField(blank=True, help_text='Explanation shown after answering')),
                ('points', models.IntegerField(default=1)),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quiz_questions', to='resources.interactivelearningmodule')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
    ]
