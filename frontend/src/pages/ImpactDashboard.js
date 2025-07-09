import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../redux/api';

function ImpactDashboard() {
  const { user } = useSelector((state) => state.auth);
  
  const [impactData, setImpactData] = useState({
    overview: {},
    breakdown: {},
    trends: {},
    stories: {},
    personalImpact: {}
  });
  const [policyImpactData, setPolicyImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.user_type === 'AUTHORITY') {
      fetchPolicyImpactData();
    } else {
      fetchAllImpactData();
    }
  }, [user]);

  const fetchPolicyImpactData = async () => {
    try {
      setLoading(true);
      
      // Fetch strategic policy impact data for authorities
      const strategicRes = await api.get('/authority-analytics/test_endpoint/');
      
      // Mock comprehensive policy impact data
      const policyData = {
        overview: {
          policy_stats: [
            {
              icon: '📊',
              value: '51.3%',
              label: 'TNR Program Effectiveness',
              description: 'Population reduction achieved'
            },
            {
              icon: '💰',
              value: '$156,000',
              label: 'Annual Cost Savings',
              description: 'Prevention vs reactive costs'
            },
            {
              icon: '🎯',
              value: '73.2%',
              label: 'Vaccination Coverage',
              description: 'Public health improvement'
            },
            {
              icon: '📈',
              value: '23%',
              label: 'Behavior Change',
              description: 'Education campaign impact'
            }
          ],
          recent_policy_activity: {
            interventions_deployed: 8,
            population_reduction: 23.4,
            community_satisfaction: 78.9,
            cost_efficiency: 91.4
          }
        },
        interventions: {
          programs: [
            {
              name: 'TNR (Trap-Neuter-Return)',
              icon: '🏥',
              investment: 450000,
              animals_treated: 234,
              effectiveness: 51.3,
              roi: 2.3,
              areas_covered: ['Downtown', 'Industrial Zone'],
              timeline: '12 months',
              status: 'Active'
            },
            {
              name: 'Mobile Veterinary Clinics',
              icon: '🚐',
              investment: 180000,
              animals_treated: 189,
              effectiveness: 45.6,
              roi: 1.8,
              areas_covered: ['Residential North', 'Suburban South'],
              timeline: '8 months',
              status: 'Active'
            },
            {
              name: 'Community Education Campaign',
              icon: '📚',
              investment: 120000,
              people_reached: 2340,
              effectiveness: 22.9,
              roi: 3.1,
              areas_covered: ['City-wide'],
              timeline: '6 months',
              status: 'Expanding'
            },
            {
              name: 'Feeding Restriction Policy',
              icon: '⚖️',
              investment: 95000,
              areas_enforced: 12,
              effectiveness: 14.4,
              roi: 1.2,
              areas_covered: ['Commercial', 'Parks'],
              timeline: '4 months',
              status: 'Under Review'
            }
          ]
        },
        trends: {
          policy_trends: [
            { period: 'Pre-Policy', population: 1450, incidents: 89, cost: 180000, satisfaction: 45 },
            { period: 'Q1 2024', population: 1320, incidents: 76, cost: 165000, satisfaction: 52 },
            { period: 'Q2 2024', population: 1180, incidents: 68, cost: 148000, satisfaction: 61 },
            { period: 'Q3 2024', population: 1050, incidents: 58, cost: 132000, satisfaction: 71 },
            { period: 'Q4 2024', population: 980, incidents: 51, cost: 125000, satisfaction: 78 },
            { period: 'Q1 2025', population: 923, incidents: 45, cost: 118000, satisfaction: 84 }
          ],
          trend_summary: {
            population_reduction: 36.3,
            incident_reduction: 49.4,
            cost_reduction: 34.4,
            satisfaction_increase: 86.7
          }
        },
        outcomes: {
          success_programs: [
            {
              title: 'Downtown TNR Initiative Success',
              description: 'Comprehensive TNR program in downtown district achieved 65% population reduction in 8 months.',
              metrics: {
                population_before: 456,
                population_after: 159,
                reduction_percentage: 65.1,
                cost_per_animal: 89.50,
                community_complaints: -78
              },
              timeline: '8 months',
              area: 'Downtown District',
              outcome: 'Exceeded targets by 15%'
            },
            {
              title: 'Education Campaign Impact',
              description: 'City-wide education campaign resulted in significant behavior change and increased community cooperation.',
              metrics: {
                people_reached: 2340,
                behavior_change: 23.4,
                volunteer_increase: 45,
                cost_per_person: 12.75,
                awareness_increase: 67.8
              },
              timeline: '6 months',
              area: 'City-wide',
              outcome: 'Successful - expanding program'
            },
            {
              title: 'Mobile Clinic Efficiency',
              description: 'Mobile veterinary services improved response times and reduced intervention costs.',
              metrics: {
                animals_treated: 189,
                response_time_improvement: 35,
                cost_reduction: 28,
                vaccination_coverage: 78.4,
                efficiency_gain: 42
              },
              timeline: '12 months',
              area: 'Northern Districts',
              outcome: 'High ROI - additional units recommended'
            }
          ]
        },
        strategic_impact: {
          public_health: {
            disease_prevention: 94.5,
            vaccination_coverage: 73.2,
            zoonotic_risk_reduction: 67.8,
            community_health_improvement: 45.6
          },
          economic_impact: {
            total_investment: 845000,
            cost_savings: 156000,
            roi_percentage: 118.5,
            budget_efficiency: 91.4,
            prevention_vs_treatment_ratio: 2.3
          },
          social_impact: {
            community_satisfaction: 78.9,
            complaint_reduction: 49.4,
            volunteer_engagement: 156,
            public_participation: 67.8
          }
        }
      };
      
      setPolicyImpactData(policyData);
      
    } catch (err) {
      console.error('Failed to fetch policy impact data:', err);
      setError('Failed to load policy impact data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllImpactData = async () => {
    try {
      setLoading(true);
      const requests = [
        api.get('/impact-dashboard/overview_stats/'),
        api.get('/impact-dashboard/impact_breakdown/'),
        api.get('/impact-dashboard/monthly_trends/'),
        api.get('/impact-dashboard/success_stories/')
      ];

      // Only fetch personal impact for non-shelter users
      if (user?.user_type !== 'SHELTER') {
        requests.push(api.get('/impact-dashboard/donor_impact/'));
      }

      const responses = await Promise.all(requests);
      const [overview, breakdown, trends, stories, personal] = responses;

      setImpactData({
        overview: overview.data,
        breakdown: breakdown.data,
        trends: trends.data,
        stories: stories.data,
        personalImpact: personal?.data || {}
      });
    } catch (err) {
      setError('Failed to load impact data');
      console.error('Impact dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAnimalPlaceholder = (storyId, isBefore = true) => {
    // Create realistic animal placeholders based on story ID
    const animalPhotos = {
      before: [
        'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400&h=300&fit=crop&crop=face'
      ],
      after: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=400&h=300&fit=crop&crop=face'
      ]
    };
    
    const photos = isBefore ? animalPhotos.before : animalPhotos.after;
    return photos[storyId % photos.length];
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness >= 40) return '#4caf50';
    if (effectiveness >= 25) return '#ff9800';
    return '#f44336';
  };

  const getROIColor = (roi) => {
    if (roi >= 2.0) return '#4caf50';
    if (roi >= 1.5) return '#ff9800';
    return '#f44336';
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '2.5rem',
      color: '#1976d2',
      marginBottom: '10px',
      fontWeight: '600'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#666',
      margin: '0'
    },
    tabNavigation: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    tabButton: {
      backgroundColor: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.3s ease'
    },
    tabButtonInactive: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2'
    },
    quickStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
      border: '1px solid #e0e0e0'
    },
    statIcon: {
      fontSize: '2.5rem',
      marginBottom: '15px',
      display: 'block'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '1rem',
      color: '#666',
      fontWeight: '500'
    },
    statDescription: {
      fontSize: '0.85rem',
      color: '#888',
      fontStyle: 'italic',
      marginTop: '5px'
    },
    contentSection: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '1.8rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '25px',
      borderBottom: '2px solid #1976d2',
      paddingBottom: '10px'
    },
    programGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px'
    },
    programCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fafafa'
    },
    programHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    programIcon: {
      fontSize: '1.8rem',
      marginRight: '12px',
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: 'white'
    },
    programTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2c3e50'
    },
    programMetrics: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginBottom: '15px'
    },
    programMetric: {
      textAlign: 'center',
      padding: '10px',
      backgroundColor: 'white',
      borderRadius: '4px'
    },
    metricValue: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1976d2'
    },
    metricLabel: {
      fontSize: '0.8rem',
      color: '#666'
    },
    programStatus: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '500',
      color: 'white',
      backgroundColor: '#4caf50'
    },
    trendChart: {
      height: '400px',
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      padding: '20px',
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      marginTop: '20px'
    },
    trendBar: {
      width: '60px',
      backgroundColor: '#1976d2',
      borderRadius: '4px 4px 0 0',
      position: 'relative',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      margin: '0 5px'
    },
    trendLabel: {
      fontSize: '0.8rem',
      color: '#666',
      textAlign: 'center',
      marginTop: '8px'
    },
    successGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px'
    },
    successCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white'
    },
    successHeader: {
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '15px',
      fontSize: '1.1rem',
      fontWeight: '600'
    },
    successContent: {
      padding: '20px'
    },
    successDescription: {
      fontSize: '0.95rem',
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '15px'
    },
    successMetrics: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '10px',
      marginBottom: '15px'
    },
    successMetric: {
      textAlign: 'center',
      padding: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px'
    },
    successOutcome: {
      backgroundColor: '#e8f5e8',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '0.9rem',
      color: '#2e7d32',
      fontWeight: '500'
    },
    error: {
      backgroundColor: '#ffebee',
      border: '1px solid #f44336',
      color: '#c62828',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    loadingText: {
      fontSize: '1.2rem',
      color: '#666',
      marginTop: '15px'
    },
    impactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    impactCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fafafa'
    },
    impactHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    impactIcon: {
      fontSize: '1.5rem',
      marginRight: '12px',
      padding: '8px',
      borderRadius: '50%',
      backgroundColor: 'white'
    },
    impactTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2c3e50'
    },
    impactAmount: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: '#1976d2',
      marginBottom: '5px'
    },
    impactUnits: {
      fontSize: '0.9rem',
      color: '#666'
    },
    storiesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px'
    },
    storyCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white'
    },
    storyImages: {
      display: 'flex',
      height: '200px'
    },
    storyImage: {
      width: '50%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    },
    imageLabel: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    storyContent: {
      padding: '20px'
    },
    storyTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '10px'
    },
    storyText: {
      fontSize: '0.9rem',
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '15px'
    },
    storyMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.85rem',
      color: '#888'
    },
    personalImpactSection: {
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    personalTitle: {
      fontSize: '2rem',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '25px'
    },
    personalStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '25px'
    },
    personalStat: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '8px'
    },
    personalStatValue: {
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '5px'
    },
    personalStatLabel: {
      fontSize: '0.9rem',
      opacity: '0.9'
    },
    donorLevel: {
      textAlign: 'center',
      padding: '25px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '8px'
    },
    levelBadge: {
      fontSize: '3rem',
      marginBottom: '10px'
    },
    levelName: {
      fontSize: '1.4rem',
      fontWeight: '600',
      marginBottom: '15px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '10px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{fontSize: '3rem', marginBottom: '15px'}}>📊</div>
          <h2 style={styles.loadingText}>Loading Impact Dashboard...</h2>
        </div>
      </div>
    );
  }

  // AUTHORITY Policy Impact Dashboard
  if (user?.user_type === 'AUTHORITY' && policyImpactData) {
    const authorityTabs = [
      { id: 'overview', label: '📊 Policy Overview' },
      { id: 'interventions', label: '🎯 Program Effectiveness' },
      { id: 'trends', label: '📈 Policy Trends' },
      { id: 'outcomes', label: '🏆 Success Outcomes' },
      { id: 'strategic', label: '🌍 Strategic Impact' }
    ];

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏛️ Policy Impact Analysis</h1>
          <p style={styles.subtitle}>Comprehensive assessment of policy interventions and their territorial impact</p>
        </div>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.tabNavigation}>
          {authorityTabs.map(tab => (
            <button
              key={tab.id}
              style={activeTab === tab.id ? styles.tabButton : {...styles.tabButton, ...styles.tabButtonInactive}}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Policy Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.quickStats}>
              {policyImpactData.overview.policy_stats?.map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statDescription}>{stat.description}</div>
                </div>
              ))}
            </div>

            <div style={styles.contentSection}>
              <h3 style={styles.sectionTitle}>Recent Policy Activity</h3>
              <div style={styles.impactGrid}>
                <div style={styles.impactCard}>
                  <div style={styles.impactHeader}>
                    <span style={styles.impactIcon}>🎯</span>
                    <span style={styles.impactTitle}>Active Interventions</span>
                  </div>
                  <div style={styles.impactAmount}>
                    {policyImpactData.overview.recent_policy_activity.interventions_deployed}
                  </div>
                  <div style={styles.impactUnits}>Programs currently deployed</div>
                </div>

                <div style={styles.impactCard}>
                  <div style={styles.impactHeader}>
                    <span style={styles.impactIcon}>📉</span>
                    <span style={styles.impactTitle}>Population Reduction</span>
                  </div>
                  <div style={styles.impactAmount}>
                    {policyImpactData.overview.recent_policy_activity.population_reduction}%
                  </div>
                  <div style={styles.impactUnits}>Achieved through policy interventions</div>
                </div>

                <div style={styles.impactCard}>
                  <div style={styles.impactHeader}>
                    <span style={styles.impactIcon}>😊</span>
                    <span style={styles.impactTitle}>Community Satisfaction</span>
                  </div>
                  <div style={styles.impactAmount}>
                    {policyImpactData.overview.recent_policy_activity.community_satisfaction}%
                  </div>
                  <div style={styles.impactUnits}>Public approval rating</div>
                </div>

                <div style={styles.impactCard}>
                  <div style={styles.impactHeader}>
                    <span style={styles.impactIcon}>⚡</span>
                    <span style={styles.impactTitle}>Cost Efficiency</span>
                  </div>
                  <div style={styles.impactAmount}>
                    {policyImpactData.overview.recent_policy_activity.cost_efficiency}%
                  </div>
                  <div style={styles.impactUnits}>Budget utilization efficiency</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Program Effectiveness Tab */}
        {activeTab === 'interventions' && (
          <div style={styles.contentSection}>
            <h3 style={styles.sectionTitle}>🎯 Program Effectiveness Analysis</h3>
            <div style={styles.programGrid}>
              {policyImpactData.interventions.programs?.map((program, index) => (
                <div key={index} style={styles.programCard}>
                  <div style={styles.programHeader}>
                    <span style={styles.programIcon}>{program.icon}</span>
                    <div>
                      <div style={styles.programTitle}>{program.name}</div>
                      <span style={styles.programStatus}>{program.status}</span>
                    </div>
                  </div>
                  
                  <div style={styles.programMetrics}>
                    <div style={styles.programMetric}>
                      <div style={{...styles.metricValue, color: getEffectivenessColor(program.effectiveness)}}>
                        {program.effectiveness}%
                      </div>
                      <div style={styles.metricLabel}>Effectiveness</div>
                    </div>
                    <div style={styles.programMetric}>
                      <div style={{...styles.metricValue, color: getROIColor(program.roi)}}>
                        {program.roi}x
                      </div>
                      <div style={styles.metricLabel}>ROI</div>
                    </div>
                    <div style={styles.programMetric}>
                      <div style={styles.metricValue}>{formatCurrency(program.investment)}</div>
                      <div style={styles.metricLabel}>Investment</div>
                    </div>
                    <div style={styles.programMetric}>
                      <div style={styles.metricValue}>
                        {program.animals_treated || program.people_reached || program.areas_enforced}
                      </div>
                      <div style={styles.metricLabel}>
                        {program.animals_treated ? 'Animals' : program.people_reached ? 'People' : 'Areas'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                    <strong>Coverage:</strong> {program.areas_covered.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <strong>Timeline:</strong> {program.timeline}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Trends Tab */}
        {activeTab === 'trends' && (
          <div style={styles.contentSection}>
            <h3 style={styles.sectionTitle}>📈 Policy Impact Trends</h3>
            <div style={styles.trendChart}>
              {policyImpactData.trends.policy_trends?.map((period, index) => {
                const maxPopulation = Math.max(...(policyImpactData.trends.policy_trends?.map(p => p.population) || [1]));
                const height = Math.max(20, (period.population / maxPopulation) * 350);
                
                return (
                  <div key={index} style={{textAlign: 'center'}}>
                    <div 
                      style={{
                        ...styles.trendBar,
                        height: `${height}px`,
                        backgroundColor: index === 0 ? '#f44336' : '#4caf50'
                      }}
                      title={`${period.period}: ${period.population} population, ${period.incidents} incidents`}
                    />
                    <div style={styles.trendLabel}>{period.period}</div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2e7d32' }}>
                  -{policyImpactData.trends.trend_summary.population_reduction}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Population Reduction</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1976d2' }}>
                  -{policyImpactData.trends.trend_summary.incident_reduction}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Incident Reduction</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f57c00' }}>
                  -{policyImpactData.trends.trend_summary.cost_reduction}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Cost Reduction</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#7b1fa2' }}>
                  +{policyImpactData.trends.trend_summary.satisfaction_increase}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Satisfaction Increase</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Outcomes Tab */}
        {activeTab === 'outcomes' && (
          <div style={styles.contentSection}>
            <h3 style={styles.sectionTitle}>🏆 Policy Success Outcomes</h3>
            <div style={styles.successGrid}>
              {policyImpactData.outcomes.success_programs?.map((success, index) => (
                <div key={index} style={styles.successCard}>
                  <div style={styles.successHeader}>
                    {success.title}
                  </div>
                  <div style={styles.successContent}>
                    <p style={styles.successDescription}>
                      {success.description}
                    </p>
                    
                    <div style={styles.successMetrics}>
                      {Object.entries(success.metrics).map(([key, value], metricIndex) => (
                        <div key={metricIndex} style={styles.successMetric}>
                          <div style={styles.metricValue}>
                            {typeof value === 'number' && key.includes('cost') ? formatCurrency(value) : 
                             typeof value === 'number' && (key.includes('percentage') || key.includes('reduction') || key.includes('change') || key.includes('increase')) ? `${value}%` :
                             value}
                          </div>
                          <div style={styles.metricLabel}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Area:</strong> {success.area} | <strong>Timeline:</strong> {success.timeline}
                    </div>
                    
                    <div style={styles.successOutcome}>
                      <strong>Outcome:</strong> {success.outcome}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Impact Tab */}
        {activeTab === 'strategic' && (
          <div style={styles.contentSection}>
            <h3 style={styles.sectionTitle}>🌍 Strategic Impact Assessment</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Public Health Impact */}
              <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#2e7d32', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  🏥 Public Health Impact
                </h4>
                {Object.entries(policyImpactData.strategic_impact.public_health).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <strong>{value}%</strong>
                  </div>
                ))}
              </div>

              {/* Economic Impact */}
              <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#1976d2', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  💰 Economic Impact
                </h4>
                {Object.entries(policyImpactData.strategic_impact.economic_impact).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <strong>
                      {key.includes('investment') || key.includes('savings') ? formatCurrency(value) : 
                       key.includes('percentage') || key.includes('efficiency') || key.includes('roi') ? `${value}%` :
                       `${value}x`}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Social Impact */}
              <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#f57c00', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  🤝 Social Impact
                </h4>
                {Object.entries(policyImpactData.strategic_impact.social_impact).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </span>
                    <strong>{value}{key.includes('engagement') ? '' : '%'}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MODIFIED Shelter Impact Dashboard - REMOVED "My Impact" section
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💰 Shelter Impact Dashboard</h1>
        <p style={styles.subtitle}>Track the impact we're making in animal rescue and care operations</p>
      </div>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div style={styles.tabNavigation}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'impact', label: '🎯 Impact Breakdown' },
          { id: 'trends', label: '📈 Trends' },
          { id: 'stories', label: '🌟 Success Stories' },
          // Only show "My Impact" for non-shelter users
          ...(user?.user_type !== 'SHELTER' ? [{ id: 'personal', label: '👤 My Impact' }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            style={activeTab === tab.id ? styles.tabButton : {...styles.tabButton, ...styles.tabButtonInactive}}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={styles.quickStats}>
            {impactData.overview.quick_stats?.map((stat, index) => (
              <div key={index} style={styles.statCard}>
                <span style={styles.statIcon}>{stat.icon}</span>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.contentSection}>
            <h3 style={styles.sectionTitle}>Recent Activity (Last 30 Days)</h3>
            <div style={styles.impactGrid}>
              <div style={styles.impactCard}>
                <div style={styles.impactHeader}>
                  <span style={styles.impactIcon}>💰</span>
                  <span style={styles.impactTitle}>Donations Received</span>
                </div>
                <div style={styles.impactAmount}>
                  {formatCurrency(impactData.overview.recent_activity?.donations_30_days || 0)}
                </div>
                <div style={styles.impactUnits}>
                  {impactData.overview.recent_activity?.donations_count_30_days || 0} individual donations
                </div>
              </div>

              <div style={styles.impactCard}>
                <div style={styles.impactHeader}>
                  <span style={styles.impactIcon}>⭐</span>
                  <span style={styles.impactTitle}>Featured Stories</span>
                </div>
                <div style={styles.impactAmount}>
                  {impactData.overview.recent_activity?.featured_stories || 0}
                </div>
                <div style={styles.impactUnits}>New success stories shared</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Breakdown Tab */}
      {activeTab === 'impact' && (
        <div style={styles.contentSection}>
          <h3 style={styles.sectionTitle}>🎯 Impact by Category</h3>
          <div style={styles.impactGrid}>
            {impactData.breakdown.breakdown?.map((item, index) => (
              <div key={index} style={styles.impactCard}>
                <div style={styles.impactHeader}>
                  <span style={styles.impactIcon}>{item.icon}</span>
                  <span style={styles.impactTitle}>{item.category}</span>
                </div>
                <div style={styles.impactAmount}>
                  {formatCurrency(item.amount)}
                </div>
                <div style={styles.impactUnits}>
                  {item.units_helped} {item.unit_name}s helped • {item.donations} donations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div style={styles.contentSection}>
          <h3 style={styles.sectionTitle}>📈 Monthly Donation Trends</h3>
          <div style={styles.trendChart}>
            {impactData.trends.monthly_trends?.map((month, index) => {
              const maxDonation = Math.max(...(impactData.trends.monthly_trends?.map(m => m.donations) || [1]));
              const height = Math.max(20, (month.donations / maxDonation) * 250);
              
              return (
                <div key={index} style={{textAlign: 'center'}}>
                  <div 
                    style={{
                      ...styles.trendBar,
                      height: `${height}px`
                    }}
                    title={`${month.month}: ${formatCurrency(month.donations)}`}
                  />
                  <div style={styles.trendLabel}>{month.month_short}</div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop: '20px', textAlign: 'center', color: '#666'}}>
            <p>Average monthly donations: {formatCurrency(impactData.trends.trend_summary?.avg_monthly_donations || 0)}</p>
          </div>
        </div>
      )}

      {/* Success Stories Tab */}
      {activeTab === 'stories' && (
        <div style={styles.contentSection}>
          <h3 style={styles.sectionTitle}>🌟 Success Stories</h3>
          
          {/* Show Featured Stories First */}
          {impactData.stories.featured_stories?.length > 0 && (
            <>
              <h4 style={{color: '#1976d2', marginBottom: '15px', fontSize: '1.3rem'}}>⭐ Featured Stories</h4>
              <div style={styles.storiesGrid}>
                {impactData.stories.featured_stories?.map((story, index) => (
                  <div key={`featured-${index}`} style={styles.storyCard}>
                    <div style={styles.storyImages}>
                      <div 
                        style={{
                          ...styles.storyImage,
                          backgroundImage: `url(${story.before_photo || getAnimalPlaceholder(story.id, true)})`
                        }}
                      >
                        <span style={styles.imageLabel}>Before</span>
                      </div>
                      <div 
                        style={{
                          ...styles.storyImage,
                          backgroundImage: `url(${story.after_photo || getAnimalPlaceholder(story.id, false)})`
                        }}
                      >
                        <span style={styles.imageLabel}>After</span>
                      </div>
                    </div>
                    <div style={styles.storyContent}>
                      <h4 style={styles.storyTitle}>⭐ {story.title}</h4>
                      <p style={styles.storyText}>
                        {story.story_text.substring(0, 120)}...
                      </p>
                      <div style={styles.storyMeta}>
                        <span>🐕 {story.animal_name}</span>
                        <span>💰 {formatCurrency(story.total_cost)}</span>
                      </div>
                      {story.days_to_adoption && (
                        <div style={{...styles.storyMeta, marginTop: '8px'}}>
                          <span>📅 {story.days_to_adoption} days to adoption</span>
                          <span>❤️ {story.donations_count} donors</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Show Recent Stories */}
          {impactData.stories.recent_stories?.length > 0 && (
            <>
              <h4 style={{color: '#1976d2', marginBottom: '15px', marginTop: '30px', fontSize: '1.3rem'}}>📅 Recent Stories</h4>
              <div style={styles.storiesGrid}>
                {impactData.stories.recent_stories?.map((story, index) => (
                  <div key={`recent-${index}`} style={styles.storyCard}>
                    <div style={styles.storyImages}>
                      <div 
                        style={{
                          ...styles.storyImage,
                          backgroundImage: `url(${story.before_photo || getAnimalPlaceholder(story.id, true)})`
                        }}
                      >
                        <span style={styles.imageLabel}>Before</span>
                      </div>
                      <div 
                        style={{
                          ...styles.storyImage,
                          backgroundImage: `url(${story.after_photo || getAnimalPlaceholder(story.id, false)})`
                        }}
                      >
                        <span style={styles.imageLabel}>After</span>
                      </div>
                    </div>
                    <div style={styles.storyContent}>
                      <h4 style={styles.storyTitle}>{story.title}</h4>
                      <p style={styles.storyText}>
                        {story.story_text.substring(0, 120)}...
                      </p>
                      <div style={styles.storyMeta}>
                        <span>🐕 {story.animal_name}</span>
                        <span>💰 {formatCurrency(story.total_cost)}</span>
                      </div>
                      {story.days_to_adoption && (
                        <div style={{...styles.storyMeta, marginTop: '8px'}}>
                          <span>📅 {story.days_to_adoption} days to adoption</span>
                          <span>❤️ {story.donations_count} donors</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Show message if no stories */}
          {(!impactData.stories.featured_stories?.length && !impactData.stories.recent_stories?.length) && (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              <p>No success stories available yet. Check back soon!</p>
            </div>
          )}
        </div>
      )}

      {/* Personal Impact Tab - Only for non-shelter users */}
      {activeTab === 'personal' && user?.user_type !== 'SHELTER' && (
        <div style={styles.personalImpactSection}>
          <h3 style={styles.personalTitle}>👤 Your Personal Impact</h3>
          
          <div style={styles.personalStats}>
            <div style={styles.personalStat}>
              <div style={styles.personalStatValue}>
                {formatCurrency(impactData.personalImpact.personal_stats?.total_donated || 0)}
              </div>
              <div style={styles.personalStatLabel}>Total Donated</div>
            </div>
            <div style={styles.personalStat}>
              <div style={styles.personalStatValue}>
                {impactData.personalImpact.personal_stats?.animals_helped || 0}
              </div>
              <div style={styles.personalStatLabel}>Animals Helped</div>
            </div>
            <div style={styles.personalStat}>
              <div style={styles.personalStatValue}>
                {impactData.personalImpact.personal_stats?.donations_count || 0}
              </div>
              <div style={styles.personalStatLabel}>Donations Made</div>
            </div>
          </div>

          <div style={styles.donorLevel}>
            <div style={styles.levelBadge}>
              {getDonorLevelEmoji(impactData.personalImpact.personal_stats?.donor_level)}
            </div>
            <div style={styles.levelName}>
              {impactData.personalImpact.personal_stats?.donor_level} Donor
            </div>
            {impactData.personalImpact.donor_level_info?.next_level && (
              <>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${impactData.personalImpact.donor_level_info.progress_percentage}%`
                    }}
                  />
                </div>
                <div style={{fontSize: '0.9rem', opacity: '0.9'}}>
                  {formatCurrency(impactData.personalImpact.donor_level_info.amount_to_next_level)} to {impactData.personalImpact.donor_level_info.next_level}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const getDonorLevelEmoji = (level) => {
  const emojis = {
    'BRONZE': '🥉',
    'SILVER': '🥈', 
    'GOLD': '🥇',
    'PLATINUM': '💎',
    'DIAMOND': '👑'
  };
  return emojis[level] || '🌟';
};

export default ImpactDashboard;