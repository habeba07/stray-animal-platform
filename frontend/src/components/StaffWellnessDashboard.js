import React, { useState, useEffect } from 'react';

// Custom theme colors
const theme = {
  primary: '#8d6e63',
  secondary: '#81c784', 
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1'
};

const StaffWellnessDashboard = () => {
  const [mentalHealthCategories, setMentalHealthCategories] = useState([]);
  const [mentalHealthResources, setMentalHealthResources] = useState([]);
  const [selfCareReminders, setSelfCareReminders] = useState([]);
  const [stressLogs, setStressLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [stressDialogOpen, setStressDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [crisisDialogOpen, setCrisisDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Resource state
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Form states
  const [stressLevel, setStressLevel] = useState(3);
  const [stressNotes, setStressNotes] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('DAILY');
  const [reminderTime, setReminderTime] = useState('09:00');

  // Mock user data - replace with actual auth
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchWellnessData();
  }, []);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      
      const headers = {
        'Authorization': `Token ${user.token}`,
        'Content-Type': 'application/json'
      };

      const [categoriesRes, resourcesRes, remindersRes, stressRes] = await Promise.all([
        fetch('/api/mental-health-categories/'),
        fetch('/api/mental-health-resources/'),
        fetch('/api/self-care-reminders/', { headers }),
        fetch('/api/stress-logs/', { headers })
      ]);

      const categories = await categoriesRes.json();
      const resources = await resourcesRes.json();
      const reminders = await remindersRes.json();
      const stress = await stressRes.json();

      setMentalHealthCategories(categories);
      setMentalHealthResources(resources.slice(0, 6)); // Latest 6 resources
      setSelfCareReminders(reminders);
      setStressLogs(stress);
      
    } catch (err) {
      setError('Failed to load wellness data');
      console.error('Wellness data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStressSubmit = async (e) => {
    e.preventDefault();
    
    // Crisis intervention check BEFORE logging
    if (stressLevel >= 4) {
      setCrisisDialogOpen(true);
      return;
    }
    
    try {
      const response = await fetch('/api/stress-logs/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          stress_level: stressLevel,
          notes: stressNotes,
          factors: []
        })
      });

      if (response.ok) {
        setStressDialogOpen(false);
        setStressNotes('');
        showMessage('Stress level logged successfully!');
        fetchWellnessData(); // Refresh data
      }
    } catch (err) {
      setError('Failed to log stress level');
    }
  };

  const handleCrisisProceed = async () => {
    // Log the high stress level after showing crisis resources
    try {
      const response = await fetch('/api/stress-logs/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          stress_level: stressLevel,
          notes: stressNotes,
          factors: ['crisis_level_stress']
        })
      });

      if (response.ok) {
        setCrisisDialogOpen(false);
        setStressDialogOpen(false);
        setStressNotes('');
        showMessage('Crisis support resources provided. Please reach out for help.');
        fetchWellnessData();
      }
    } catch (err) {
      setError('Failed to log stress level');
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/self-care-reminders/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: reminderTitle,
          message: reminderMessage,
          frequency: reminderFrequency,
          time_of_day: reminderTime
        })
      });

      if (response.ok) {
        setReminderDialogOpen(false);
        setReminderTitle('');
        setReminderMessage('');
        showMessage('Self-care reminder created!');
        fetchWellnessData(); // Refresh data
      }
    } catch (err) {
      setError('Failed to create reminder');
    }
  };

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleResourceClick = (resource) => {
    // For now, show resource content in a modal
    // Later this could navigate to a dedicated resource page
    setSelectedResource(resource);
    setResourceDialogOpen(true);
  };

  const getCategoryIcon = (iconName) => {
    const iconMap = {
      favorite: '💚',
      psychology: '🧠',
      spa: '🧘',
      support_agent: '🤝',
      local_fire_department: '🔥'
    };
    return iconMap[iconName] || '💚';
  };

  const getStressColor = (level) => {
    if (level <= 2) return theme.success;
    if (level <= 3) return theme.secondary;
    return theme.accent;
  };

  const getStressEmoji = (level) => {
    const emojiMap = {
      1: '😊',
      2: '🙂', 
      3: '😐',
      4: '😟',
      5: '😰'
    };
    return emojiMap[level] || '😐';
  };

  const getStressLabel = (level) => {
    const labelMap = {
      1: 'Very Low',
      2: 'Low',
      3: 'Moderate', 
      4: 'High',
      5: 'Very High'
    };
    return labelMap[level] || 'Moderate';
  };

  const calculateAverageStress = () => {
    if (stressLogs.length === 0) return 0;
    const sum = stressLogs.reduce((acc, log) => acc + log.stress_level, 0);
    return (sum / stressLogs.length).toFixed(1);
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '2rem auto', 
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔄</div>
          <p>Loading wellness dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '2rem auto', 
      padding: '0 1rem',
      backgroundColor: theme.background,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: theme.primary, 
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💚 Staff Wellness Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          margin: '0'
        }}>
          Your mental health and wellbeing matter. Take care of yourself so you can care for the animals.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #ef5350'
        }}>
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Daily Stress Check */}
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #c8e6c9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🧠</span>
            <h3 style={{ margin: '0', color: theme.primary }}>Daily Stress Check</h3>
          </div>
          <p style={{ 
            color: '#666', 
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            How are you feeling today? Track your stress levels to identify patterns.
          </p>
          
          {stressLogs.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ 
                margin: '0 0 0.5rem 0',
                fontSize: '0.9rem'
              }}>
                Average stress this week: <strong>{calculateAverageStress()}/5</strong>
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${calculateAverageStress() * 20}%`,
                  height: '100%',
                  backgroundColor: getStressColor(calculateAverageStress()),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              {calculateAverageStress() <= 2 && (
                <div style={{
                  backgroundColor: '#e8f5e8',
                  color: '#2e7d2e',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}>
                  🌟 Great job managing your stress levels!
                </div>
              )}
              
              {calculateAverageStress() >= 4 && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}>
                  ⚠️ Consider talking to your supervisor about workload
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={() => setStressDialogOpen(true)}
            style={{
              backgroundColor: theme.secondary,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Log Today's Stress
          </button>
        </div>

        {/* Self-Care Reminders */}
        <div style={{
          backgroundColor: '#fff3e0',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #ffcc02'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🔔</span>
            <h3 style={{ margin: '0', color: theme.primary }}>Self-Care Reminders</h3>
          </div>
          <p style={{ 
            color: '#666', 
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            Set personalized reminders to take breaks and practice self-care.
          </p>
          <p style={{ 
            margin: '0 0 1rem 0',
            fontSize: '0.9rem'
          }}>
            Active reminders: <strong>{selfCareReminders.filter(r => r.is_active).length}</strong>
          </p>
          
          <button 
            onClick={() => setReminderDialogOpen(true)}
            style={{
              backgroundColor: theme.accent,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Create Reminder
          </button>
        </div>
      </div>

      {/* Mental Health Categories */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          color: theme.primary, 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🧠 Mental Health Resources
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem'
        }}>
          {mentalHealthCategories.map((category) => (
            <div 
              key={category.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                fontSize: '1.5rem'
              }}>
                {getCategoryIcon(category.icon)}
              </div>
              <h4 style={{ 
                margin: '0',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: theme.primary
              }}>
                {category.name}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Resources */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          color: theme.primary, 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📚 Latest Wellness Resources
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '1.5rem'
        }}>
          {mentalHealthResources.map((resource) => (
            <div 
              key={resource.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  backgroundColor: theme.grey,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {resource.resource_type}
                </span>
                {resource.is_featured && (
                  <span style={{
                    backgroundColor: theme.primary,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    Featured
                  </span>
                )}
              </div>
              
              <h3 style={{ 
                margin: '0 0 0.75rem 0',
                color: theme.primary,
                fontSize: '1.1rem'
              }}>
                {resource.title}
              </h3>
              
              <p style={{ 
                color: '#666', 
                margin: '0 0 0.75rem 0',
                lineHeight: '1.5',
                fontSize: '0.9rem'
              }}>
                {resource.summary}
              </p>
              
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#999',
                margin: '0 0 1rem 0'
              }}>
                By {resource.author}
              </p>
              
              <button 
                onClick={() => handleResourceClick(resource)}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.primary,
                  border: `1px solid ${theme.primary}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Read More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Self-Care Reminders */}
      {selfCareReminders.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            color: theme.primary, 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔔 Your Active Reminders
          </h2>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}>
            {selfCareReminders.filter(r => r.is_active).slice(0, 5).map((reminder, index) => (
              <div 
                key={reminder.id}
                style={{
                  padding: '1rem',
                  borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ 
                  color: theme.success, 
                  fontSize: '1.5rem',
                  marginRight: '1rem'
                }}>
                  ✅
                </span>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: theme.primary }}>
                    {reminder.title}
                  </h4>
                  <p style={{ 
                    margin: '0', 
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    {reminder.frequency} at {reminder.time_of_day}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setStressDialogOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: theme.secondary,
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Quick stress check"
      >
        ➕
      </button>

      {/* Stress Logging Modal */}
      {stressDialogOpen && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: theme.primary }}>
              Log Your Stress Level
            </h3>
            
            <p style={{ margin: '0 0 1rem 0' }}>How stressed do you feel right now?</p>
            
            <div style={{ margin: '0 0 1.5rem 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '3rem', marginRight: '1rem' }}>
                  {getStressEmoji(stressLevel)}
                </span>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getStressColor(stressLevel) }}>
                    {stressLevel}/5
                  </div>
                  <div style={{ color: stressLevel >= 4 ? '#f44336' : '#666' }}>
                    {getStressLabel(stressLevel)}
                    {stressLevel >= 4 && ' ⚠️'}
                  </div>
                </div>
              </div>
              
              {stressLevel >= 4 && (
                <div style={{
                  backgroundColor: '#ffebee',
                  color: '#d32f2f',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  border: '1px solid #f44336'
                }}>
                  <strong>⚠️ High stress level detected.</strong>
                  <br />
                  Crisis support resources will be provided after logging.
                </div>
              )}
              
              <input
                type="range"
                min="1"
                max="5"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, ${theme.success} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.8rem',
                color: '#666',
                marginTop: '0.5rem'
              }}>
                <span>😊 Very Low</span>
                <span>🙂 Low</span>
                <span>😐 Moderate</span>
                <span>😟 High</span>
                <span>😰 Very High</span>
              </div>
            </div>
            
            <textarea
              placeholder="What's contributing to your stress level today? (optional)"
              value={stressNotes}
              onChange={(e) => setStressNotes(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                resize: 'vertical',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                marginBottom: '1.5rem'
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStressDialogOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStressSubmit}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Log Stress Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self-Care Reminder Modal */}
      {reminderDialogOpen && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: theme.primary }}>
              Create Self-Care Reminder
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Reminder Title *
              </label>
              <input
                type="text"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
                placeholder="e.g., Take a 5-minute break"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Message *
              </label>
              <textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                required
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  resize: 'vertical',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit'
                }}
                placeholder="e.g., Step outside and take 5 deep breaths"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Frequency
              </label>
              <select
                value={reminderFrequency}
                onChange={(e) => setReminderFrequency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setReminderDialogOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReminderSubmit}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {resourceDialogOpen && selectedResource && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{
                  backgroundColor: theme.grey,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {selectedResource.resource_type}
                </span>
                <button
                  onClick={() => setResourceDialogOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <h2 style={{ 
                margin: '0 0 0.75rem 0',
                color: theme.primary,
                fontSize: '1.5rem'
              }}>
                {selectedResource.title}
              </h2>
              
              <p style={{ 
                color: '#666', 
                margin: '0 0 0.75rem 0',
                fontStyle: 'italic'
              }}>
                {selectedResource.summary}
              </p>
              
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#999',
                margin: '0 0 1.5rem 0'
              }}>
                By {selectedResource.author}
              </p>
            </div>
            
            <div style={{
              lineHeight: '1.6',
              fontSize: '0.95rem',
              whiteSpace: 'pre-line'
            }}>
              {selectedResource.content}
            </div>
            
            <div style={{ 
              marginTop: '2rem',
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{ 
                margin: '0',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                💚 Remember: Taking care of your mental health helps you provide better care for the animals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crisis Intervention Dialog */}
      {crisisDialogOpen && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '3px solid #f44336'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚨</div>
              <h2 style={{ margin: '0', color: '#f44336' }}>
                High Stress Level Detected
              </h2>
              <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
                Your wellbeing is our priority. Help is available.
              </p>
            </div>

            {/* Immediate Crisis Resources */}
            <div style={{
              backgroundColor: '#ffebee',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #f44336'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#d32f2f' }}>
                🆘 Emergency Resources
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📞</span>
                  <div>
                    <strong>Crisis Hotline: 988</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      24/7 Suicide & Crisis Lifeline
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>💬</span>
                  <div>
                    <strong>Crisis Text: Text HOME to 741741</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Free, 24/7 crisis counseling
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>🚑</span>
                  <div>
                    <strong>Emergency: 911</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      If you're in immediate danger
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Workplace Support */}
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: theme.primary }}>
                🤝 Workplace Support
              </h3>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <strong>• Talk to your supervisor immediately</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    They can adjust your workload and provide support
                  </div>
                </div>
                
                <div>
                  <strong>• Contact HR or Employee Assistance Program</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Free confidential counseling may be available
                  </div>
                </div>
                
                <div>
                  <strong>• Request time off if needed</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Mental health days are valid and important
                  </div>
                </div>
                
                <div>
                  <strong>• Connect with supportive colleagues</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    You're not alone in this work
                  </div>
                </div>
              </div>
            </div>

            {/* Immediate Self-Care */}
            <div style={{
              backgroundColor: '#fff3e0',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: theme.accent }}>
                🧘 Immediate Self-Care
              </h3>
              
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div>• Take 10 deep breaths right now</div>
                <div>• Step away from your current task</div>
                <div>• Drink water and sit down</div>
                <div>• Call someone you trust</div>
                <div>• Don't make any major decisions today</div>
              </div>
            </div>

            {/* Warning Signs */}
            <div style={{
              backgroundColor: '#fff8e1',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: '#e65100'
            }}>
              <strong>⚠️ Seek immediate help if you experience:</strong>
              <br />
              Thoughts of self-harm, inability to function, panic attacks, 
              substance abuse, or feeling completely hopeless.
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setCrisisDialogOpen(false);
                  setStressDialogOpen(false);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                I'll Seek Help
              </button>
              <button
                onClick={handleCrisisProceed}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Continue & Log Level
              </button>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: '1rem',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              Your mental health matters. It's okay to ask for help.
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSnackbar && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: theme.success,
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1001
        }}>
          {snackbarMessage}
        </div>
      )}
    </div>
  );
};

export default StaffWellnessDashboard;