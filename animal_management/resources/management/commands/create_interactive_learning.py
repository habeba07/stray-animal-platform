# Create this file: resources/management/commands/create_interactive_learning.py

from django.core.management.base import BaseCommand
from resources.models import (
    ResourceCategory, EducationalResource, 
    InteractiveLearningModule, QuizQuestion
)

class Command(BaseCommand):
    help = 'Create sample interactive learning content'

    def handle(self, *args, **options):
        self.stdout.write('🎓 Creating interactive learning content...')
        
        # Create a category if it doesn't exist
        category, created = ResourceCategory.objects.get_or_create(
            slug='pet-care-basics',
            defaults={
                'name': 'Pet Care Basics',
                'description': 'Essential knowledge for new pet owners',
                'icon': 'pets'
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created category: {category.name}')
        
        # Create an educational resource
        resource, created = EducationalResource.objects.get_or_create(
            slug='puppy-training-basics',
            defaults={
                'title': 'Puppy Training Basics',
                'category': category,
                'resource_type': 'GUIDE',
                'summary': 'Learn the fundamentals of puppy training with our interactive guide.',
                'content': '''
# Puppy Training Basics

Welcome to our comprehensive puppy training guide! This interactive course will teach you:

## Module 1: House Training
- Understanding your puppy's schedule
- Setting up a routine
- Dealing with accidents

## Module 2: Basic Commands
- Sit, Stay, Come
- Positive reinforcement techniques
- Timing and consistency

## Module 3: Socialization
- Safe introduction to new experiences
- Meeting other dogs and people
- Building confidence

Complete the quiz at the end to test your knowledge!
                ''',
                'is_published': True
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created resource: {resource.title}')
        
        # Create interactive learning module
        module, created = InteractiveLearningModule.objects.get_or_create(
            resource=resource,
            defaults={
                'module_type': 'QUIZ',
                'is_active': True,
                'requires_completion': True,
                'passing_score': 80,
                'estimated_duration': 15,
                'content_data': {
                    'instructions': 'Complete this quiz to test your puppy training knowledge!',
                    'show_results_immediately': True,
                    'allow_retakes': True
                }
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created interactive module: {module.module_type}')
            
            # Create quiz questions
            questions_data = [
                {
                    'question_text': 'How often should you take a young puppy outside for potty breaks?',
                    'question_type': 'MULTIPLE_CHOICE',
                    'order': 1,
                    'question_data': {
                        'options': [
                            'Every 4-6 hours',
                            'Every 1-2 hours', 
                            'Only when they whine',
                            'Once in the morning and evening'
                        ],
                        'correct': 1
                    },
                    'explanation': 'Young puppies have small bladders and need frequent potty breaks, typically every 1-2 hours.',
                    'points': 10
                },
                {
                    'question_text': 'Positive reinforcement means rewarding good behavior immediately.',
                    'question_type': 'TRUE_FALSE',
                    'order': 2,
                    'question_data': {
                        'correct': True
                    },
                    'explanation': 'Yes! Immediate rewards help puppies understand which behaviors are desired.',
                    'points': 10
                },
                {
                    'question_text': 'What is the most important factor in puppy training?',
                    'question_type': 'MULTIPLE_CHOICE',
                    'order': 3,
                    'question_data': {
                        'options': [
                            'Expensive training equipment',
                            'Consistency and patience',
                            'Loud voice commands',
                            'Training only on weekends'
                        ],
                        'correct': 1
                    },
                    'explanation': 'Consistency and patience are key to successful puppy training. Regular, gentle practice works best.',
                    'points': 10
                },
                {
                    'question_text': 'When should you start socializing your puppy?',
                    'question_type': 'MULTIPLE_CHOICE',
                    'order': 4,
                    'question_data': {
                        'options': [
                            'After 6 months old',
                            'Between 3-14 weeks old',
                            'Only after all vaccinations are complete',
                            'When they are 1 year old'
                        ],
                        'correct': 1
                    },
                    'explanation': 'The critical socialization period is 3-14 weeks. Controlled socialization can begin even before all vaccines are complete.',
                    'points': 10
                },
                {
                    'question_text': 'If your puppy has an accident inside, you should rub their nose in it to teach them.',
                    'question_type': 'TRUE_FALSE',
                    'order': 5,
                    'question_data': {
                        'correct': False
                    },
                    'explanation': 'Never punish accidents! Simply clean up and increase supervision. Punishment can make training harder.',
                    'points': 10
                }
            ]
            
            for question_data in questions_data:
                question, created = QuizQuestion.objects.get_or_create(
                    module=module,
                    order=question_data['order'],
                    defaults=question_data
                )
                if created:
                    self.stdout.write(f'  ✅ Created question {question.order}')
        
        # Create another resource with different module type
        resource2, created = EducationalResource.objects.get_or_create(
            slug='dog-nutrition-checklist',
            defaults={
                'title': 'Dog Nutrition Checklist',
                'category': category,
                'resource_type': 'CHECKLIST',
                'summary': 'Interactive checklist to ensure your dog gets proper nutrition.',
                'content': '''
# Dog Nutrition Checklist

Use this interactive checklist to make sure you're providing the best nutrition for your dog.

Follow along and check off each item as you review your current feeding routine.
                ''',
                'is_published': True
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created resource: {resource2.title}')
            
            # Create checklist module
            module2, created = InteractiveLearningModule.objects.get_or_create(
                resource=resource2,
                defaults={
                    'module_type': 'CHECKLIST',
                    'is_active': True,
                    'requires_completion': False,
                    'estimated_duration': 10,
                    'content_data': {
                        'checklist_items': [
                            {
                                'id': 1,
                                'text': 'Choose age-appropriate food (puppy, adult, senior)',
                                'description': 'Different life stages have different nutritional needs'
                            },
                            {
                                'id': 2,
                                'text': 'Check food quality and ingredients',
                                'description': 'Look for high-quality protein as the first ingredient'
                            },
                            {
                                'id': 3,
                                'text': 'Measure portions according to dog size and activity level',
                                'description': 'Overfeeding is a common cause of obesity in pets'
                            },
                            {
                                'id': 4,
                                'text': 'Provide fresh water daily',
                                'description': 'Clean water should always be available'
                            },
                            {
                                'id': 5,
                                'text': 'Avoid toxic foods (chocolate, grapes, onions, etc.)',
                                'description': 'Many human foods are dangerous for dogs'
                            },
                            {
                                'id': 6,
                                'text': 'Consider dietary supplements if recommended by vet',
                                'description': 'Some dogs benefit from additional vitamins or joint support'
                            }
                        ]
                    }
                }
            )
            if created:
                self.stdout.write(f'✅ Created interactive checklist module')
        
        self.stdout.write(
            self.style.SUCCESS('🎉 Interactive learning content created successfully!')
        )
        self.stdout.write('📚 You can now test the interactive features!')
        self.stdout.write('🔗 Visit: /api/resources/resources/ to see the enhanced resources')
