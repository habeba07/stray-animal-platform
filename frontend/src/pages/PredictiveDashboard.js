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
  Alert,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Pets as PetsIcon,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  Timeline as TimelineIcon,
  DataUsage as DataIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

function PredictiveDashboard() {
  const { user } = useSelector((state) => state.auth);
  
  const [dashboardData, setDashboardData] = useState({});
  const [strategicForecastData, setStrategicForecastData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState(30); // days

  useEffect(() => {
    if (user?.user_type === 'AUTHORITY') {
      fetchStrategicForecastData();
    } else {
      fetchDashboardData();
    }
  }, [user, timeframe]);

  const fetchStrategicForecastData = async () => {
    try {
      setLoading(true);
      
      // Fetch strategic forecasting data for authorities
      const strategicRes = await api.get('/authority-analytics/test_endpoint/');
      
      // Mock comprehensive strategic forecasting data
      const strategicData = {
        overview: {
          strategic_indicators: [
            {
              metric: 'Population Growth Forecast',
              current: 1023,
              projected_3_months: 1156,
              projected_6_months: 1289,
              projected_12_months: 1445,
              trend: 'increasing',
              confidence: 87.3,
              change_percent: 12.7
            },
            {
              metric: 'Policy Impact Score',
              current: 78.4,
              projected_3_months: 82.1,
              projected_6_months: 85.8,
              projected_12_months: 89.2,
              trend: 'improving',
              confidence: 91.2,
              change_percent: 13.8
            },
            {
              metric: 'Budget Efficiency',
              current: 91.4,
              projected_3_months: 93.7,
              projected_6_months: 95.2,
              projected_12_months: 96.8,
              trend: 'stable',
              confidence: 89.6,
              change_percent: 5.9
            }
          ],
          ai_insights: "Strategic forecasting models predict continued population growth with improving policy effectiveness. TNR program expansion is projected to yield 23% efficiency gains within 6 months. Budget optimization opportunities identified in mobile clinic deployment."
        },
        population_forecast: {
          territory_projections: [
            { period: 'Current', total_population: 1023, high_risk_areas: 5, intervention_zones: 8, growth_rate: 0 },
            { period: '3 Months', total_population: 1156, high_risk_areas: 6, intervention_zones: 9, growth_rate: 13.0 },
            { period: '6 Months', total_population: 1289, high_risk_areas: 7, intervention_zones: 11, growth_rate: 26.0 },
            { period: '12 Months', total_population: 1445, high_risk_areas: 8, intervention_zones: 13, growth_rate: 41.3 }
          ],
          seasonal_patterns: {
            peak_season: 'Spring (Mar-May)',
            growth_acceleration: 'March (+34%)',
            optimal_intervention_period: 'January-February',
            breeding_season_impact: 'High correlation (0.78)'
          },
          risk_assessment: {
            probability_hotspot_expansion: 72.4,
            intervention_demand_increase: 45.6,
            resource_strain_likelihood: 34.2,
            policy_adjustment_needed: 'Medium Priority'
          }
        },
        policy_impact_forecast: {
          intervention_projections: [
            {
              program: 'TNR Expansion',
              current_effectiveness: 51.3,
              projected_3_months: 58.7,
              projected_6_months: 64.2,
              projected_12_months: 71.8,
              investment_required: 125000,
              roi_forecast: 2.8,
              confidence: 89.4
            },
            {
              program: 'Education Campaign Scale-up',
              current_effectiveness: 22.9,
              projected_3_months: 28.4,
              projected_6_months: 34.7,
              projected_12_months: 42.1,
              investment_required: 45000,
              roi_forecast: 3.4,
              confidence: 92.1
            },
            {
              program: 'Mobile Clinic Network',
              current_effectiveness: 45.6,
              projected_3_months: 52.3,
              projected_6_months: 58.9,
              projected_12_months: 67.4,
              investment_required: 180000,
              roi_forecast: 2.1,
              confidence: 85.7
            }
          ],
          policy_scenarios: {
            scenario_1: { name: 'Current Policy', population_impact: 'Stable growth (+41%)', budget_impact: '$1.2M annually' },
            scenario_2: { name: 'Expanded TNR', population_impact: 'Controlled growth (+28%)', budget_impact: '$1.35M annually' },
            scenario_3: { name: 'Comprehensive Strategy', population_impact: 'Population reduction (-12%)', budget_impact: '$1.45M annually' }
          }
        },
        budget_forecast: {
          financial_projections: [
            { category: 'TNR Programs', current: 450000, projected_6_months: 525000, projected_12_months: 610000, efficiency_gain: 15.2 },
            { category: 'Mobile Clinics', current: 180000, projected_6_months: 205000, projected_12_months: 235000, efficiency_gain: 12.8 },
            { category: 'Education Campaigns', current: 120000, projected_6_months: 145000, projected_12_months: 175000, efficiency_gain: 22.4 },
            { category: 'Emergency Response', current: 95000, projected_6_months: 110000, projected_12_months: 128000, efficiency_gain: 8.3 }
          ],
          cost_optimization_opportunities: [
            { area: 'Multi-zone TNR deployment', potential_savings: 45000, implementation_timeline: '4 months' },
            { area: 'Volunteer program expansion', potential_savings: 32000, implementation_timeline: '6 months' },
            { area: 'Technology automation', potential_savings: 28000, implementation_timeline: '8 months' }
          ],
          roi_predictions: {
            total_investment_12_months: 1450000,
            projected_cost_savings: 234000,
            population_management_value: 890000,
            overall_roi: 177.5
          }
        },
        territory_risk_modeling: {
          hotspot_development_forecast: [
            { area: 'Eastern Suburbs', risk_level: 'High', probability: 78.4, timeline: '3-4 months', intervention_recommended: 'Immediate TNR deployment' },
            { area: 'Industrial North', risk_level: 'Medium', probability: 54.7, timeline: '6-8 months', intervention_recommended: 'Enhanced monitoring' },
            { area: 'Commercial District', risk_level: 'Low', probability: 32.1, timeline: '12+ months', intervention_recommended: 'Routine patrols' }
          ],
          strategic_alerts: [
            {
              priority: 'critical',
              title: 'Population Growth Acceleration',
              message: 'Eastern Suburbs showing 34% faster growth than projected. Immediate intervention required.',
              recommended_actions: ['Deploy additional TNR team', 'Increase mobile clinic frequency', 'Community education blitz'],
              timeline: 'Within 2 weeks'
            },
            {
              priority: 'high',
              title: 'Budget Reallocation Needed',
              message: 'TNR program effectiveness gains warrant 15% budget increase for maximum impact.',
              recommended_actions: ['Reallocate from emergency response', 'Seek additional municipal funding', 'Expand volunteer program'],
              timeline: 'Next budget cycle'
            },
            {
              priority: 'medium',
              title: 'Seasonal Preparedness',
              message: 'Spring breeding season approaching. Historical data suggests 40% activity increase expected.',
              recommended_actions: ['Pre-position resources', 'Schedule additional staff', 'Prepare public messaging'],
              timeline: 'Next 4-6 weeks'
            }
          ]
        },
        strategic_recommendations: {
          short_term: [
            'Expand TNR program to Eastern Suburbs (immediate)',
            'Increase mobile clinic deployment frequency by 25%',
            'Launch targeted education campaign in high-growth areas'
          ],
          medium_term: [
            'Establish permanent intervention team for Industrial North',
            'Implement technology solutions for monitoring automation',
            'Develop public-private partnerships for funding expansion'
          ],
          long_term: [
            'Achieve territory-wide population stabilization by Q4 2025',
            'Establish regional leadership in animal welfare policy',
            'Create sustainable funding model for ongoing operations'
          ]
        }
      };
      
      setStrategicForecastData(strategicData);
      
    } catch (err) {
      console.error('Failed to fetch strategic forecast data:', err);
      setError('Failed to load strategic forecasting data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Generate realistic shelter operational data based on timeframe
      const mockData = generateMockShelterData(timeframe);
      setDashboardData(mockData);
      
    } catch (err) {
      setError('Failed to load predictive analytics');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockShelterData = (days) => {
    // Generate realistic data for animal shelter operations
    const today = new Date();
    const predictions = [];
    
    // Historical patterns for animal intake (higher in spring/summer)
    const seasonalMultiplier = getSeasonalMultiplier(today.getMonth());
    const baseIntakeRate = 4; // base animals per day
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Add weekly and monthly patterns
      const weekdayMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1.0; // Higher on weekends
      const randomVariation = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3 multiplier
      
      const predictedIntake = Math.round(baseIntakeRate * seasonalMultiplier * weekdayMultiplier * randomVariation);
      const confidence = 75 + Math.random() * 20; // 75-95% confidence
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted_intake: Math.max(0, predictedIntake),
        confidence: Math.round(confidence),
        day_of_week: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    // Generate capacity predictions
    const capacityPredictions = predictions.map(p => {
      const currentOccupancy = 85; // Current capacity percentage
      const intake = p.predicted_intake;
      const adoptions = Math.round(2 + Math.random() * 3); // 2-5 adoptions per day
      
      const netChange = intake - adoptions;
      const newCapacity = Math.max(20, Math.min(100, currentOccupancy + (netChange * 2)));
      
      return {
        date: p.date,
        capacity_percentage: Math.round(newCapacity),
        predicted_occupancy: Math.round((newCapacity / 100) * 150), // 150 total capacity
        status: newCapacity > 90 ? 'critical' : newCapacity > 75 ? 'warning' : 'normal'
      };
    });
    
    // Generate resource forecasting
    const resourceData = {
      resource_forecast: {
        predictions: predictions.map(p => ({
          date: p.date,
          animals_count: p.predicted_intake,
          daily_cost: p.predicted_intake * 25 + 150, // $25 per animal + $150 base cost
          food_needed: p.predicted_intake * 2.5, // kg per day
          medical_supplies: Math.round(p.predicted_intake * 0.3) // medical supplies per animal
        })),
        summary: {
          avg_daily_cost: 275,
          total_predicted_cost: 275 * days,
          avg_daily_animals: 4.2,
          total_animals_expected: Math.round(4.2 * days)
        },
        resource_alerts: [
          {
            type: 'medical_supplies',
            message: 'Vaccination inventory running low - reorder recommended within 2 weeks',
            priority: 'medium',
            estimated_shortage_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            type: 'capacity',
            message: 'Peak season approaching - expect 30% increase in intake',
            priority: 'high',
            estimated_impact_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ]
      }
    };
    
    // Generate donation predictions with seasonal patterns
    const donationData = {
      forecast: {
        predictions: predictions.map(p => {
          const date = new Date(p.date);
          const holidayMultiplier = isNearHoliday(date) ? 2.5 : 1.0;
          const baseDonation = 150 + Math.random() * 200;
          
          return {
            date: p.date,
            predicted_amount: Math.round(baseDonation * holidayMultiplier),
            predicted_donations: Math.round(2 + Math.random() * 4),
            confidence: 70 + Math.random() * 25
          };
        }),
        optimal_fundraising_days: getOptimalFundraisingDays(days),
        model_accuracy: 82.5
      }
    };
    
    return {
      overview: {
        trend_indicators: {
          animal_intake: {
            this_week: 28,
            last_week: 24,
            trend: 'up',
            change_percent: 16.7
          },
          donations: {
            this_week: 1250,
            last_week: 980,
            trend: 'up',
            change_percent: 27.6
          }
        },
        prediction_accuracy: {
          animal_intake: 85.2,
          donations: 79.8,
          capacity: 91.3
        }
      },
      intake: {
        forecast: {
          predictions: predictions,
          model_accuracy: 85.2
        },
        recommendations: generateIntakeRecommendations(predictions)
      },
      capacity: {
        capacity_forecast: {
          predictions: capacityPredictions,
          capacity_alerts: capacityPredictions.filter(p => p.status !== 'normal').map(p => ({
            date: p.date,
            type: p.status,
            message: `Capacity ${p.status} on ${p.date} (${p.capacity_percentage}%)`,
            capacity_percentage: p.capacity_percentage
          })),
          trend_analysis: {
            trend_direction: 'increasing',
            average_capacity: Math.round(capacityPredictions.reduce((sum, p) => sum + p.capacity_percentage, 0) / capacityPredictions.length)
          }
        }
      },
      donations: donationData,
      resources: resourceData,
      alerts: {
        alerts_by_priority: {
          critical: [],
          high: [
            {
              title: 'Capacity Warning',
              message: 'Approaching capacity limits in next 2 weeks. Consider increasing adoption events.',
              recommended_actions: ['Schedule weekend adoption event', 'Contact rescue partners for transfers', 'Increase social media promotion']
            }
          ],
          medium: [
            {
              title: 'Seasonal Intake Increase',
              message: 'Historical data shows 30% increase in intake during spring season.',
              recommended_actions: ['Prepare additional kennels', 'Schedule extra veterinary visits', 'Recruit additional volunteers']
            }
          ],
          low: []
        }
      }
    };
  };

  const getSeasonalMultiplier = (month) => {
    // Higher intake in spring/summer months
    const seasonalFactors = {
      0: 1.1,  // January
      1: 1.0,  // February  
      2: 1.4,  // March
      3: 1.6,  // April
      4: 1.8,  // May
      5: 1.7,  // June
      6: 1.5,  // July
      7: 1.4,  // August
      8: 1.3,  // September
      9: 1.2,  // October
      10: 1.0, // November
      11: 0.9  // December
    };
    return seasonalFactors[month] || 1.0;
  };

  const isNearHoliday = (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    
    // Major donation periods
    return (
      (month === 11 && day > 20) || // End of year giving
      (month === 0 && day < 7) ||   // New Year
      (month === 3 && day > 10 && day < 25) || // Easter period
      (month === 10 && day > 20)    // Thanksgiving
    );
  };

  const getOptimalFundraisingDays = (days) => {
    const optimal = [];
    const today = new Date();
    
    for (let i = 0; i < Math.min(days, 10); i += 3) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      optimal.push({
        date: date.toISOString().split('T')[0],
        predicted_amount: 400 + Math.random() * 300,
        reason: 'Historical high donation day'
      });
    }
    
    return optimal;
  };

  const generateIntakeRecommendations = (predictions) => {
    const recommendations = [];
    const highDays = predictions.filter(p => p.predicted_intake > 6).length;
    const avgIntake = predictions.reduce((sum, p) => sum + p.predicted_intake, 0) / predictions.length;
    
    if (highDays > predictions.length * 0.3) {
      recommendations.push({
        priority: 'high',
        action: 'Increase staffing levels',
        reason: `${highDays} high-intake days predicted (>6 animals/day)`
      });
    }
    
    if (avgIntake > 5) {
      recommendations.push({
        priority: 'medium', 
        action: 'Prepare additional kennels',
        reason: `Average daily intake of ${avgIntake.toFixed(1)} exceeds normal capacity`
      });
    }
    
    return recommendations;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': '#d32f2f',
      'high': customTheme.accent,
      'medium': customTheme.primary,
      'low': customTheme.success
    };
    return colors[priority] || '#666';
  };

  const getTrendIcon = (trend) => {
    const iconProps = { fontSize: 'inherit' };
    const icons = {
      'up': <TrendingUpIcon {...iconProps} />,
      'down': <TrendingDownIcon {...iconProps} />,
      'stable': <TimelineIcon {...iconProps} />,
      'increasing': <TrendingUpIcon {...iconProps} />,
      'decreasing': <TrendingDownIcon {...iconProps} />,
      'improving': <TrendingUpIcon {...iconProps} />
    };
    return icons[trend] || <AssessmentIcon {...iconProps} />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return customTheme.success;
    if (confidence >= 80) return customTheme.secondary;
    if (confidence >= 70) return customTheme.accent;
    return '#f44336';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: `${float} 6s ease-in-out infinite`,
            animationDelay: '0s'
          }}
        >
          <AnalyticsIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s'
          }}
        >
          <BrainIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CircularProgress 
              size={80} 
              thickness={3}
              sx={{ 
                color: customTheme.primary,
                animation: `${pulse} 2s infinite`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${sparkle} 2s infinite`
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {user?.user_type === 'AUTHORITY' ? 'Generating Strategic Forecasts...' : 'Generating AI Predictions...'}
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Analyzing patterns and generating insights...
          </Typography>
        </Box>
      </Box>
    );
  }

  // AUTHORITY Strategic Forecasting Dashboard
  if (user?.user_type === 'AUTHORITY' && strategicForecastData) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 4, color: customTheme.primary }}>
            Authority Strategic Forecasting Dashboard
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 6, color: alpha(customTheme.primary, 0.7) }}>
            Comprehensive strategic analysis and territorial management forecasting
          </Typography>
          {/* Rest of authority dashboard implementation would go here */}
        </Container>
      </Box>
    );
  }

  // ENHANCED Shelter Operational Predictive Dashboard
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <StarIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4
        }}
      >
        <AnalyticsIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5
        }}
      >
        <BrainIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            position: 'relative'
          }}>
            {/* Floating sparkles */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                left: '30%',
                animation: `${sparkle} 3s infinite`,
                animationDelay: '0s'
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: '25%',
                animation: `${sparkle} 3s infinite`,
                animationDelay: '1s'
              }}
            >
              <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
            </Box>
            
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                animation: `${pulse} 3s infinite`
              }}
            >
              <BrainIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 4s ease infinite`,
                mb: 2,
                textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em'
              }}
            >
              Predictive Analytics Dashboard
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 3,
                animation: `${slideInUp} 1s ease-out 0.3s both`
              }}
            >
              AI-powered forecasting for optimal shelter operations and resource planning
            </Typography>
          </Box>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={800}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: alpha('#f44336', 0.1),
                border: `2px solid ${alpha('#f44336', 0.3)}`,
                backdropFilter: 'blur(10px)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                  color: '#f44336'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Controls Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: customTheme.primary,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 48,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: customTheme.accent,
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    color: customTheme.accent,
                    fontWeight: 700
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: customTheme.accent,
                  height: 3,
                  borderRadius: 2
                }
              }}
            >
              <Tab icon={<DashboardIcon />} label="Overview" value="overview" />
              <Tab icon={<PetsIcon />} label="Animal Intake" value="intake" />
              <Tab icon={<HomeIcon />} label="Capacity" value="capacity" />
              <Tab icon={<InventoryIcon />} label="Resources" value="resources" />
              <Tab icon={<WarningIcon />} label="Smart Alerts" value="alerts" />
            </Tabs>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(customTheme.primary, 0.3),
                    borderWidth: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: customTheme.secondary
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: customTheme.primary
                  }
                }}
              >
                <MenuItem value={30}>30 Days</MenuItem>
                <MenuItem value={60}>60 Days</MenuItem>
                <MenuItem value={90}>90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData.overview && (
          <Fade in timeout={800}>
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: '1.2em' }} />
                  Operational Overview
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800, mb: 1 }}>
                        {dashboardData.overview.trend_indicators.animal_intake?.this_week || 0}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 2 }}>
                        Animals This Week
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {getTrendIcon(dashboardData.overview.trend_indicators.animal_intake?.trend)}
                        <Typography variant="body1" sx={{ color: customTheme.accent, fontWeight: 600 }}>
                          {dashboardData.overview.trend_indicators.animal_intake?.change_percent || 0}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.secondary, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ color: customTheme.secondary, fontWeight: 800, mb: 1 }}>
                        {formatCurrency(dashboardData.overview.trend_indicators.donations?.this_week || 0)}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.secondary, 0.8), fontWeight: 600, mb: 2 }}>
                        Donations This Week
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {getTrendIcon(dashboardData.overview.trend_indicators.donations?.trend)}
                        <Typography variant="body1" sx={{ color: customTheme.success, fontWeight: 600 }}>
                          {dashboardData.overview.trend_indicators.donations?.change_percent || 0}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.grey, 0.1)} 100%)`,
                        border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.accent, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ color: customTheme.accent, fontWeight: 800, mb: 1 }}>
                        {(dashboardData.overview.prediction_accuracy?.animal_intake || 0).toFixed(1)}%
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.accent, 0.8), fontWeight: 600, mb: 2 }}>
                        AI Prediction Accuracy
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <DataIcon sx={{ color: customTheme.accent }} />
                        <Typography variant="body1" sx={{ color: customTheme.accent, fontWeight: 600 }}>
                          AI Confidence
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.03)} 100%)`,
                    border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <BrainIcon sx={{ color: customTheme.secondary, fontSize: 28 }} />
                    <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                      AI Insights
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), lineHeight: 1.6 }}>
                    Based on historical patterns and current trends, our AI models predict moderate activity levels 
                    with seasonal adjustments for the selected timeframe. Key factors include donation patterns, 
                    animal intake cycles, and capacity utilization rates.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Animal Intake Tab */}
        {activeTab === 'intake' && dashboardData.intake && (
          <Fade in timeout={800}>
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <PetsIcon sx={{ fontSize: '1.2em' }} />
                  Animal Intake Forecast
                </Typography>
                
                {dashboardData.intake.forecast && dashboardData.intake.forecast.predictions && (
                  <>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                        border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                        mb: 4,
                        height: 350
                      }}
                    >
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 3 }}>
                        30-Day Intake Prediction
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'end', 
                        justifyContent: 'space-between',
                        height: 250,
                        overflow: 'hidden',
                        px: 2
                      }}>
                        {dashboardData.intake.forecast.predictions.slice(0, 30).map((prediction, index) => {
                          const maxValue = Math.max(...dashboardData.intake.forecast.predictions.slice(0, 30).map(p => p.predicted_intake));
                          const height = Math.max(10, (prediction.predicted_intake / (maxValue || 1)) * 200);
                          
                          return (
                            <Box key={index} sx={{ textAlign: 'center', flex: 1, maxWidth: 25 }}>
                              <Box
                                sx={{
                                  height: `${height}px`,
                                  width: '100%',
                                  maxWidth: 20,
                                  backgroundColor: getConfidenceColor(prediction.confidence),
                                  borderRadius: '4px 4px 0 0',
                                  margin: '0 auto',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'scaleY(1.1)',
                                    boxShadow: `0 4px 15px ${alpha(getConfidenceColor(prediction.confidence), 0.4)}`
                                  }
                                }}
                                title={`${formatDate(prediction.date)}: ${prediction.predicted_intake} animals (${prediction.confidence}% confidence)`}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: alpha(customTheme.primary, 0.6),
                                  fontSize: '0.6rem',
                                  mt: 0.5,
                                  display: 'block',
                                  transform: 'rotate(-45deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                {formatDate(prediction.date)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.accent, 0.2)}`
                          }}
                        >
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                            Forecast Summary
                          </Typography>
                          <Box sx={{ '& > *': { mb: 1 } }}>
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                              <strong>Average daily intake:</strong> {(dashboardData.intake.forecast.predictions.reduce((sum, p) => sum + p.predicted_intake, 0) / dashboardData.intake.forecast.predictions.length).toFixed(1)} animals
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                              <strong>High intake days:</strong> {dashboardData.intake.forecast.predictions.filter(p => p.predicted_intake > 6).length}
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                              <strong>Model accuracy:</strong> {dashboardData.intake.forecast.model_accuracy}%
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                              <strong>Peak days:</strong> Weekends typically show 30% higher intake
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.success, 0.2)}`
                          }}
                        >
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                            Recommendations
                          </Typography>
                          <Box component="ul" sx={{ margin: 0, paddingLeft: 2, '& li': { mb: 1 } }}>
                            {dashboardData.intake.recommendations?.map((rec, index) => (
                              <Typography component="li" key={index} variant="body2" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                                <strong>{rec.action}:</strong> {rec.reason}
                              </Typography>
                            )) || (
                              <Typography component="li" variant="body2" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                                Monitor intake patterns closely during predicted high-activity periods
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Capacity Tab */}
        {activeTab === 'capacity' && dashboardData.capacity && (
          <Fade in timeout={800}>
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <HomeIcon sx={{ fontSize: '1.2em' }} />
                  Capacity Planning
                </Typography>
                
                {dashboardData.capacity.capacity_forecast && dashboardData.capacity.capacity_forecast.predictions && (
                  <>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                        border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                        mb: 4,
                        height: 350
                      }}
                    >
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 3 }}>
                        Capacity Utilization Forecast
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'end', 
                        justifyContent: 'space-between',
                        height: 250,
                        overflow: 'hidden',
                        px: 2
                      }}>
                        {dashboardData.capacity.capacity_forecast.predictions.slice(0, 30).map((prediction, index) => {
                          const height = Math.max(10, (prediction.capacity_percentage / 100) * 200);
                          const color = prediction.status === 'critical' ? '#f44336' : 
                                      prediction.status === 'warning' ? customTheme.accent : customTheme.success;
                          
                          return (
                            <Box key={index} sx={{ textAlign: 'center', flex: 1, maxWidth: 25 }}>
                              <Box
                                sx={{
                                  height: `${height}px`,
                                  width: '100%',
                                  maxWidth: 20,
                                  backgroundColor: color,
                                  borderRadius: '4px 4px 0 0',
                                  margin: '0 auto',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'scaleY(1.1)',
                                    boxShadow: `0 4px 15px ${alpha(color, 0.4)}`
                                  }
                                }}
                                title={`${formatDate(prediction.date)}: ${prediction.capacity_percentage}% capacity (${prediction.predicted_occupancy} animals)`}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: alpha(customTheme.primary, 0.6),
                                  fontSize: '0.6rem',
                                  mt: 0.5,
                                  display: 'block',
                                  transform: 'rotate(-45deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                {formatDate(prediction.date)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800, mb: 1 }}>
                            {dashboardData.capacity.capacity_forecast.capacity_alerts?.length || 0}
                          </Typography>
                          <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 1 }}>
                            Capacity Alerts
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.6) }}>
                            Days with >90% capacity
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h3" sx={{ color: customTheme.secondary, fontWeight: 800, mb: 1 }}>
                            {dashboardData.capacity.capacity_forecast.trend_analysis?.average_capacity || 0}%
                          </Typography>
                          <Typography variant="h6" sx={{ color: alpha(customTheme.secondary, 0.8), fontWeight: 600, mb: 1 }}>
                            Average Capacity
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(customTheme.secondary, 0.6) }}>
                            Over forecast period
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="h3" sx={{ color: customTheme.accent, fontWeight: 800, mb: 1 }}>
                            150
                          </Typography>
                          <Typography variant="h6" sx={{ color: alpha(customTheme.accent, 0.8), fontWeight: 600, mb: 1 }}>
                            Maximum Capacity
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(customTheme.accent, 0.6) }}>
                            Total kennel spaces
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && dashboardData.resources && (
          <Fade in timeout={800}>
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <InventoryIcon sx={{ fontSize: '1.2em' }} />
                  Resource Forecasting
                </Typography>
                
                {dashboardData.resources.resource_forecast && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                          border: `2px solid ${alpha(customTheme.success, 0.2)}`
                        }}
                      >
                        <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                          Budget Forecast
                        </Typography>
                        <Box sx={{ '& > *': { mb: 1 } }}>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Average daily cost:</strong> {formatCurrency(dashboardData.resources.resource_forecast.summary?.avg_daily_cost || 0)}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Total predicted cost:</strong> {formatCurrency(dashboardData.resources.resource_forecast.summary?.total_predicted_cost || 0)}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Average animals:</strong> {dashboardData.resources.resource_forecast.summary?.avg_daily_animals || 0}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Cost per animal/day:</strong> $25 (food, medical, care)
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                          border: `2px solid ${alpha(customTheme.accent, 0.2)}`
                        }}
                      >
                        <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                          Supply Needs
                        </Typography>
                        <Box sx={{ '& > *': { mb: 1 } }}>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Daily food requirement:</strong> ~11kg average
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Medical supplies:</strong> Variable based on intake
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Cleaning supplies:</strong> Standard consumption
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            <strong>Bedding/Toys:</strong> As needed per animal
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                          border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                        }}
                      >
                        <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ color: customTheme.accent }} />
                          Resource Alerts
                        </Typography>
                        {dashboardData.resources.resource_forecast.resource_alerts?.length > 0 ? (
                          <Box component="ul" sx={{ margin: 0, paddingLeft: 2, '& li': { mb: 1 } }}>
                            {dashboardData.resources.resource_forecast.resource_alerts.map((alert, index) => (
                              <Typography component="li" key={index} variant="body2" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                                <strong style={{color: getPriorityColor(alert.priority)}}>{alert.type}:</strong> {alert.message}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ color: customTheme.success }} />
                            <Typography variant="body1" sx={{ color: customTheme.success, fontWeight: 600 }}>
                              No resource alerts for the forecast period
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Smart Alerts Tab */}
        {activeTab === 'alerts' && dashboardData.alerts && (
          <Fade in timeout={800}>
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <WarningIcon sx={{ fontSize: '1.2em' }} />
                  Smart Alerts & Recommendations
                </Typography>
                
                {dashboardData.alerts.alerts_by_priority && (
                  <Grid container spacing={3}>
                    {Object.entries(dashboardData.alerts.alerts_by_priority).map(([priority, alerts]) => 
                      alerts.map((alert, index) => (
                        <Grid item xs={12} md={6} lg={4} key={`${priority}-${index}`}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(getPriorityColor(priority), 0.1)} 0%, ${alpha(getPriorityColor(priority), 0.05)} 100%)`,
                              border: `2px solid ${alpha(getPriorityColor(priority), 0.3)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(getPriorityColor(priority), 0.2)}`
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Chip
                                label={priority.toUpperCase()}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(priority),
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: customTheme.primary, 
                                fontWeight: 700, 
                                mb: 2 
                              }}
                            >
                              {alert.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: alpha(customTheme.primary, 0.8), 
                                mb: 2, 
                                lineHeight: 1.5 
                              }}
                            >
                              {alert.message}
                            </Typography>
                            {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: customTheme.primary, mb: 1 }}>
                                  Recommended Actions:
                                </Typography>
                                <Box component="ul" sx={{ margin: 0, paddingLeft: 2, '& li': { mb: 0.5 } }}>
                                  {alert.recommended_actions.map((action, idx) => (
                                    <Typography component="li" key={idx} variant="caption" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                                      {action}
                                    </Typography>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      ))
                    )}
                  </Grid>
                )}

                {(!dashboardData.alerts.alerts_by_priority || 
                  Object.values(dashboardData.alerts.alerts_by_priority).every(arr => arr.length === 0)) && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.success, 0.2)}`,
                      textAlign: 'center'
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 60, color: customTheme.success, mb: 2 }} />
                    <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                      All Clear!
                    </Typography>
                    <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), lineHeight: 1.5 }}>
                      No critical alerts at this time. The AI system is monitoring all metrics and will notify you of any concerns.
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

export default PredictiveDashboard;