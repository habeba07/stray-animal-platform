import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Box,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Pets as PetsIcon,
  Groups as GroupsIcon,
  Assessment as AssessmentIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  BarChart as ChartIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Health as HealthIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  AccountBalance as BankIcon,
  EmojiEvents as TrophyIcon,
  CameraAlt as CameraIcon,
  MenuBook as BookIcon,
  NewReleases as NewsIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
};

// Enhanced keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
  33% { transform: translateY(-25px) rotate(8deg); opacity: 0.9; }
  66% { transform: translateY(-15px) rotate(-5deg); opacity: 0.8; }
  100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  25% { opacity: 0.8; transform: scale(0.8) rotate(90deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  75% { opacity: 0.8; transform: scale(0.8) rotate(270deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.5)}; }
  50% { transform: scale(1.08); box-shadow: 0 0 0 25px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(50px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const ripple = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
`;



const glow = keyframes`
  0% { box-shadow: 0 0 5px ${alpha(customTheme.accent, 0.3)}; }
  50% { box-shadow: 0 0 20px ${alpha(customTheme.accent, 0.6)}, 0 0 30px ${alpha(customTheme.accent, 0.4)}; }
  100% { box-shadow: 0 0 5px ${alpha(customTheme.accent, 0.3)}; }
`;

const morphing = keyframes`
  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const floatingIcon = keyframes`
  0% { transform: translateY(0px) rotate(0deg) scale(1); }
  33% { transform: translateY(-20px) rotate(5deg) scale(1.1); }
  66% { transform: translateY(-10px) rotate(-3deg) scale(0.95); }
  100% { transform: translateY(0px) rotate(0deg) scale(1); }
`;

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
              value: '51.3%',
              label: 'TNR Program Effectiveness',
              description: 'Population reduction achieved'
            },
            {
              value: '$156,000',
              label: 'Annual Cost Savings',
              description: 'Prevention vs reactive costs'
            },
            {
              value: '73.2%',
              label: 'Vaccination Coverage',
              description: 'Public health improvement'
            },
            {
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
    if (effectiveness >= 40) return customTheme.success;
    if (effectiveness >= 25) return customTheme.accent;
    return '#f44336';
  };

  const getROIColor = (roi) => {
    if (roi >= 2.0) return customTheme.success;
    if (roi >= 1.5) return customTheme.accent;
    return '#f44336';
  };

  const getDonorLevelEmoji = (level) => {
    const levelMap = {
      'BRONZE': 'Bronze',
      'SILVER': 'Silver', 
      'GOLD': 'Gold',
      'PLATINUM': 'Platinum',
      'DIAMOND': 'Diamond'
    };
    return levelMap[level] || 'Supporter';
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 15% 85%, ${alpha(customTheme.accent, 0.4)} 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, ${alpha(customTheme.secondary, 0.4)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 70%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.6)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Enhanced Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '12%',
            animation: `${floatingIcon} 8s ease-in-out infinite`,
            animationDelay: '0s'
          }}
        >
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, ${alpha(customTheme.primary, 0.3)}, ${alpha(customTheme.accent, 0.2)})
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: customTheme.primary,
            boxShadow: `0 10px 30px ${alpha(customTheme.primary, 0.3)}`,
            animation: `${morphing} 8s ease-in-out infinite`,
            backdropFilter: 'blur(10px)',
            border: `2px solid ${alpha(customTheme.primary, 0.2)}`
          }}>
            <MoneyIcon sx={{ fontSize: 32, color: customTheme.primary }} />
          </Box>
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            top: '65%',
            right: '18%',
            animation: `${floatingIcon} 10s ease-in-out infinite`,
            animationDelay: '3s'
          }}
        >
          <Box sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, ${alpha(customTheme.secondary, 0.3)}, ${alpha(customTheme.success, 0.2)})
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: customTheme.secondary,
            boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.3)}`,
            animation: `${morphing} 10s ease-in-out infinite`,
            backdropFilter: 'blur(10px)',
            border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
          }}>
            <ChartIcon sx={{ fontSize: 24, color: customTheme.secondary }} />
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '25%',
            animation: `${floatingIcon} 12s ease-in-out infinite`,
            animationDelay: '6s'
          }}
        >
          <Box sx={{ 
            width: 50, 
            height: 50, 
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, ${alpha(customTheme.accent, 0.3)}, ${alpha(customTheme.primary, 0.2)})
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: customTheme.accent,
            boxShadow: `0 6px 20px ${alpha(customTheme.accent, 0.3)}`,
            animation: `${morphing} 12s ease-in-out infinite`,
            backdropFilter: 'blur(10px)',
            border: `2px solid ${alpha(customTheme.accent, 0.2)}`
          }}>
            <PetsIcon sx={{ fontSize: 20, color: customTheme.accent }} />
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <CircularProgress 
              size={100} 
              thickness={3}
              sx={{ 
                color: customTheme.primary,
                animation: `${pulse} 2.5s infinite`,
                filter: 'drop-shadow(0 0 10px rgba(141, 110, 99, 0.4))'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${sparkle} 3s infinite`
              }}
            >
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 30% 30%, ${customTheme.accent}, ${customTheme.secondary})
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: `0 4px 15px ${alpha(customTheme.accent, 0.5)}`,
                animation: `${glow} 2s infinite alternate`
              }}>
                <SparkleIcon sx={{ fontSize: 20, color: 'white' }} />
              </Box>
            </Box>
          </Box>
          <Typography 
            variant="h3" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${gradientShift} 4s ease infinite`,
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
              letterSpacing: '-0.02em'
            }}
          >
            Loading Impact Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8),
              fontWeight: 500,
              animation: `${slideInUp} 1s ease-out 0.3s both`
            }}
          >
            Analyzing impact metrics and generating insights...
          </Typography>
        </Box>
      </Box>
    );
  }

  // AUTHORITY Policy Impact Dashboard
  if (user?.user_type === 'AUTHORITY' && policyImpactData) {
    const authorityTabs = [
      { id: 'overview', label: 'Policy Overview' },
      { id: 'interventions', label: 'Program Effectiveness' },
      { id: 'trends', label: 'Policy Trends' },
      { id: 'outcomes', label: 'Success Outcomes' },
      { id: 'strategic', label: 'Strategic Impact' }
    ];

    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 15% 85%, ${alpha(customTheme.accent, 0.4)} 0%, transparent 50%),
          radial-gradient(circle at 85% 15%, ${alpha(customTheme.secondary, 0.4)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 70%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.6)} 100%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Enhanced Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '4%',
            left: '4%',
            animation: `${floatingIcon} 12s ease-in-out infinite`,
            animationDelay: '0s',
            opacity: 0.6
          }}
        >
          <Box sx={{ 
            width: 50, 
            height: 50, 
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, ${customTheme.accent}, ${alpha(customTheme.accent, 0.7)})
            `,
            filter: 'blur(1px)',
            animation: `${glow} 3s ease-in-out infinite alternate`
          }} />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            top: '18%',
            right: '8%',
            animation: `${floatingIcon} 15s ease-in-out infinite`,
            animationDelay: '4s',
            opacity: 0.4
          }}
        >
          <Box sx={{ 
            width: 70, 
            height: 70, 
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, ${customTheme.primary}, ${alpha(customTheme.primary, 0.6)})
            `,
            transform: 'rotate(25deg)',
            animation: `${morphing} 15s ease-in-out infinite`
          }} />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '6%',
            animation: `${floatingIcon} 18s ease-in-out infinite`,
            animationDelay: '8s',
            opacity: 0.5
          }}
        >
          <Box sx={{ 
            width: 55, 
            height: 55, 
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 30% 30%, ${customTheme.secondary}, ${alpha(customTheme.secondary, 0.6)})
            `,
            transform: 'rotate(-15deg)',
            animation: `${glow} 4s ease-in-out infinite alternate`
          }} />
        </Box>

        <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
          {/* Enhanced Hero Header Section */}
          <Fade in timeout={1000}>
            <Box sx={{ 
              textAlign: 'center', 
              mb: 8,
              position: 'relative'
            }}>
              {/* Floating sparkles around header */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  left: '20%',
                  animation: `${sparkle} 4s infinite`,
                  animationDelay: '0s'
                }}
              >
                <Box sx={{ 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${customTheme.accent}, ${alpha(customTheme.accent, 0.7)})`,
                  animation: `${glow} 2s infinite alternate`
                }} />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: '25%',
                  animation: `${sparkle} 4s infinite`,
                  animationDelay: '2s'
                }}
              >
                <Box sx={{ 
                  width: 25, 
                  height: 25, 
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${customTheme.secondary}, ${alpha(customTheme.secondary, 0.7)})`,
                  animation: `${glow} 2s infinite alternate`
                }} />
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 900,
                  background: `linear-gradient(45deg, ${customTheme.primary} 15%, ${customTheme.accent} 45%, ${customTheme.secondary} 75%)`,
                  backgroundSize: '300% 300%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 5s ease infinite`,
                  mb: 3,
                  textShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.03em',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 120,
                    height: 4,
                    background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`,
                    borderRadius: 2,
                    animation: `${shimmer} 3s infinite`
                  }
                }}
              >
                Policy Impact Analysis
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 500,
                  maxWidth: 750,
                  mx: 'auto',
                  lineHeight: 1.7,
                  mb: 4,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                Comprehensive assessment of policy interventions and their territorial impact with advanced analytics
              </Typography>
            </Box>
          </Fade>

          {/* Enhanced Error Alert */}
          {error && (
            <Fade in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 6,
                  borderRadius: 6,
                  background: `
                    radial-gradient(circle at 20% 80%, ${alpha('#f44336', 0.15)} 0%, transparent 50%),
                    linear-gradient(135deg, ${alpha('#f44336', 0.08)} 0%, ${alpha('#f44336', 0.05)} 100%)
                  `,
                  border: `3px solid ${alpha('#f44336', 0.3)}`,
                  color: '#c62828',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha('#f44336', 0.1)}, transparent)`,
                    animation: `${shimmer} 3s infinite`
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, zIndex: 1, position: 'relative' }}>
                  ⚠️ {error}
                </Typography>
              </Paper>
            </Fade>
          )}

          {/* Enhanced Tab Navigation */}
          <Box sx={{ 
            mb: 6,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, ${alpha(customTheme.background, 0.95)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
                `,
                border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                backdropFilter: 'blur(25px)',
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 15px 35px ${alpha(customTheme.primary, 0.1)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 3s ease infinite`
                }
              }}
            >
              {authorityTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'contained' : 'text'}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 4,
                    py: 2,
                    minWidth: 140,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    ...(activeTab === tab.id ? {
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                      color: 'white',
                      boxShadow: `0 12px 30px ${alpha(customTheme.primary, 0.4)}`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: `0 15px 40px ${alpha(customTheme.primary, 0.5)}`
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                        animation: `${shimmer} 2s infinite`
                      }
                    } : {
                      color: customTheme.primary,
                      '&:hover': {
                        backgroundColor: alpha(customTheme.primary, 0.1),
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                      }
                    })
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Paper>
          </Box>

          {/* Policy Overview Tab */}
          {activeTab === 'overview' && (
            <Box>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {policyImpactData.overview.policy_stats?.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 6,
                          overflow: 'hidden',
                          background: `
                            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                          `,
                          backdropFilter: 'blur(25px)',
                          border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-12px) scale(1.03)',
                            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.25)}`,
                            border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                            '&::before': {
                              transform: 'translateX(100%)'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha(customTheme.primary, 0.1)}, transparent)`,
                            transition: 'transform 0.6s ease'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 5, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontWeight: 900,
                              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              mb: 2,
                              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              animation: `${glow} 2s infinite alternate`
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
                            {stat.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                            {stat.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>

              <Card 
                sx={{ 
                  borderRadius: 6,
                  background: `
                    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                    linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                  `,
                  backdropFilter: 'blur(25px)',
                  border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                    animation: `${gradientShift} 4s ease infinite`
                  }
                }}
              >
                <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 800, 
                    mb: 5,
                    borderBottom: `4px solid ${customTheme.accent}`,
                    pb: 2,
                    display: 'inline-block'
                  }}>
                    Recent Policy Activity
                  </Typography>
                  
                  <Grid container spacing={4}>
                    {[
                      { 
                        title: 'Active Interventions', 
                        value: policyImpactData.overview.recent_policy_activity.interventions_deployed,
                        units: 'Programs currently deployed',
                        color: customTheme.primary,
                        icon: <AssessmentIcon sx={{ fontSize: 30 }} />
                      },
                      { 
                        title: 'Population Reduction', 
                        value: `${policyImpactData.overview.recent_policy_activity.population_reduction}%`,
                        units: 'Achieved through policy interventions',
                        color: customTheme.success,
                        icon: <TrendingUpIcon sx={{ fontSize: 30 }} />
                      },
                      { 
                        title: 'Community Satisfaction', 
                        value: `${policyImpactData.overview.recent_policy_activity.community_satisfaction}%`,
                        units: 'Public approval rating',
                        color: customTheme.secondary,
                        icon: <GroupsIcon sx={{ fontSize: 30 }} />
                      },
                      { 
                        title: 'Cost Efficiency', 
                        value: `${policyImpactData.overview.recent_policy_activity.cost_efficiency}%`,
                        units: 'Budget utilization efficiency',
                        color: customTheme.accent,
                        icon: <MoneyIcon sx={{ fontSize: 30 }} />
                      }
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 5,
                            background: `
                              radial-gradient(circle at 20% 80%, ${alpha(item.color, 0.12)} 0%, transparent 50%),
                              linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.05)} 100%)
                            `,
                            border: `3px solid ${alpha(item.color, 0.25)}`,
                            textAlign: 'center',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.05)',
                              boxShadow: `0 20px 40px ${alpha(item.color, 0.3)}`,
                              border: `3px solid ${alpha(item.color, 0.4)}`,
                              '&::before': {
                                transform: 'translateX(100%)'
                              }
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: `linear-gradient(90deg, transparent, ${alpha(item.color, 0.1)}, transparent)`,
                              transition: 'transform 0.6s ease'
                            }
                          }}
                        >
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontSize: '2rem',
                              mb: 1,
                              
                            }}
                          >
                            {item.icon}
                          </Typography>
                          <Typography variant="h4" sx={{ color: item.color, fontWeight: 900, mb: 1 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                            {item.units}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Program Effectiveness Tab */}
          {activeTab === 'interventions' && (
            <Card 
              sx={{ 
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                `,
                backdropFilter: 'blur(25px)',
                border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 4s ease infinite`
                }
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 800, 
                  mb: 5,
                  borderBottom: `4px solid ${customTheme.accent}`,
                  pb: 2,
                  display: 'inline-block'
                }}>
                  Program Effectiveness Analysis
                </Typography>
                
                <Grid container spacing={4}>
                  {policyImpactData.interventions.programs?.map((program, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 6,
                            background: `
                              radial-gradient(circle at 20% 80%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 50%),
                              linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.7)} 100%)
                            `,
                            border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-12px) scale(1.02)',
                              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.25)}`,
                              border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                              '&::before': {
                                transform: 'translateX(100%)'
                              }
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: `linear-gradient(90deg, transparent, ${alpha(customTheme.primary, 0.1)}, transparent)`,
                              transition: 'transform 0.6s ease'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                              <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, flex: 1 }}>
                                {program.name}
                              </Typography>
                              <Chip
                                label={program.status}
                                sx={{
                                  backgroundColor: program.status === 'Active' ? customTheme.success : customTheme.accent,
                                  color: 'white',
                                  fontWeight: 700,
                                  px: 2,
                                  py: 1,
                                  animation: program.status === 'Active' ? `${glow} 2s infinite alternate` : 'none'
                                }}
                              />
                            </Box>
                            
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    background: `
                                      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                                      linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)
                                    `,
                                    textAlign: 'center',
                                    border: `2px solid ${alpha(getEffectivenessColor(program.effectiveness), 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: `0 8px 25px ${alpha(getEffectivenessColor(program.effectiveness), 0.3)}`
                                    }
                                  }}
                                >
                                  <Typography 
                                    variant="h5" 
                                    sx={{ 
                                      color: getEffectivenessColor(program.effectiveness),
                                      fontWeight: 900,
                                      mb: 1
                                    }}
                                  >
                                    {program.effectiveness}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                    Effectiveness
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    background: `
                                      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                                      linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)
                                    `,
                                    textAlign: 'center',
                                    border: `2px solid ${alpha(getROIColor(program.roi), 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: `0 8px 25px ${alpha(getROIColor(program.roi), 0.3)}`
                                    }
                                  }}
                                >
                                  <Typography 
                                    variant="h5" 
                                    sx={{ 
                                      color: getROIColor(program.roi),
                                      fontWeight: 900,
                                      mb: 1
                                    }}
                                  >
                                    {program.roi}x
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                    ROI
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    background: `
                                      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                                      linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)
                                    `,
                                    textAlign: 'center',
                                    border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                                    }
                                  }}
                                >
                                  <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 900, mb: 1 }}>
                                    {formatCurrency(program.investment)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                    Investment
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    background: `
                                      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                                      linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)
                                    `,
                                    textAlign: 'center',
                                    border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.3)}`
                                    }
                                  }}
                                >
                                  <Typography variant="h6" sx={{ color: customTheme.secondary, fontWeight: 900, mb: 1 }}>
                                    {program.animals_treated || program.people_reached || program.areas_enforced}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                    {program.animals_treated ? 'Animals' : program.people_reached ? 'People' : 'Areas'}
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                            
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.8), mb: 2, fontWeight: 600 }}>
                              <strong>Coverage:</strong> {program.areas_covered.join(', ')}
                            </Typography>
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                              <strong>Timeline:</strong> {program.timeline}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Policy Trends Tab */}
          {activeTab === 'trends' && (
            <Card 
              sx={{ 
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                `,
                backdropFilter: 'blur(25px)',
                border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 4s ease infinite`
                }
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 800, 
                  mb: 5,
                  borderBottom: `4px solid ${customTheme.accent}`,
                  pb: 2,
                  display: 'inline-block'
                }}>
                  Policy Impact Trends
                </Typography>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    borderRadius: 5,
                    background: `
                      radial-gradient(circle at 20% 80%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 50%),
                      linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.7)} 100%)
                    `,
                    mb: 5,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'end', 
                    justifyContent: 'space-between',
                    height: 300,
                    px: 3
                  }}>
                    {policyImpactData.trends.policy_trends?.map((period, index) => {
                      const maxPopulation = Math.max(...(policyImpactData.trends.policy_trends?.map(p => p.population) || [1]));
                      const height = Math.max(30, (period.population / maxPopulation) * 250);
                      
                      return (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                          <Box 
                            sx={{
                              width: 70,
                              height: `${height}px`,
                              background: index === 0 ? 
                                `linear-gradient(180deg, #f44336, ${alpha('#f44336', 0.7)})` : 
                                `linear-gradient(180deg, ${customTheme.success}, ${alpha(customTheme.success, 0.7)})`,
                              borderRadius: '12px 12px 0 0',
                              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              cursor: 'pointer',
                              margin: '0 10px',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'scale(1.1) translateY(-6px)',
                                boxShadow: `0 15px 35px ${alpha(customTheme.primary, 0.4)}`,
                                '&::before': {
                                  transform: 'translateY(0)'
                                }
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(180deg, ${alpha('#ffffff', 0.3)}, transparent)`,
                                transform: 'translateY(-100%)',
                                transition: 'transform 0.3s ease'
                              }
                            }}
                            title={`${period.period}: ${period.population} population, ${period.incidents} incidents`}
                          />
                          <Typography variant="caption" sx={{ 
                            color: customTheme.primary, 
                            fontWeight: 700,
                            mt: 2,
                            display: 'block'
                          }}>
                            {period.period}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
                
                <Grid container spacing={4}>
                  {[
                    { 
                      label: 'Population Reduction', 
                      value: `-${policyImpactData.trends.trend_summary.population_reduction}%`,
                      color: customTheme.success,
                      icon: '📉'
                    },
                    { 
                      label: 'Incident Reduction', 
                      value: `-${policyImpactData.trends.trend_summary.incident_reduction}%`,
                      color: customTheme.primary,
                      icon: '🔻'
                    },
                    { 
                      label: 'Cost Reduction', 
                      value: `-${policyImpactData.trends.trend_summary.cost_reduction}%`,
                      color: customTheme.accent,
                      icon: '💰'
                    },
                    { 
                      label: 'Satisfaction Increase', 
                      value: `+${policyImpactData.trends.trend_summary.satisfaction_increase}%`,
                      color: customTheme.secondary,
                      icon: '📈'
                    }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: 5,
                          background: `
                            radial-gradient(circle at 20% 80%, ${alpha(item.color, 0.12)} 0%, transparent 50%),
                            linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(item.color, 0.05)} 100%)
                          `,
                          border: `3px solid ${alpha(item.color, 0.25)}`,
                          textAlign: 'center',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.05)',
                            boxShadow: `0 20px 40px ${alpha(item.color, 0.3)}`,
                            border: `3px solid ${alpha(item.color, 0.4)}`,
                            '&::before': {
                              transform: 'translateX(100%)'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha(item.color, 0.1)}, transparent)`,
                            transition: 'transform 0.6s ease'
                          }
                        }}
                      >
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontSize: '2rem',
                            mb: 1,
                           
                          }}
                        >
                          {item.icon}
                        </Typography>
                        <Typography variant="h4" sx={{ color: item.color, fontWeight: 900, mb: 1 }}>
                          {item.value}
                        </Typography>
                        <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Success Outcomes Tab */}
          {activeTab === 'outcomes' && (
            <Card 
              sx={{ 
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                `,
                backdropFilter: 'blur(25px)',
                border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 4s ease infinite`
                }
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 800, 
                  mb: 5,
                  borderBottom: `4px solid ${customTheme.accent}`,
                  pb: 2,
                  display: 'inline-block'
                }}>
                  Policy Success Outcomes
                </Typography>
                
                <Grid container spacing={4}>
                  {policyImpactData.outcomes.success_programs?.map((success, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-12px) scale(1.02)',
                              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.25)}`,
                              border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                              '& .header-box': {
                                '&::before': {
                                  transform: 'translateX(100%)'
                                }
                              }
                            }
                          }}
                        >
                          <Box 
                            className="header-box"
                            sx={{ 
                              background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.accent} 100%)`,
                              color: 'white',
                              p: 4,
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                                transition: 'transform 0.6s ease'
                              }
                            }}
                          >
                            <Typography variant="h5" sx={{ fontWeight: 800, position: 'relative', zIndex: 1 }}>
                              {success.title}
                            </Typography>
                          </Box>
                          <CardContent sx={{ p: 4 }}>
                            <Typography variant="body1" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              lineHeight: 1.7,
                              mb: 4,
                              fontWeight: 500
                            }}>
                              {success.description}
                            </Typography>
                            
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                              {Object.entries(success.metrics).map(([key, value], metricIndex) => (
                                <Grid item xs={6} key={metricIndex}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 3,
                                      borderRadius: 4,
                                      background: `
                                        radial-gradient(circle at 20% 80%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 50%),
                                        linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.7)} 100%)
                                      `,
                                      textAlign: 'center',
                                      border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                                      }
                                    }}
                                  >
                                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 900, mb: 1 }}>
                                      {typeof value === 'number' && key.includes('cost') ? formatCurrency(value) : 
                                       typeof value === 'number' && (key.includes('percentage') || key.includes('reduction') || key.includes('change') || key.includes('increase')) ? `${value}%` :
                                       value}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 700 }}>
                                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                            
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.8), mb: 3, fontWeight: 600 }}>
                              <strong>Area:</strong> {success.area} | <strong>Timeline:</strong> {success.timeline}
                            </Typography>
                            
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 4,
                                background: `
                                  radial-gradient(circle at 20% 80%, ${alpha(customTheme.success, 0.12)} 0%, transparent 50%),
                                  linear-gradient(135deg, ${alpha(customTheme.success, 0.08)} 0%, ${alpha(customTheme.success, 0.05)} 100%)
                                `,
                                border: `2px solid ${alpha(customTheme.success, 0.25)}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-100%',
                                  width: '100%',
                                  height: '100%',
                                  background: `linear-gradient(90deg, transparent, ${alpha(customTheme.success, 0.1)}, transparent)`,
                                  animation: `${shimmer} 3s infinite`
                                }
                              }}
                            >
                              <Typography variant="body2" sx={{ color: customTheme.success, fontWeight: 700, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SecurityIcon sx={{ fontSize: 16 }} />
                                <strong>Outcome:</strong> {success.outcome}
                              </Typography>
                            </Paper>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Strategic Impact Tab */}
          {activeTab === 'strategic' && (
            <Card 
              sx={{ 
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                `,
                backdropFilter: 'blur(25px)',
                border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 4s ease infinite`
                }
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 800, 
                  mb: 5,
                  borderBottom: `4px solid ${customTheme.accent}`,
                  pb: 2,
                  display: 'inline-block'
                }}>
                  Strategic Impact Assessment
                </Typography>
                
                <Grid container spacing={4}>
                  {/* Public Health Impact */}
                  <Grid item xs={12} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 6,
                        background: `
                          radial-gradient(circle at 20% 80%, ${alpha(customTheme.success, 0.12)} 0%, transparent 50%),
                          linear-gradient(135deg, ${alpha(customTheme.success, 0.08)} 0%, ${alpha(customTheme.success, 0.05)} 100%)
                        `,
                        border: `3px solid ${alpha(customTheme.success, 0.25)}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.success, 0.3)}`,
                          border: `3px solid ${alpha(customTheme.success, 0.4)}`,
                          '&::before': {
                            transform: 'translateX(100%)'
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(customTheme.success, 0.1)}, transparent)`,
                          transition: 'transform 0.6s ease'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        <Typography variant="h5" sx={{ color: customTheme.success, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <HospitalIcon sx={{ fontSize: 30, color: customTheme.success }} />
                          Public Health Impact
                        </Typography>
                        {Object.entries(policyImpactData.strategic_impact.public_health).map(([key, value]) => (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </Typography>
                            <Typography variant="body1" sx={{ color: customTheme.success, fontWeight: 800 }}>
                              {value}%
                            </Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Economic Impact */}
                  <Grid item xs={12} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 6,
                        background: `
                          radial-gradient(circle at 20% 80%, ${alpha(customTheme.primary, 0.12)} 0%, transparent 50%),
                          linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)
                        `,
                        border: `3px solid ${alpha(customTheme.primary, 0.25)}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.3)}`,
                          border: `3px solid ${alpha(customTheme.primary, 0.4)}`,
                          '&::before': {
                            transform: 'translateX(100%)'
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(customTheme.primary, 0.1)}, transparent)`,
                          transition: 'transform 0.6s ease'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BusinessIcon sx={{ fontSize: 30, color: customTheme.primary }} />
                          Economic Impact
                        </Typography>
                        {Object.entries(policyImpactData.strategic_impact.economic_impact).map(([key, value]) => (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </Typography>
                            <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                              {key.includes('investment') || key.includes('savings') ? formatCurrency(value) : 
                               key.includes('percentage') || key.includes('efficiency') || key.includes('roi') ? `${value}%` :
                               `${value}x`}
                            </Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Social Impact */}
                  <Grid item xs={12} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 6,
                        background: `
                          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.12)} 0%, transparent 50%),
                          linear-gradient(135deg, ${alpha(customTheme.accent, 0.08)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)
                        `,
                        border: `3px solid ${alpha(customTheme.accent, 0.25)}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.accent, 0.3)}`,
                          border: `3px solid ${alpha(customTheme.accent, 0.4)}`,
                          '&::before': {
                            transform: 'translateX(100%)'
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(customTheme.accent, 0.1)}, transparent)`,
                          transition: 'transform 0.6s ease'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        <Typography variant="h5" sx={{ color: customTheme.accent, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <PeopleIcon sx={{ fontSize: 30, color: customTheme.accent }} />
                          Social Impact
                        </Typography>
                        {Object.entries(policyImpactData.strategic_impact.social_impact).map(([key, value]) => (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </Typography>
                            <Typography variant="body1" sx={{ color: customTheme.accent, fontWeight: 800 }}>
                              {value}{key.includes('engagement') ? '' : '%'}
                            </Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    );
  }

  // ENHANCED Shelter Impact Dashboard - REMOVED "My Impact" section
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 15% 85%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
        radial-gradient(circle at 85% 15%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.4)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '4%',
          left: '4%',
          animation: `${floatingIcon} 12s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <Box sx={{ 
          width: 50, 
          height: 50, 
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, ${customTheme.accent}, ${alpha(customTheme.accent, 0.7)})
          `,
          filter: 'blur(1px)',
          animation: `${glow} 3s ease-in-out infinite alternate`
        }} />
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          top: '18%',
          right: '8%',
          animation: `${floatingIcon} 15s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.4
        }}
      >
        <Box sx={{ 
          width: 70, 
          height: 70, 
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, ${customTheme.primary}, ${alpha(customTheme.primary, 0.6)})
          `,
          transform: 'rotate(25deg)',
          animation: `${morphing} 15s ease-in-out infinite`
        }} />
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '6%',
          animation: `${floatingIcon} 18s ease-in-out infinite`,
          animationDelay: '8s',
          opacity: 0.5
        }}
      >
        <Box sx={{ 
          width: 55, 
          height: 55, 
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, ${customTheme.secondary}, ${alpha(customTheme.secondary, 0.6)})
          `,
          transform: 'rotate(-15deg)',
          animation: `${glow} 4s ease-in-out infinite alternate`
        }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 8,
            position: 'relative'
          }}>
            {/* Floating sparkles around header */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                left: '20%',
                animation: `${sparkle} 4s infinite`,
                animationDelay: '0s'
              }}
            >
              <Box sx={{ 
                width: 30, 
                height: 30, 
                borderRadius: '50%',
                background: `radial-gradient(circle, ${customTheme.accent}, ${alpha(customTheme.accent, 0.7)})`,
                animation: `${glow} 2s infinite alternate`
              }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: '25%',
                animation: `${sparkle} 4s infinite`,
                animationDelay: '2s'
              }}
            >
              <Box sx={{ 
                width: 25, 
                height: 25, 
                borderRadius: '50%',
                background: `radial-gradient(circle, ${customTheme.secondary}, ${alpha(customTheme.secondary, 0.7)})`,
                animation: `${glow} 2s infinite alternate`
              }} />
            </Box>
            
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 900,
                background: `linear-gradient(45deg, ${customTheme.primary} 15%, ${customTheme.accent} 45%, ${customTheme.secondary} 75%)`,
                backgroundSize: '300% 300%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 5s ease infinite`,
                mb: 3,
                textShadow: '0 8px 16px rgba(0,0,0,0.1)',
                letterSpacing: '-0.03em'
              }}
            >
              Shelter Impact Dashboard
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 500,
                maxWidth: 750,
                mx: 'auto',
                lineHeight: 1.7,
                mb: 4,
                animation: `${slideInUp} 1s ease-out 0.3s both`
              }}
            >
              Track the comprehensive impact we're making in animal rescue and care operations with real-time insights
            </Typography>
          </Box>
        </Fade>

        {/* Enhanced Error Alert */}
        {error && (
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 6,
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, ${alpha('#f44336', 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha('#f44336', 0.08)} 0%, ${alpha('#f44336', 0.05)} 100%)
                `,
                border: `3px solid ${alpha('#f44336', 0.3)}`,
                color: '#c62828',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha('#f44336', 0.1)}, transparent)`,
                  animation: `${shimmer} 3s infinite`
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, zIndex: 1, position: 'relative' }}>
                ⚠️ {error}
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Enhanced Tab Navigation */}
        <Box sx={{ 
          mb: 6,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 6,
              background: `
                radial-gradient(circle at 20% 80%, ${alpha(customTheme.background, 0.95)} 0%, transparent 50%),
                linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
              `,
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              backdropFilter: 'blur(25px)',
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 15px 35px ${alpha(customTheme.primary, 0.1)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                animation: `${gradientShift} 3s ease infinite`
              }
            }}
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'impact', label: 'Impact Breakdown' },
              { id: 'trends', label: 'Trends' },
              { id: 'stories', label: 'Success Stories' },
              // Only show "My Impact" for non-shelter users
              ...(user?.user_type !== 'SHELTER' ? [{ id: 'personal', label: 'My Impact' }] : [])
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'contained' : 'text'}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 2,
                  minWidth: 140,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  ...(activeTab === tab.id ? {
                    background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                    color: 'white',
                    boxShadow: `0 12px 30px ${alpha(customTheme.primary, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: `0 15px 40px ${alpha(customTheme.primary, 0.5)}`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                      animation: `${shimmer} 2s infinite`
                    }
                  } : {
                    color: customTheme.primary,
                    '&:hover': {
                      backgroundColor: alpha(customTheme.primary, 0.1),
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                    }
                  })
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Paper>
        </Box>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Box>
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {impactData.overview.quick_stats?.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: `
                          radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                          radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.95) 0%, transparent 50%),
                          linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)
                        `,
                        backdropFilter: 'blur(30px)',
                        border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.03)',
                          boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.25)}`,
                          border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                          '&::before': {
                            transform: 'translateX(100%)'
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(customTheme.primary, 0.1)}, transparent)`,
                          transition: 'transform 0.6s ease'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 5, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontWeight: 900,
                            background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2,
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            <Card 
              sx={{ 
                borderRadius: 6,
                background: `
                  radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                `,
                backdropFilter: 'blur(25px)',
                border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 4s ease infinite`
                }
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 800, 
                  mb: 5,
                  borderBottom: `4px solid ${customTheme.accent}`,
                  pb: 2,
                  display: 'inline-block'
                }}>
                  Recent Activity (Last 30 Days)
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 5,
                        borderRadius: 5,
                        background: `
                          radial-gradient(circle at 20% 80%, ${alpha(customTheme.success, 0.12)} 0%, transparent 50%),
                          linear-gradient(135deg, ${alpha(customTheme.success, 0.08)} 0%, ${alpha(customTheme.success, 0.05)} 100%)
                        `,
                        border: `3px solid ${alpha(customTheme.success, 0.25)}`,
                        textAlign: 'center',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.success, 0.3)}`,
                          border: `3px solid ${alpha(customTheme.success, 0.4)}`,
                          '&::before': {
                            transform: 'translateX(100%)'
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(customTheme.success, 0.1)}, transparent)`,
                          transition: 'transform 0.6s ease'
                        }
                      }}
                    >
                      <Box sx={{ color: customTheme.success, mb: 2 }}>
                        <MoneyIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="h4" sx={{ color: customTheme.success, fontWeight: 900, mb: 2 }}>
                        {formatCurrency(impactData.overview.recent_activity?.donations_30_days || 0)}
                      </Typography>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
                        Donations Received
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        {impactData.overview.recent_activity?.donations_count_30_days || 0} individual donations
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 5,
                        borderRadius: 5,
                        background: `
                          radial-gradient(circle at 20% 80%, ${alpha(customTheme.secondary, 0.12)} 0%, transparent 50%),
                          linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)
                        `,
                        border: `3px solid ${alpha(customTheme.secondary, 0.25)}`,
                        textAlign: 'center',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.secondary, 0.3)}`,
                          border: `3px solid ${alpha(customTheme.secondary, 0.4)}`,
                          '&::before': {
                            transform: 'translateX(100%)'
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(customTheme.secondary, 0.1)}, transparent)`,
                          transition: 'transform 0.6s ease'
                        }
                      }}
                    >
                      <Box sx={{ color: customTheme.secondary, mb: 2 }}>
                        <BookIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 900, mb: 2 }}>
                        {impactData.overview.recent_activity?.featured_stories || 0}
                      </Typography>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
                        Featured Stories
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        New success stories shared
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Impact Breakdown Tab */}
        {activeTab === 'impact' && (
          <Card 
            sx={{ 
              borderRadius: 6,
              background: `
                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(25px)',
              border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                animation: `${gradientShift} 4s ease infinite`
              }
            }}
          >
            <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary, 
                fontWeight: 800, 
                mb: 5,
                borderBottom: `4px solid ${customTheme.accent}`,
                pb: 2,
                display: 'inline-block'
              }}>
                Impact by Category
              </Typography>
              
              <Grid container spacing={4}>
                {impactData.breakdown.breakdown?.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 6,
                          background: `
                            radial-gradient(circle at 20% 80%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 50%),
                            linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.7)} 100%)
                          `,
                          border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-12px) scale(1.03)',
                            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.25)}`,
                            border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                            '&::before': {
                              transform: 'translateX(100%)'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha(customTheme.primary, 0.1)}, transparent)`,
                            transition: 'transform 0.6s ease'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 5, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 3 }}>
                            {item.category}
                          </Typography>
                          <Typography variant="h4" sx={{ 
                            color: customTheme.success, 
                            fontWeight: 900, 
                            mb: 3
                          }}>
                            {formatCurrency(item.amount)}
                          </Typography>
                          <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600, lineHeight: 1.6 }}>
                            {item.units_helped} {item.unit_name}s helped • {item.donations} donations
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <Card 
            sx={{ 
              borderRadius: 6,
              background: `
                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(25px)',
              border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                animation: `${gradientShift} 4s ease infinite`
              }
            }}
          >
            <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary, 
                fontWeight: 800, 
                mb: 5,
                borderBottom: `4px solid ${customTheme.accent}`,
                pb: 2,
                display: 'inline-block'
              }}>
                Monthly Donation Trends
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: 5,
                  background: `
                    radial-gradient(circle at 20% 80%, ${alpha(customTheme.grey, 0.5)} 0%, transparent 50%),
                    linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.7)} 100%)
                  `,
                  mb: 5,
                  border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'end', 
                  justifyContent: 'space-between',
                  height: 300,
                  px: 3
                }}>
                  {impactData.trends.monthly_trends?.map((month, index) => {
                    const maxDonation = Math.max(...(impactData.trends.monthly_trends?.map(m => m.donations) || [1]));
                    const height = Math.max(30, (month.donations / maxDonation) * 250);
                    
                    return (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Box 
                          sx={{
                            width: 60,
                            height: `${height}px`,
                            background: `linear-gradient(180deg, ${customTheme.primary}, ${alpha(customTheme.primary, 0.7)})`,
                            borderRadius: '10px 10px 0 0',
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            cursor: 'pointer',
                            margin: '0 8px',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'scale(1.1) translateY(-8px)',
                              boxShadow: `0 15px 35px ${alpha(customTheme.primary, 0.4)}`,
                              '&::before': {
                                transform: 'translateY(0)'
                              }
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(180deg, ${alpha('#ffffff', 0.3)}, transparent)`,
                              transform: 'translateY(-100%)',
                              transition: 'transform 0.3s ease'
                            }
                          }}
                          title={`${month.month}: ${formatCurrency(month.donations)}`}
                        />
                        <Typography variant="caption" sx={{ 
                          color: customTheme.primary, 
                          fontWeight: 700,
                          mt: 2,
                          display: 'block'
                        }}>
                          {month.month_short}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                  Average monthly donations: {formatCurrency(impactData.trends.trend_summary?.avg_monthly_donations || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Success Stories Tab */}
        {activeTab === 'stories' && (
          <Card 
            sx={{ 
              borderRadius: 6,
              background: `
                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.98) 0%, transparent 50%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(25px)',
              border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                animation: `${gradientShift} 4s ease infinite`
              }
            }}
          >
            <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary, 
                fontWeight: 800, 
                mb: 5,
                borderBottom: `4px solid ${customTheme.accent}`,
                pb: 2,
                display: 'inline-block'
              }}>
                Success Stories
              </Typography>
              
              {/* Featured Stories */}
              {impactData.stories.featured_stories?.length > 0 && (
                <Box sx={{ mb: 6 }}>
                  <Typography variant="h5" sx={{ color: customTheme.secondary, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StarIcon sx={{ fontSize: 30, color: customTheme.secondary }} />
                    Featured Stories
                  </Typography>
                  <Grid container spacing={4}>
                    {impactData.stories.featured_stories?.map((story, index) => (
                      <Grid item xs={12} md={6} key={`featured-${index}`}>
                        <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                          <Card 
                            sx={{ 
                              height: '100%',
                              borderRadius: 6,
                              overflow: 'hidden',
                              border: `3px solid ${alpha(customTheme.secondary, 0.3)}`,
                              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              position: 'relative',
                              '&:hover': {
                                transform: 'translateY(-12px) scale(1.02)',
                                boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.25)}`,
                                border: `3px solid ${alpha(customTheme.secondary, 0.4)}`,
                                '& .image-container': {
                                  '& img': {
                                    transform: 'scale(1.1)'
                                  }
                                }
                              }
                            }}
                          >
                            <Box className="image-container" sx={{ display: 'flex', height: 220, overflow: 'hidden' }}>
                              <Box 
                                sx={{
                                  width: '50%',
                                  backgroundImage: `url(${story.before_photo || getAnimalPlaceholder(story.id, true)})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={story.before_photo || getAnimalPlaceholder(story.id, true)}
                                  alt="Before"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                  }}
                                />
                                <Chip
                                  label="Before"
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    animation: `${glow} 2s infinite alternate`
                                  }}
                                />
                              </Box>
                              <Box 
                                sx={{
                                  width: '50%',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={story.after_photo || getAnimalPlaceholder(story.id, false)}
                                  alt="After"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                  }}
                                />
                                <Chip
                                  label="After"
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    animation: `${glow} 2s infinite alternate`
                                  }}
                                />
                              </Box>
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Chip
                                  label="Featured"
                                  sx={{
                                    backgroundColor: customTheme.secondary,
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    mr: 2,
                                    animation: `${glow} 2s infinite alternate`
                                  }}
                                />
                                <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                                  {story.title}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                lineHeight: 1.7,
                                mb: 3,
                                fontWeight: 500
                              }}>
                                {story.story_text.substring(0, 120)}...
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" sx={{ color: customTheme.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PetsIcon sx={{ fontSize: 16 }} />
                                  {story.animal_name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: customTheme.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <MoneyIcon sx={{ fontSize: 16 }} />
                                  {formatCurrency(story.total_cost)}
                                </Typography>
                              </Box>
                              {story.days_to_adoption && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimelineIcon sx={{ fontSize: 14 }} />
                                    {story.days_to_adoption} days to adoption
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupsIcon sx={{ fontSize: 14 }} />
                                    {story.donations_count} donors
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Recent Stories */}
              {impactData.stories.recent_stories?.length > 0 && (
                <Box>
                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <NewsIcon sx={{ fontSize: 30, color: customTheme.primary }} />
                    Recent Stories
                  </Typography>
                  <Grid container spacing={4}>
                    {impactData.stories.recent_stories?.map((story, index) => (
                      <Grid item xs={12} md={6} key={`recent-${index}`}>
                        <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                          <Card 
                            sx={{ 
                              height: '100%',
                              borderRadius: 6,
                              overflow: 'hidden',
                              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              position: 'relative',
                              '&:hover': {
                                transform: 'translateY(-12px) scale(1.02)',
                                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.25)}`,
                                border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                                '& .image-container': {
                                  '& img': {
                                    transform: 'scale(1.1)'
                                  }
                                }
                              }
                            }}
                          >
                            <Box className="image-container" sx={{ display: 'flex', height: 220, overflow: 'hidden' }}>
                              <Box 
                                sx={{
                                  width: '50%',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={story.before_photo || getAnimalPlaceholder(story.id, true)}
                                  alt="Before"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                  }}
                                />
                                <Chip
                                  label="Before"
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 700
                                  }}
                                />
                              </Box>
                              <Box 
                                sx={{
                                  width: '50%',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={story.after_photo || getAnimalPlaceholder(story.id, false)}
                                  alt="After"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                  }}
                                />
                                <Chip
                                  label="After"
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 700
                                  }}
                                />
                              </Box>
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                              <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 800, mb: 3 }}>
                                {story.title}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                lineHeight: 1.7,
                                mb: 3,
                                fontWeight: 500
                              }}>
                                {story.story_text.substring(0, 120)}...
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" sx={{ color: customTheme.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PetsIcon sx={{ fontSize: 16 }} />
                                  {story.animal_name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: customTheme.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <MoneyIcon sx={{ fontSize: 16 }} />
                                  {formatCurrency(story.total_cost)}
                                </Typography>
                              </Box>
                              {story.days_to_adoption && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimelineIcon sx={{ fontSize: 14 }} />
                                    {story.days_to_adoption} days to adoption
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupsIcon sx={{ fontSize: 14 }} />
                                    {story.donations_count} donors
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* No Stories Message */}
              {(!impactData.stories.featured_stories?.length && !impactData.stories.recent_stories?.length) && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Box sx={{ 
                    mb: 4,
                    color: alpha(customTheme.primary, 0.4),
                    animation: `${float} 3s ease-in-out infinite`
                  }}>
                    <BookIcon sx={{ fontSize: 80 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                    No success stories available yet. Check back soon for inspiring animal rescue stories!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Personal Impact Tab - Only for non-shelter users */}
        {activeTab === 'personal' && user?.user_type !== 'SHELTER' && (
          <Card 
            sx={{ 
              borderRadius: 6,
              background: `
                radial-gradient(circle at 20% 80%, ${customTheme.primary} 0%, ${customTheme.accent} 70%),
                linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.accent} 100%)
              `,
              color: 'white',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${alpha('#ffffff', 0.3)}, ${alpha('#ffffff', 0.1)}, ${alpha('#ffffff', 0.3)})`,
                animation: `${shimmer} 3s infinite`
              }
            }}
          >
            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 250,
                height: 250,
                background: `radial-gradient(circle, ${alpha('#ffffff', 0.15)} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
                animation: `${morphing} 20s ease-in-out infinite`
              }}
            />
            
            <CardContent sx={{ p: 8, position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 900, 
                textAlign: 'center',
                mb: 6,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}>
                Your Personal Impact
              </Typography>
              
              <Grid container spacing={5} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 6,
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
                          linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)
                        `,
                        backdropFilter: 'blur(15px)',
                        border: `2px solid ${alpha('#ffffff', 0.3)}`,
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: `0 20px 40px ${alpha('#000000', 0.2)}`,
                          border: `2px solid ${alpha('#ffffff', 0.5)}`
                        }
                      }}
                    >
                      <Box sx={{ color: 'white', mb: 2 }}>
                        <MoneyIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                        {formatCurrency(impactData.personalImpact.personal_stats?.total_donated || 0)}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                        Total Donated
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 6,
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
                          linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)
                        `,
                        backdropFilter: 'blur(15px)',
                        border: `2px solid ${alpha('#ffffff', 0.3)}`,
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: `0 20px 40px ${alpha('#000000', 0.2)}`,
                          border: `2px solid ${alpha('#ffffff', 0.5)}`
                        }
                      }}
                    >
                      <Box sx={{ color: 'white', mb: 2 }}>
                        <PetsIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                        {impactData.personalImpact.personal_stats?.animals_helped || 0}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                        Animals Helped
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 6,
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
                          linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)
                        `,
                        backdropFilter: 'blur(15px)',
                        border: `2px solid ${alpha('#ffffff', 0.3)}`,
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: `0 20px 40px ${alpha('#000000', 0.2)}`,
                          border: `2px solid ${alpha('#ffffff', 0.5)}`
                        }
                      }}
                    >
                      <Box sx={{ color: 'white', mb: 2 }}>
                        <AssessmentIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                        {impactData.personalImpact.personal_stats?.donations_count || 0}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                        Donations Made
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    borderRadius: 6,
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
                      linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)
                    `,
                    backdropFilter: 'blur(15px)',
                    border: `2px solid ${alpha('#ffffff', 0.3)}`,
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha('#000000', 0.2)}`,
                      border: `2px solid ${alpha('#ffffff', 0.5)}`
                    }
                  }}
                >
                  <Box sx={{ color: 'white', mb: 2 }}>
                    <TrophyIcon sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                    {getDonorLevelEmoji(impactData.personalImpact.personal_stats?.donor_level)} Donor
                  </Typography>
                  {impactData.personalImpact.donor_level_info?.next_level && (
                    <Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 16, 
                        backgroundColor: alpha('#ffffff', 0.3),
                        borderRadius: 8,
                        overflow: 'hidden',
                        mb: 3,
                        position: 'relative'
                      }}>
                        <Box 
                          sx={{
                            width: `${impactData.personalImpact.donor_level_info.progress_percentage}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${alpha('#ffffff', 0.9)}, ${alpha('#ffffff', 0.7)})`,
                            borderRadius: 8,
                            transition: 'width 0.8s ease',
                            animation: `${shimmer} 2s infinite`
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                        {formatCurrency(impactData.personalImpact.donor_level_info.amount_to_next_level)} to {impactData.personalImpact.donor_level_info.next_level}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

export default ImpactDashboard;
