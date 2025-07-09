from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from resources.models import ResourceCategory, EducationalResource

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates sample resource categories and resources for all user types'

    def handle(self, *args, **options):
        # Get admin user
        admin = User.objects.filter(is_staff=True).first()
        if not admin:
            self.stdout.write(self.style.ERROR('No admin user found. Please create one first.'))
            return
        
        # Create categories for PUBLIC users
        public_categories = [
            {
                'name': 'Pet Care Basics',
                'description': 'Essential information for caring for pets',
                'icon': 'pets'
            },
            {
                'name': 'Stray Animal Safety',
                'description': 'How to safely approach and help stray animals',
                'icon': 'warning'
            },
            {
                'name': 'Adoption Tips',
                'description': 'Guides for successful animal adoption',
                'icon': 'favorite'
            },
            {
                'name': 'Health & Nutrition',
                'description': 'Information about animal health and nutrition',
                'icon': 'local_hospital'
            },
        ]
        
        # Create categories for AUTHORITY users
        authority_categories = [
            {
                'name': 'Policy Implementation',
                'description': 'Municipal guidelines for implementing stray animal policies',
                'icon': 'policy'
            },
            {
                'name': 'Legal Frameworks',
                'description': 'Regulatory compliance and enforcement procedures',
                'icon': 'gavel'
            },
            {
                'name': 'Best Practices',
                'description': 'Proven intervention strategies and operational excellence',
                'icon': 'star'
            },
            {
                'name': 'Strategic Planning',
                'description': 'Territory management and resource allocation frameworks',
                'icon': 'map'
            },
            {
                'name': 'Research Studies',
                'description': 'Data-driven insights and ROI analysis for municipal planning',
                'icon': 'assessment'
            },
        ]
        
        # Combine all categories
        all_categories = public_categories + authority_categories
        created_categories = []
        
        for category_data in all_categories:
            category, created = ResourceCategory.objects.get_or_create(
                name=category_data['name'],
                defaults=category_data
            )
            created_categories.append(category)
            action = 'Created' if created else 'Already exists'
            self.stdout.write(f"{action}: {category.name}")
        
        # PUBLIC resources (existing content)
        public_resources = [
            {
                'title': 'How to Safely Approach a Stray Dog',
                'category': 'Stray Animal Safety',
                'resource_type': 'ARTICLE',
                'summary': 'Learn the proper techniques for safely approaching stray dogs without putting yourself at risk.',
                'content': """
                <h2>How to Safely Approach a Stray Dog</h2>
                
                <p>Approaching a stray dog requires caution and understanding of canine behavior. Follow these guidelines to stay safe:</p>
                
                <h3>1. Observe from a Distance</h3>
                <p>Before approaching, observe the dog's body language. Look for signs of fear or aggression like raised hackles, bared teeth, or a stiff tail. If the dog appears aggressive, do not approach.</p>
                
                <h3>2. Approach Slowly</h3>
                <p>If the dog seems calm, approach slowly from the side rather than head-on. Avoid direct eye contact as dogs may perceive this as a threat.</p>
                
                <h3>3. Use a Calm, Gentle Voice</h3>
                <p>Speak softly and reassuringly. Avoid high-pitched excited tones that might agitate the dog.</p>
                
                <h3>4. Offer Food</h3>
                <p>If possible, offer food by gently tossing it toward the dog rather than extending your hand immediately.</p>
                
                <h3>5. Use Proper Equipment</h3>
                <p>If you're planning to rescue the dog, have a slip lead, carrier, or other appropriate equipment ready.</p>
                
                <h3>6. Know When to Call Professionals</h3>
                <p>If the dog appears injured or aggressive, contact animal control or a local rescue organization instead of attempting to handle the situation yourself.</p>
                
                <h3>Safety First</h3>
                <p>Remember that your safety is the priority. Never put yourself at risk when attempting to help a stray animal.</p>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                'title': 'Essential Vaccinations for Cats',
                'category': 'Health & Nutrition',
                'resource_type': 'GUIDE',
                'summary': 'A comprehensive guide to essential vaccinations for cats and when they should be administered.',
                'content': """
                <h2>Essential Vaccinations for Cats</h2>
                
                <p>Vaccinations are crucial for protecting your cat from serious and sometimes fatal diseases. This guide covers the core vaccinations every cat should receive.</p>
                
                <h3>Core Vaccinations</h3>
                
                <h4>1. Rabies</h4>
                <p><strong>When:</strong> First dose at 12-16 weeks, booster at 1 year, then every 1-3 years depending on the vaccine used and local regulations.</p>
                <p><strong>Why:</strong> Rabies is fatal and can be transmitted to humans. In many areas, rabies vaccination is required by law.</p>
                
                <h4>2. FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)</h4>
                <p><strong>When:</strong> First dose at 6-8 weeks, then every 3-4 weeks until 16 weeks old. Booster at 1 year, then every 3 years.</p>
                <p><strong>Why:</strong> This combination vaccine protects against three highly contagious diseases that affect the respiratory system and can cause severe illness.</p>
                
                <h3>Non-Core Vaccinations</h3>
                
                <h4>1. Feline Leukemia Virus (FeLV)</h4>
                <p><strong>When:</strong> Two initial doses 3-4 weeks apart, booster at 1 year, then as recommended by your vet.</p>
                <p><strong>Why:</strong> Recommended for outdoor cats or those in multi-cat households. FeLV is the leading viral killer of cats.</p>
                
                <h4>2. Bordetella</h4>
                <p><strong>When:</strong> As recommended by your veterinarian.</p>
                <p><strong>Why:</strong> Helps prevent upper respiratory infections. Often recommended for cats in boarding facilities or shelters.</p>
                
                <h3>Vaccination Schedule</h3>
                <p>Always consult with your veterinarian to establish the appropriate vaccination schedule for your cat based on their age, health status, and lifestyle.</p>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
        ]
        
        # AUTHORITY resources (new policy content - SHORTENED TITLES)
        authority_resources = [
            {
                'title': 'Municipal TNR Program Guide',  # Shortened from "Municipal TNR Program Implementation Guide"
                'slug': 'municipal-tnr-program-guide',
                'category': 'Policy Implementation',
                'resource_type': 'GUIDE',
                'summary': 'Comprehensive framework for establishing Trap-Neuter-Return programs in urban municipalities.',
                'content': """
                <h2>Municipal TNR Program Implementation Guide</h2>
                
                <h3>Executive Summary</h3>
                <p>Trap-Neuter-Return (TNR) programs have proven effective in managing stray animal populations while reducing municipal costs and improving public health outcomes.</p>
                
                <h3>Policy Framework</h3>
                <h4>1. Legislative Requirements</h4>
                <ul>
                    <li>Municipal ordinance development</li>
                    <li>Licensing and permit requirements</li>
                    <li>Compliance with state animal welfare laws</li>
                    <li>Inter-agency coordination protocols</li>
                </ul>
                
                <h4>2. Resource Allocation</h4>
                <ul>
                    <li>Budget planning: $45-$85 per animal for complete TNR cycle</li>
                    <li>Veterinary service partnerships</li>
                    <li>Staff training and certification</li>
                    <li>Equipment procurement and maintenance</li>
                </ul>
                
                <h3>Implementation Timeline</h3>
                <p><strong>Phase 1 (Months 1-3):</strong> Policy development and stakeholder engagement</p>
                <p><strong>Phase 2 (Months 4-6):</strong> Resource allocation and staff training</p>
                <p><strong>Phase 3 (Months 7-12):</strong> Program rollout and community education</p>
                
                <h3>Success Metrics</h3>
                <ul>
                    <li>Population reduction: Target 15-25% annually</li>
                    <li>Public complaint reduction: Target 30-40%</li>
                    <li>Cost savings: $156,000 annually per 1,000 animals managed</li>
                    <li>Public health improvement: 70% reduction in zoonotic disease risk</li>
                </ul>
                
                <h3>Regulatory Compliance</h3>
                <p>Ensure all TNR activities comply with local animal welfare ordinances, state licensing requirements, and federal guidelines for animal population management.</p>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                'title': 'Animal Control Legal Framework',  # Shortened from "Legal Framework for Animal Control Enforcement"
                'slug': 'animal-control-legal-framework',
                'category': 'Legal Frameworks',
                'resource_type': 'GUIDE',
                'summary': 'Municipal authority guidelines for legal enforcement of animal welfare regulations.',
                'content': """
                <h2>Legal Framework for Animal Control Enforcement</h2>
                
                <h3>Regulatory Authority</h3>
                <p>Municipal animal control operates under state-delegated police powers for public health and safety protection.</p>
                
                <h3>Enforcement Procedures</h3>
                <h4>1. Citation and Penalty Structure</h4>
                <ul>
                    <li>First offense: Warning or $50-$150 fine</li>
                    <li>Second offense: $150-$300 fine</li>
                    <li>Subsequent offenses: $300-$500 fine + court appearance</li>
                    <li>Severe neglect/abuse: Criminal charges under state law</li>
                </ul>
                
                <h4>2. Due Process Requirements</h4>
                <ul>
                    <li>Written notice of violation</li>
                    <li>Opportunity for administrative hearing</li>
                    <li>Appeal process to municipal court</li>
                    <li>Evidence documentation standards</li>
                </ul>
                
                <h3>Emergency Powers</h3>
                <h4>Immediate Removal Authority</h4>
                <p>Animal control officers may immediately remove animals when:</p>
                <ul>
                    <li>Imminent threat to public safety</li>
                    <li>Severe medical emergency</li>
                    <li>Extreme neglect or abuse</li>
                    <li>Zoonotic disease outbreak</li>
                </ul>
                
                <h3>Inter-Agency Coordination</h3>
                <ul>
                    <li>Police department collaboration</li>
                    <li>Public health department liaison</li>
                    <li>Municipal court coordination</li>
                    <li>State animal welfare agency reporting</li>
                </ul>
                
                <h3>Legal Documentation</h3>
                <p>Maintain comprehensive records for all enforcement actions, including photographic evidence, witness statements, and veterinary assessments.</p>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                'title': 'Urban Animal Management Best Practices',  # Shortened from "Evidence-Based Best Practices for Urban Animal Management"
                'slug': 'urban-animal-management-best-practices',
                'category': 'Best Practices',
                'resource_type': 'ARTICLE',
                'summary': 'Research-backed strategies that have proven effective in reducing stray animal populations and improving public health outcomes.',
                'content': """
                <h2>Evidence-Based Best Practices for Urban Animal Management</h2>
                
                <h3>Overview</h3>
                <p>This analysis presents evidence-based strategies from 50+ municipalities that have successfully reduced stray animal populations by 30-60% over 5-year periods.</p>
                
                <h3>1. Multi-Modal Intervention Approach</h3>
                <h4>Proven Effective:</h4>
                <ul>
                    <li>TNR programs: 51.3% population reduction effectiveness</li>
                    <li>Mobile veterinary clinics: 45.6% coverage improvement</li>
                    <li>Community education: 23% behavior change achievement</li>
                    <li>Enforcement integration: 15% faster response times</li>
                </ul>
                
                <h3>2. Resource Allocation Optimization</h3>
                <h4>High-Priority Areas (Immediate intervention required):</h4>
                <ul>
                    <li>Downtown districts: 8 active reports, 65-minute avg response</li>
                    <li>Industrial zones: 6 active reports, 89-minute avg response</li>
                </ul>
                
                <h4>Medium-Priority Areas (Monitor and schedule):</h4>
                <ul>
                    <li>Commercial centers: 4 active reports, 95-minute avg response</li>
                    <li>Residential areas: 3 active reports, 110-minute avg response</li>
                </ul>
                
                <h3>3. Performance Metrics</h3>
                <h4>Primary Indicators:</h4>
                <ul>
                    <li>Population reduction: Target 25-35% annually</li>
                    <li>Public complaint reduction: Target 40-50%</li>
                    <li>Cost efficiency: $127.50 per animal managed</li>
                    <li>Vaccination coverage: 73.2% achievement rate</li>
                </ul>
                
                <h3>4. Technology Integration</h3>
                <ul>
                    <li>GPS tracking systems: 60% improved response coordination</li>
                    <li>Digital health records: 85% reduction in documentation errors</li>
                    <li>Predictive analytics: 30% better resource allocation</li>
                    <li>Community reporting platforms: 25% increase in civic engagement</li>
                </ul>
                
                <h3>ROI Analysis</h3>
                <p>Municipalities implementing these best practices report:</p>
                <ul>
                    <li>$156,000 annual cost savings per 1,000 animals managed</li>
                    <li>118.5% return on investment within 24 months</li>
                    <li>91.4% budget efficiency improvement</li>
                    <li>2.3x prevention vs. treatment cost ratio</li>
                </ul>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                'title': 'Territory Management Framework',  # Shortened from "Strategic Territory Management Framework"
                'slug': 'territory-management-framework',
                'category': 'Strategic Planning',
                'resource_type': 'GUIDE',
                'summary': 'Comprehensive planning framework for optimizing resource deployment across municipal territories.',
                'content': """
                <h2>Strategic Territory Management Framework</h2>
                
                <h3>Territorial Risk Assessment</h3>
                
                <h4>Risk Classification System:</h4>
                <ul>
                    <li><strong>High Risk Areas (20%):</strong> Immediate intervention required</li>
                    <li><strong>Medium Risk Areas (32%):</strong> Routine maintenance and monitoring</li>
                    <li><strong>Low Risk Areas (48%):</strong> Scheduled inspections and preventive measures</li>
                </ul>
                
                <h3>Resource Deployment Strategy</h3>
                
                <h4>Mobile Unit Allocation:</h4>
                <ul>
                    <li>Downtown District: Deploy additional mobile unit (Priority: High)</li>
                    <li>Industrial Zone: Increase patrol frequency (Priority: High)</li>
                    <li>Commercial Center: Partner with local businesses (Priority: Medium)</li>
                </ul>
                
                <h4>Expected Impact:</h4>
                <ul>
                    <li>Downtown: +25% efficiency improvement, 2-week timeline</li>
                    <li>Industrial: +15% response time improvement, 1-week timeline</li>
                    <li>Commercial: +20% early detection rate, 1-month timeline</li>
                </ul>
                
                <h3>Performance Monitoring</h3>
                
                <h4>Key Performance Indicators:</h4>
                <ul>
                    <li>Territory coverage: 87.5% area monitored</li>
                    <li>Response efficiency: 98-minute average (target: 2-hour maximum)</li>
                    <li>Completion rate: 75% cases resolved</li>
                    <li>Budget utilization: 87% of allocated funds ($1,087,500 of $1,250,000)</li>
                </ul>
                
                <h3>Predictive Planning</h3>
                
                <h4>Population Trends (6-month forecast):</h4>
                <ul>
                    <li>Expected growth: +12.3% (current: 1,023 animals)</li>
                    <li>High-risk areas requiring intervention: 23 zones</li>
                    <li>Active interventions planned: 8 zones under management</li>
                </ul>
                
                <h3>Stakeholder Coordination</h3>
                <ul>
                    <li>Municipal departments: Police, Public Health, Parks</li>
                    <li>Community organizations: Animal welfare groups, volunteer networks</li>
                    <li>Private sector: Veterinary clinics, pet supply businesses</li>
                    <li>Regional authorities: State animal control, wildlife services</li>
                </ul>
                
                <h3>Implementation Timeline</h3>
                <p><strong>Quarter 1:</strong> Risk assessment and resource planning</p>
                <p><strong>Quarter 2:</strong> Deployment and training</p>
                <p><strong>Quarter 3:</strong> Full implementation and monitoring</p>
                <p><strong>Quarter 4:</strong> Performance evaluation and planning for next cycle</p>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                'title': 'Municipal ROI Analysis Report',  # Shortened from "Municipal ROI Analysis: Stray Animal Management Investment Returns"
                'slug': 'municipal-roi-analysis-report',
                'category': 'Research Studies',
                'resource_type': 'ARTICLE',
                'summary': 'Comprehensive data analysis demonstrating financial returns and public health benefits of systematic stray animal management.',
                'content': """
                <h2>Municipal ROI Analysis: Stray Animal Management Investment Returns</h2>
                
                <h3>Executive Summary</h3>
                <p>Analysis of 45 municipalities demonstrates that systematic stray animal management programs generate significant returns on investment through reduced emergency services, improved public health, and enhanced community satisfaction.</p>
                
                <h3>Financial Impact Analysis</h3>
                
                <h4>Direct Cost Savings:</h4>
                <ul>
                    <li>Emergency services reduction: $156,000 annually</li>
                    <li>Public health interventions: $89,000 annually</li>
                    <li>Property damage mitigation: $23,000 annually</li>
                    <li>Administrative efficiency: $31,000 annually</li>
                    <li><strong>Total Direct Savings: $299,000 annually</strong></li>
                </ul>
                
                <h4>Investment Requirements:</h4>
                <ul>
                    <li>Program implementation: $845,000 total investment</li>
                    <li>Annual operational costs: $180,000</li>
                    <li>Staff training and certification: $25,000</li>
                    <li>Equipment and technology: $45,000</li>
                </ul>
                
                <h3>ROI Calculation</h3>
                <ul>
                    <li><strong>Year 1 ROI:</strong> 118.5%</li>
                    <li><strong>3-Year Cumulative ROI:</strong> 234%</li>
                    <li><strong>Break-even point:</strong> 18 months</li>
                    <li><strong>Prevention vs Treatment Ratio:</strong> 2.3:1</li>
                </ul>
                
                <h3>Public Health Benefits</h3>
                
                <h4>Quantified Health Outcomes:</h4>
                <ul>
                    <li>Disease prevention effectiveness: 94.5%</li>
                    <li>Vaccination coverage improvement: 73.2%</li>
                    <li>Zoonotic risk reduction: 67.8%</li>
                    <li>Community health improvement: 45.6%</li>
                </ul>
                
                <h4>Public Safety Improvements:</h4>
                <ul>
                    <li>Animal-related incidents: -49.4% reduction</li>
                    <li>Public complaints: -49.4% reduction</li>
                    <li>Emergency response calls: -36.3% reduction</li>
                    <li>Traffic accidents involving animals: -15% reduction</li>
                </ul>
                
                <h3>Social Impact Metrics</h3>
                <ul>
                    <li>Community satisfaction: 78.9% approval rating</li>
                    <li>Volunteer engagement: 156 active participants</li>
                    <li>Public participation: 67.8% community involvement</li>
                    <li>Complaint reduction: 49.4% fewer negative reports</li>
                </ul>
                
                <h3>Operational Efficiency Gains</h3>
                <ul>
                    <li>Budget efficiency: 91.4% utilization rate</li>
                    <li>Response time improvement: 98-minute average (down from 165 minutes)</li>
                    <li>Case resolution rate: 75% completion</li>
                    <li>Resource allocation efficiency: +42% improvement</li>
                </ul>
                
                <h3>Policy Recommendations</h3>
                <ol>
                    <li>Prioritize preventive interventions over reactive responses</li>
                    <li>Invest in technology platforms for coordination and data tracking</li>
                    <li>Develop community partnerships to leverage volunteer resources</li>
                    <li>Implement performance-based budgeting for continuous improvement</li>
                </ol>
                
                <h3>Conclusion</h3>
                <p>Systematic stray animal management represents a high-return municipal investment, delivering measurable benefits in public health, community safety, and operational efficiency while generating positive financial returns within 18 months.</p>
                """,
                'featured_image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
        ]
        
        # Combine all resources
        all_resources = public_resources + authority_resources
        
        for resource_data in all_resources:
            # Get category by name
            category_name = resource_data.pop('category')
            try:
                category = ResourceCategory.objects.get(name=category_name)
            except ResourceCategory.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Category "{category_name}" not found, skipping resource'))
                continue
            
            # Create resource
            resource, created = EducationalResource.objects.get_or_create(
                title=resource_data['title'],
                defaults={
                    **resource_data,
                    'category': category,
                    'author': admin
                }
            )
            
            action = 'Created' if created else 'Already exists'
            self.stdout.write(f"{action}: {resource.title}")
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample resources for all user types'))
        self.stdout.write(self.style.SUCCESS('Authority users will now see policy-specific content'))
        self.stdout.write(self.style.SUCCESS('Public users will continue to see educational content'))