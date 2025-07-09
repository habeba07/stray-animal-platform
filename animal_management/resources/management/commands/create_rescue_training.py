"""
Django management command to create comprehensive rescue training modules
Based on real emergency animal response training from ASPCA, FEMA, American Humane, etc.

Run with: python manage.py create_rescue_training
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from resources.models import (
    ResourceCategory, EducationalResource, InteractiveLearningModule, QuizQuestion
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Create rescue training modules with interactive quizzes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating rescue training modules...'))

        # Get or create admin user for authoring
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='training_admin',
                email='admin@example.com',
                password='admin123'
            )

        # Create/get training category
        training_category, created = ResourceCategory.objects.get_or_create(
            slug='rescue-training',
            defaults={
                'name': 'Emergency Rescue Training',
                'description': 'Professional training modules for animal rescue operations',
                'icon': 'school',
                'order': 1
            }
        )

        # Training modules data based on real rescue training programs
        training_modules = [
            {
                'title': 'Animal Rescue Fundamentals',
                'slug': 'animal-rescue-fundamentals',
                'summary': 'Essential skills for safe animal rescue operations including approach techniques, safety protocols, and basic animal behavior.',
                'content': '''
# Animal Rescue Fundamentals

## Course Overview
This foundational course teaches essential skills for safe and effective animal rescue operations. Based on protocols from ASPCA, American Humane, and FEMA emergency response guidelines.

## Learning Objectives
- Understand animal behavior under stress
- Learn safe approach techniques for unknown animals
- Master basic rescue safety protocols
- Identify signs of injury or distress
- Use proper equipment and protective gear

## Module 1: Animal Behavior Under Stress
Animals in emergency situations exhibit different behaviors:
- **Fight Response**: Aggressive, biting, scratching
- **Flight Response**: Hiding, running, panic
- **Freeze Response**: Paralysis, shock, unresponsive
- **Faint Response**: Collapse, loss of consciousness

## Module 2: Safe Approach Techniques
### Before Approaching:
1. Assess the situation for human safety first
2. Look for escape routes
3. Check for visible injuries
4. Observe body language and stress signals

### Approaching Unknown Animals:
- Move slowly and speak in calm, low tones
- Avoid direct eye contact initially
- Let the animal see and smell you
- Never corner an animal
- Use barriers for protection when needed

## Module 3: Basic Safety Equipment
Essential gear for rescue operations:
- Protective gloves (bite-resistant)
- Catch poles and slip leads
- Transport carriers/crates
- First aid supplies
- Blankets and towels
- Animal restraint equipment

## Module 4: Emergency Assessment
Quickly assess:
- **Immediate Dangers**: Traffic, fire, hazards
- **Animal Condition**: Injured, sick, healthy
- **Behavior Level**: Calm, scared, aggressive
- **Species/Size**: Determines approach method
                ''',
                'estimated_duration': 45,
                'quiz_questions': [
                    {
                        'question': 'What should be your FIRST priority when approaching an animal rescue situation?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Catching the animal quickly', 'Human safety assessment', 'Taking photos for documentation', 'Calling for backup'],
                        'correct': 1,
                        'explanation': 'Human safety must always be the first priority. You cannot help animals if you become injured.'
                    },
                    {
                        'question': 'Which animal stress response involves hiding or running away?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Fight response', 'Flight response', 'Freeze response', 'Faint response'],
                        'correct': 1,
                        'explanation': 'Flight response is when animals try to escape or hide from perceived threats.'
                    },
                    {
                        'question': 'You should make direct eye contact with a scared animal to show you\'re not a threat.',
                        'type': 'TRUE_FALSE',
                        'correct': False,
                        'explanation': 'Direct eye contact can be perceived as threatening. Avoid initial eye contact and let the animal observe you first.'
                    },
                    {
                        'question': 'What protective equipment is most essential for animal rescue?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Camera for documentation', 'Bite-resistant gloves', 'Smartphone for GPS', 'Water and food'],
                        'correct': 1,
                        'explanation': 'Bite-resistant gloves protect against bites and scratches, which are common injury sources in animal rescue.'
                    }
                ]
            },
            {
                'title': 'Emergency Animal First Aid',
                'slug': 'emergency-animal-first-aid',
                'summary': 'Life-saving first aid techniques for injured animals including wound care, shock treatment, and stabilization for transport.',
                'content': '''
# Emergency Animal First Aid

## Course Overview
Learn critical first aid skills to stabilize injured animals during rescue operations. This course covers immediate care techniques that can save lives before veterinary treatment.

## Learning Objectives
- Recognize life-threatening emergencies
- Perform basic wound care and bleeding control
- Treat shock and respiratory distress
- Safely stabilize animals for transport
- Know when to call for veterinary assistance

## Module 1: Primary Assessment (ABC)
### A - Airway
- Check for obstructed breathing
- Remove visible debris from mouth
- Position head to open airway

### B - Breathing
- Normal: 12-30 breaths per minute (dogs), 20-40 (cats)
- Signs of distress: Gasping, blue gums, open-mouth breathing

### C - Circulation
- Check pulse and heart rate
- Assess gum color (should be pink)
- Look for signs of shock

## Module 2: Bleeding Control
### External Bleeding:
1. Apply direct pressure with clean cloth
2. Do not remove embedded objects
3. Elevate injured limb if possible
4. Use pressure points if direct pressure fails

### Internal Bleeding Signs:
- Pale gums
- Weakness
- Rapid heart rate
- Cold extremities

## Module 3: Shock Treatment
### Signs of Shock:
- Rapid, weak pulse
- Pale or white gums
- Cool extremities
- Rapid breathing
- Weakness or collapse

### Treatment:
1. Keep animal warm (not hot)
2. Elevate hindquarters slightly
3. Minimize movement
4. Transport immediately to veterinary care

## Module 4: Common Emergency Scenarios
### Fractures:
- Do not attempt to set bones
- Stabilize with makeshift splints if needed
- Support the animal during transport

### Burns:
- Cool with lukewarm water (not ice)
- Cover with clean, damp cloth
- Never use ointments or home remedies

### Hypothermia:
- Gradual warming with blankets
- Avoid direct heat sources
- Check for frostbite on extremities

## Module 5: Transport Preparation
- Secure airway and breathing
- Control bleeding
- Stabilize fractures
- Keep animal calm and warm
- Contact receiving veterinary facility
                ''',
                'estimated_duration': 60,
                'quiz_questions': [
                    {
                        'question': 'What does the "A" in ABC assessment stand for?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Assessment', 'Airway', 'Animal', 'Alert'],
                        'correct': 1,
                        'explanation': 'ABC stands for Airway, Breathing, Circulation - the primary assessment priorities.'
                    },
                    {
                        'question': 'For external bleeding, what is the first step?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Call veterinarian', 'Apply direct pressure', 'Clean the wound', 'Give pain medication'],
                        'correct': 1,
                        'explanation': 'Direct pressure with clean cloth is the immediate first step to control bleeding.'
                    },
                    {
                        'question': 'Pale or white gums can indicate shock in an animal.',
                        'type': 'TRUE_FALSE',
                        'correct': True,
                        'explanation': 'Pale or white gums indicate poor circulation and are a key sign of shock.'
                    },
                    {
                        'question': 'What should you do if you find an embedded object in a wound?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Remove it immediately', 'Leave it in place', 'Push it deeper', 'Cut around it'],
                        'correct': 1,
                        'explanation': 'Never remove embedded objects as they may be preventing further bleeding. Stabilize and transport.'
                    }
                ]
            },
            {
                'title': 'Large Animal Rescue Operations',
                'slug': 'large-animal-rescue',
                'summary': 'Specialized techniques for rescuing horses, livestock, and other large animals including equipment use and safety protocols.',
                'content': '''
# Large Animal Rescue Operations

## Course Overview
Specialized training for rescuing horses, livestock, and other large animals. Learn unique challenges, specialized equipment, and safety protocols for large animal emergencies.

## Learning Objectives
- Understand large animal behavior and psychology
- Use specialized rescue equipment safely
- Execute team-based rescue operations
- Manage crowd control and scene safety
- Coordinate with emergency services

## Module 1: Large Animal Behavior
### Prey Animal Instincts:
- Flight response is primary
- Panic can lead to dangerous behavior
- Herd mentality affects individual animals
- Environmental awareness is heightened

### Species-Specific Considerations:
**Horses:**
- Can strike with front hooves
- Kick with powerful hindquarters
- May rear when panicked
- Strong flight instinct

**Cattle:**
- Herd animals, may rush together
- Bulls are particularly dangerous
- Can charge when threatened
- Heavy animals (500-2000+ lbs)

## Module 2: Specialized Equipment
### Rescue Equipment:
- Heavy-duty halters and lead ropes
- Large animal slings and harnesses
- Winches and pulley systems
- Mechanical lifting devices
- Portable ramps and bridges

### Safety Equipment:
- Hard hats and safety vests
- Steel-toed boots
- Cut-resistant gloves
- Eye protection
- Communication devices

## Module 3: Common Large Animal Emergencies
### Trailer Accidents:
- Assess structural damage first
- Secure scene for human safety
- Create escape routes for animals
- Use calm, experienced handlers

### Water Rescue:
- Hypothermia risk is high
- Swift water requires specialized training
- Flotation devices for animals
- Mechanical assistance usually needed

### Entrapment Situations:
- Mud, quicksand, or structures
- Often requires heavy machinery
- Veterinary sedation may be needed
- Long duration rescues require support

## Module 4: Team Coordination
### Roles and Responsibilities:
- **Incident Commander**: Overall coordination
- **Animal Handlers**: Direct animal contact
- **Equipment Operators**: Machinery and tools
- **Safety Officer**: Scene and personnel safety
- **Veterinary Support**: Medical decisions

### Communication Protocol:
- Clear chain of command
- Regular safety briefings
- Emergency stop procedures
- Progress updates to command

## Module 5: Scene Management
### Crowd Control:
- Establish safety perimeter
- Control media and spectators
- Manage other animals in area
- Coordinate with law enforcement

### Environmental Hazards:
- Traffic control
- Electrical lines
- Unstable surfaces
- Weather conditions
                ''',
                'estimated_duration': 75,
                'quiz_questions': [
                    {
                        'question': 'What is the primary instinct of prey animals like horses in emergency situations?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Fight response', 'Flight response', 'Freeze response', 'Feed response'],
                        'correct': 1,
                        'explanation': 'Horses and other prey animals have a strong flight response as their primary survival instinct.'
                    },
                    {
                        'question': 'Large animal rescue always requires specialized equipment.',
                        'type': 'TRUE_FALSE',
                        'correct': True,
                        'explanation': 'Due to size and weight (500-2000+ lbs), large animals require specialized equipment for safe rescue.'
                    },
                    {
                        'question': 'Who should be the Incident Commander in a large animal rescue?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['The animal owner', 'Most experienced animal handler', 'Emergency services personnel', 'Veterinarian'],
                        'correct': 2,
                        'explanation': 'Emergency services personnel should be Incident Commander for overall coordination and scene safety.'
                    },
                    {
                        'question': 'In water rescue situations for large animals, what is a major risk?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Dehydration', 'Hypothermia', 'Sunburn', 'Overeating'],
                        'correct': 1,
                        'explanation': 'Hypothermia is a major risk in water rescues due to large body mass losing heat rapidly in cold water.'
                    }
                ]
            },
            {
                'title': 'Animal Behavior & Psychology',
                'slug': 'animal-behavior-psychology',
                'summary': 'Understanding animal psychology, stress responses, and behavioral signs to improve rescue success and safety.',
                'content': '''
# Animal Behavior & Psychology in Rescue Situations

## Course Overview
Deep dive into animal psychology and behavior to improve rescue outcomes. Learn to read animal body language, understand stress responses, and use behavioral knowledge for safer, more effective rescues.

## Learning Objectives
- Interpret animal body language and stress signals
- Understand species-specific behaviors
- Apply behavioral principles to rescue techniques
- Recognize signs of trauma and abuse
- Use positive reinforcement in rescue situations

## Module 1: Stress Physiology in Animals
### Acute Stress Response:
- **Physiological Changes**: Increased heart rate, rapid breathing, muscle tension
- **Hormonal Response**: Adrenaline and cortisol release
- **Behavioral Changes**: Hypervigilance, aggression, or withdrawal
- **Recovery Time**: Can take hours to days to return to baseline

### Chronic Stress Indicators:
- Repetitive behaviors (pacing, excessive grooming)
- Appetite changes
- Sleep disturbances
- Immune system compromise
- Behavioral regression

## Module 2: Species-Specific Behavior
### Canine Behavior:
**Stress Signals:**
- Panting (when not hot)
- Trembling or shaking
- Excessive drooling
- Pacing or restlessness
- Destructive behavior

**Calming Signals:**
- Yawning
- Lip licking
- Turning head away
- Sitting or lying down
- Sniffing the ground

### Feline Behavior:
**Stress Signals:**
- Hiding
- Excessive vocalization
- Over-grooming or no grooming
- Inappropriate elimination
- Aggression or withdrawal

**Comfort Behaviors:**
- Slow blinking
- Head butting/rubbing
- Purring (sometimes stress-related)
- Kneading
- Playing

## Module 3: Reading Body Language
### Universal Warning Signs:
- **Ears**: Pinned back, flattened
- **Eyes**: Wide, showing whites, fixed stare
- **Body**: Tense, lowered, or enlarged posture
- **Tail**: Tucked, bristled, or thrashing
- **Vocalizations**: Growling, hissing, screaming

### Positive Indicators:
- **Relaxed Posture**: Natural stance, loose muscles
- **Soft Eyes**: Normal size, not fixed staring
- **Natural Ear Position**: Alert but not pinned
- **Tail**: Natural position for species
- **Exploratory Behavior**: Sniffing, investigating

## Module 4: Trauma and Abuse Recognition
### Physical Signs:
- Unexplained injuries
- Poor body condition
- Untreated medical conditions
- Fear of human contact
- Unusual scarring or wounds

### Behavioral Signs:
- Extreme fear or aggression
- Submission urination
- Flinching at movement
- Food guarding or gorging
- Inability to play or show curiosity

## Module 5: Behavioral Rescue Techniques
### Building Trust:
1. **Patience**: Allow animal to observe you
2. **Consistency**: Same handler when possible
3. **Positive Association**: Offer food, speak softly
4. **Respect Boundaries**: Don't force interaction
5. **Body Language**: Stay calm, move slowly

### De-escalation Techniques:
- Lower your body position
- Avoid direct eye contact initially
- Speak in soft, calm tones
- Use treats or food as positive distraction
- Give the animal space and choices

### Working with Fearful Animals:
- **Never corner**: Always provide escape route
- **Use barriers**: Blankets, shields for protection
- **Patience over speed**: Rushing increases stress
- **Multiple short sessions**: Better than one long attempt
- **Team approach**: One person handles, others support

## Module 6: Species-Specific Approaches
### Dogs:
- Use calm, confident energy
- Avoid sudden movements
- Offer side of hand to sniff
- Respect space initially
- Use food motivation carefully

### Cats:
- Let them hide initially
- Use slow, deliberate movements
- Avoid overhead reaching
- Use toys or feathers for positive interaction
- Respect their need for vertical space

### Exotic Animals:
- Research species-specific needs
- Minimize handling
- Use appropriate capture equipment
- Consider specialized veterinary needs
- Contact wildlife rehabilitators when appropriate
                ''',
                'estimated_duration': 50,
                'quiz_questions': [
                    {
                        'question': 'What is a universal warning sign in animal body language?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Slow blinking', 'Ears pinned back', 'Tail wagging', 'Relaxed posture'],
                        'correct': 1,
                        'explanation': 'Ears pinned back is a universal warning sign across many species indicating stress or potential aggression.'
                    },
                    {
                        'question': 'Panting in dogs always means they are hot.',
                        'type': 'TRUE_FALSE',
                        'correct': False,
                        'explanation': 'Dogs also pant when stressed, anxious, or in pain - not just when hot.'
                    },
                    {
                        'question': 'When approaching a fearful animal, you should:',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Move quickly to catch them', 'Make direct eye contact', 'Always provide an escape route', 'Use loud commands'],
                        'correct': 2,
                        'explanation': 'Never corner a fearful animal - always provide an escape route to reduce panic and defensive behavior.'
                    },
                    {
                        'question': 'Which is a sign of chronic stress in animals?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Single episode of panting', 'One-time hiding behavior', 'Repetitive pacing', 'Normal sleeping'],
                        'correct': 2,
                        'explanation': 'Repetitive behaviors like pacing indicate chronic stress and ongoing psychological distress.'
                    }
                ]
            },
            {
                'title': 'Emergency Scene Management',
                'slug': 'emergency-scene-management',
                'summary': 'Coordinating rescue operations, managing multiple teams, communication protocols, and incident command systems.',
                'content': '''
# Emergency Scene Management

## Course Overview
Learn to coordinate complex rescue operations involving multiple teams, agencies, and resources. Master incident command principles and communication protocols essential for large-scale animal emergencies.

## Learning Objectives
- Apply Incident Command System (ICS) principles
- Coordinate multiple rescue teams and agencies
- Manage resources and logistics effectively
- Establish clear communication protocols
- Handle media and public relations during emergencies

## Module 1: Incident Command System (ICS)
### ICS Structure:
- **Command**: Overall incident management
- **Operations**: Tactical response activities
- **Planning**: Resource tracking and situation analysis
- **Logistics**: Resource procurement and services
- **Finance/Administration**: Cost tracking and administrative needs

### Key Principles:
- Single command authority
- Manageable span of control (3-7 subordinates)
- Common terminology
- Unified command for multi-agency response
- Scalable organization structure

## Module 2: Scene Assessment and Safety
### Initial Scene Assessment:
1. **Situational Awareness**: What happened, when, where
2. **Hazard Identification**: Immediate threats to humans/animals
3. **Resource Needs**: Personnel, equipment, specialists required
4. **Access Points**: Entry/exit routes, staging areas
5. **Communication Setup**: Radio channels, command post location

### Safety Priorities:
- Human safety is paramount
- Scene perimeter establishment
- Hazard mitigation
- Personal protective equipment
- Emergency evacuation plans

## Module 3: Multi-Agency Coordination
### Common Partners:
- **Fire Department**: Technical rescue, hazmat
- **Police**: Traffic control, crowd management
- **EMS**: Human medical emergencies
- **Animal Control**: Legal authority, specialized equipment
- **Veterinarians**: Medical treatment, euthanasia decisions
- **Public Works**: Heavy equipment, utilities

### Coordination Challenges:
- Different protocols and procedures
- Radio compatibility issues
- Jurisdictional boundaries
- Resource allocation conflicts
- Command structure disagreements

## Module 4: Communication Protocols
### Radio Procedures:
- Clear, concise language
- Standard terminology
- Confirmation of critical information
- Regular status updates
- Emergency frequencies designated

### Chain of Command:
- All requests go through proper channels
- Direct communication with incident commander
- Regular briefings at predetermined intervals
- Documentation of all major decisions
- After-action reports required

## Module 5: Resource Management
### Personnel Management:
- Track all personnel on scene
- Assign specific roles and responsibilities
- Implement work/rest cycles
- Monitor for signs of fatigue or stress
- Maintain accountability systems

### Equipment and Supplies:
- Inventory management
- Equipment maintenance
- Supply chain coordination
- Cost tracking
- Return/recovery procedures

## Module 6: Media and Public Relations
### Media Management:
- Designate single spokesperson
- Establish media staging area
- Provide regular updates
- Control access to operation areas
- Protect animal welfare and privacy

### Public Information:
- Social media monitoring and response
- Community notification systems
- Volunteer coordination
- Donation management
- Public safety messages

## Module 7: Special Situations
### Multi-Day Operations:
- Shift changes and briefings
- Logistics support (food, lodging)
- Equipment rotation and maintenance
- Personnel fatigue management
- Family notification for responders

### High-Profile Incidents:
- Increased media attention
- Political considerations
- Social media impact
- Celebrity involvement
- Large-scale donations

### Weather-Related Challenges:
- Equipment protection
- Personnel safety
- Access route changes
- Extended operation duration
- Resource resupply difficulties

## Module 8: Documentation and Reporting
### Required Documentation:
- Personnel accountability
- Resource utilization
- Significant events timeline
- Costs and expenses
- Lessons learned

### Legal Considerations:
- Evidence preservation
- Photography protocols
- Witness statements
- Chain of custody
- Post-incident investigations
                ''',
                'estimated_duration': 65,
                'quiz_questions': [
                    {
                        'question': 'In the Incident Command System, what is the top priority?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Animal welfare', 'Media relations', 'Human safety', 'Cost control'],
                        'correct': 2,
                        'explanation': 'Human safety is always the top priority in ICS - you cannot help animals if humans are injured.'
                    },
                    {
                        'question': 'What is the recommended span of control in ICS?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['1-3 subordinates', '3-7 subordinates', '5-10 subordinates', '10-15 subordinates'],
                        'correct': 1,
                        'explanation': '3-7 subordinates per supervisor is the manageable span of control recommended in ICS.'
                    },
                    {
                        'question': 'All media communications should come from a single designated spokesperson.',
                        'type': 'TRUE_FALSE',
                        'correct': True,
                        'explanation': 'Single spokesperson prevents conflicting information and maintains message control during emergencies.'
                    },
                    {
                        'question': 'During multi-day operations, what is a critical management concern?',
                        'type': 'MULTIPLE_CHOICE',
                        'options': ['Animal feeding schedules', 'Personnel fatigue', 'Equipment color coding', 'Social media posting'],
                        'correct': 1,
                        'explanation': 'Personnel fatigue leads to mistakes and injuries, making it a critical safety concern in extended operations.'
                    }
                ]
            }
        ]

        # Create training modules
        for module_data in training_modules:
            self.stdout.write(f"Creating: {module_data['title']}")
            
            # Create the educational resource
            resource, created = EducationalResource.objects.get_or_create(
                slug=module_data['slug'],
                defaults={
                    'title': module_data['title'],
                    'category': training_category,
                    'resource_type': 'GUIDE',
                    'content': module_data['content'],
                    'summary': module_data['summary'],
                    'author': admin_user,
                    'is_published': True
                }
            )

            # Create interactive learning module
            interactive_module, created = InteractiveLearningModule.objects.get_or_create(
                resource=resource,
                defaults={
                    'module_type': 'QUIZ',
                    'is_active': True,
                    'requires_completion': True,
                    'passing_score': 80,
                    'estimated_duration': module_data['estimated_duration'],
                    'content_data': {
                        'description': 'Complete this training module to earn certification',
                        'learning_objectives': [
                            'Understand key concepts',
                            'Apply knowledge in scenarios',
                            'Demonstrate competency'
                        ]
                    }
                }
            )

            # Create quiz questions
            for i, question_data in enumerate(module_data['quiz_questions']):
                quiz_question, created = QuizQuestion.objects.get_or_create(
                    module=interactive_module,
                    order=i + 1,
                    defaults={
                        'question_text': question_data['question'],
                        'question_type': question_data['type'],
                        'question_data': {
                            'options': question_data.get('options', []),
                            'correct': question_data['correct']
                        },
                        'explanation': question_data['explanation'],
                        'points': 1
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(training_modules)} rescue training modules!'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                'Run the frontend development server to see the new training courses.'
            )
        )