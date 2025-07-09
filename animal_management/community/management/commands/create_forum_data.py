# community/management/commands/create_forum_data.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from community.models import ForumCategory, ForumTopic, ForumPost, KnowledgeArticle

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample forum and knowledge base data'

    def handle(self, *args, **options):
        self.stdout.write('🗣️ Creating sample forum data...')
        
        # Create forum categories
        categories_data = [
            {
                'name': 'Pet Care Basics',
                'description': 'General questions about pet care, feeding, and health',
                'icon': 'pets',
                'order': 1
            },
            {
                'name': 'Adoption Stories',
                'description': 'Share your adoption experiences and success stories',
                'icon': 'favorite',
                'order': 2
            },
            {
                'name': 'Training & Behavior',
                'description': 'Tips and questions about animal training and behavior',
                'icon': 'school',
                'order': 3
            },
            {
                'name': 'Health & Veterinary',
                'description': 'Health-related questions and veterinary advice',
                'icon': 'local_hospital',
                'order': 4
            },
            {
                'name': 'General Discussion',
                'description': 'General discussion about animal welfare and community',
                'icon': 'forum',
                'order': 5
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = ForumCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'✅ Created category: {category.name}')
            else:
                self.stdout.write(f'ℹ️ Category exists: {category.name}')
            categories.append(category)
        
        # Get or create sample users for forum posts
        sample_users = []
        for i in range(1, 4):  # Create 3 sample users
            user, created = User.objects.get_or_create(
                username=f'forum_user{i}',
                defaults={
                    'email': f'forum_user{i}@example.com',
                    'user_type': 'PUBLIC'
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'✅ Created forum user: {user.username}')
            sample_users.append(user)
        
        # Create sample forum topics and posts
        topics_data = [
            {
                'category': categories[0],  # Pet Care Basics
                'title': 'What should I feed my new rescue dog?',
                'author': sample_users[0],
                'posts': [
                    'I just adopted a 2-year-old mixed breed dog from the shelter. What kind of food should I give him? Any recommendations for high-quality dog food brands?',
                    'Congratulations on your adoption! I recommend starting with what the shelter was feeding him to avoid upset stomach, then gradually transitioning to a high-quality kibble. Look for brands with real meat as the first ingredient.'
                ]
            },
            {
                'category': categories[1],  # Adoption Stories
                'title': 'My amazing adoption story - Luna the cat',
                'author': sample_users[1],
                'posts': [
                    'I wanted to share my wonderful adoption story! I adopted Luna, a shy 3-year-old cat, 6 months ago. She was so scared at first, but now she\'s the most loving companion. Patient love really works!',
                    'That\'s such a heartwarming story! Thank you for giving Luna a second chance. It\'s amazing how much love and patience can transform a scared animal.'
                ]
            },
            {
                'category': categories[2],  # Training & Behavior
                'title': 'Help with puppy house training?',
                'author': sample_users[2],
                'posts': [
                    'I have a 4-month-old puppy who is struggling with house training. Any tips or advice? How long does it usually take?',
                    'House training takes patience! Set a consistent schedule, take them out every 2 hours, immediately after meals, and first thing in the morning. Reward with treats when they go outside. Most puppies get it within 4-6 months.'
                ]
            }
        ]
        
        for topic_data in topics_data:
            # Create topic
            topic, created = ForumTopic.objects.get_or_create(
                title=topic_data['title'],
                category=topic_data['category'],
                defaults={'created_by': topic_data['author']}
            )
            
            if created:
                self.stdout.write(f'✅ Created topic: {topic.title}')
                
                # Create posts for this topic
                for i, post_content in enumerate(topic_data['posts']):
                    author = topic_data['author'] if i == 0 else sample_users[(i-1) % len(sample_users)]
                    
                    ForumPost.objects.get_or_create(
                        topic=topic,
                        author=author,
                        defaults={'content': post_content}
                    )
                
                self.stdout.write(f'  ➡️ Created {len(topic_data["posts"])} posts')
            else:
                self.stdout.write(f'ℹ️ Topic exists: {topic.title}')
        
        # Create sample knowledge articles
        articles_data = [
            {
                'title': 'First-Time Pet Owner Checklist',
                'article_type': 'GUIDE',
                'summary': 'Everything you need to know before adopting your first pet',
                'content': '''
# First-Time Pet Owner Checklist

Adopting your first pet is exciting, but preparation is key to success!

## Before You Adopt
- Research different breeds and their needs
- Pet-proof your home
- Budget for ongoing costs (food, vet bills, supplies)
- Choose a local veterinarian

## Essential Supplies
- Quality food and water bowls
- Appropriate food for your pet's age and size
- Collar, leash, and ID tags
- Comfortable bed or crate
- Toys for mental stimulation
- Grooming supplies

## First Week Tips
- Give your pet time to adjust
- Establish routines early
- Schedule a vet checkup
- Start basic training
- Be patient - adjustment takes time!

Remember: Every pet is different, so be flexible and patient as you both learn together.
''',
                'tags': ['beginners', 'checklist', 'adoption', 'preparation'],
                'author': sample_users[0]
            },
            {
                'title': 'Understanding Pet Body Language',
                'article_type': 'TIPS',
                'summary': 'Learn to read your pet\'s emotions and signals',
                'content': '''
# Understanding Pet Body Language

Learning to read your pet's body language helps build trust and prevents problems.

## Dog Body Language
**Happy/Relaxed:**
- Loose, wiggly body
- Soft eyes
- Tail wagging at medium height

**Stressed/Anxious:**
- Panting when not hot
- Pacing or restlessness
- Tucked tail
- Avoiding eye contact

## Cat Body Language
**Content:**
- Slow blinking
- Purring
- Relaxed posture

**Upset:**
- Flattened ears
- Dilated pupils
- Arched back
- Hissing or growling

## When to Give Space
If your pet shows stress signals, give them space and time to calm down. Never force interactions when they're uncomfortable.
''',
                'tags': ['behavior', 'communication', 'training', 'body language'],
                'author': sample_users[1]
            }
        ]
        
        for article_data in articles_data:
            article, created = KnowledgeArticle.objects.get_or_create(
                title=article_data['title'],
                defaults=article_data
            )
            
            if created:
                self.stdout.write(f'✅ Created article: {article.title}')
            else:
                self.stdout.write(f'ℹ️ Article exists: {article.title}')
        
        # Final counts
        total_categories = ForumCategory.objects.count()
        total_topics = ForumTopic.objects.count()
        total_posts = ForumPost.objects.count()
        total_articles = KnowledgeArticle.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'🎉 Forum data created successfully!\n'
                f'📁 Categories: {total_categories}\n'
                f'💬 Topics: {total_topics}\n'
                f'📝 Posts: {total_posts}\n'
                f'📚 Knowledge Articles: {total_articles}\n'
                f'🗣️ Community features ready!'
            )
        )
