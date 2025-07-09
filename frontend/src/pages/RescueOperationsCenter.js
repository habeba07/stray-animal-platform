import React, { useState, useEffect } from 'react';
import {
  LocationOn,
  Phone,
  Schedule,
  Warning,
  Navigation,
  Person,
  Refresh,
  Add,
  Visibility,
  Send,
  CheckCircle,
  Cancel,
  Radio,
  DirectionsCar,
  GpsFixed,
  Timer,
  TrendingUp,
  People,
  Map,
  Security,
  Wifi,
  WifiOff,
  Emergency
} from '@mui/icons-material';

// For now, let's use mock data to get the component working
// Later we'll replace this with real API calls
const mockStats = {
  active_rescues: 3,
  emergency_cases: 1,
  total_pending: 2,
  avg_response_time: 25
};

const mockActiveAssignments = [
  {
    id: 1,
    report: 'R2025-001',
    status: 'EN_ROUTE',
    volunteer_details: { username: 'Sarah Johnson' },
    report_details: {
      animal_type: 'Dog',
      urgency_level: 'EMERGENCY',
      location_details: 'Jalan Putra, Putrajaya',
      description: 'Injured dog hit by car, bleeding from leg'
    },
    assigned_at: new Date().toISOString()
  },
  {
    id: 2,
    report: 'R2025-002', 
    status: 'ON_SCENE',
    volunteer_details: { username: 'Mike Chen' },
    report_details: {
      animal_type: 'Cat',
      urgency_level: 'HIGH',
      location_details: 'Precinct 9, Putrajaya',
      description: 'Pregnant stray cat needs immediate shelter'
    },
    assigned_at: new Date().toISOString()
  }
];

const mockAvailableReports = [
  {
    id: 3,
    animal_type: 'Dog',
    urgency: 'HIGH',
    location_details: 'Cyberjaya Border',
    description: 'Large dog trapped in construction site',
    time_since_reported: '5 minutes ago'
  },
  {
    id: 4,
    animal_type: 'Cat', 
    urgency: 'NORMAL',
    location_details: 'Putrajaya Sentral',
    description: 'Stray cat colony needs assistance',
    time_since_reported: '35 minutes ago'
  }
];

const RescueOperationsCenter = () => {
  const [activeAssignments] = useState(mockActiveAssignments);
  const [availableReports] = useState(mockAvailableReports);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EN_ROUTE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ON_SCENE': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EN_ROUTE': return <Navigation sx={{ fontSize: 16 }} />;
      case 'ON_SCENE': return <LocationOn sx={{ fontSize: 16 }} />;
      case 'COMPLETED': return <CheckCircle sx={{ fontSize: 16 }} />;
      default: return <Timer sx={{ fontSize: 16 }} />;
    }
  };

  const calculateTimeElapsed = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-red-600 flex items-center">
              <Security sx={{ fontSize: 32, marginRight: 2 }} />
              🚨 Rescue Operations Center
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and coordination of all rescue missions
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Refresh sx={{ fontSize: 16, marginRight: 1 }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <TrendingUp sx={{ fontSize: 32, color: '#ea580c' }} />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{mockStats.active_rescues}</p>
              <p className="text-gray-600 text-sm">Active Rescues</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <Warning sx={{ fontSize: 32, color: '#dc2626' }} />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{mockStats.emergency_cases}</p>
              <p className="text-gray-600 text-sm">Emergency Cases</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <GpsFixed sx={{ fontSize: 32, color: '#2563eb' }} />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{mockStats.total_pending}</p>
              <p className="text-gray-600 text-sm">Awaiting Dispatch</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <Timer sx={{ fontSize: 32, color: '#16a34a' }} />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{mockStats.avg_response_time}m</p>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Rescue Missions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Radio sx={{ fontSize: 20, color: '#dc2626', marginRight: 1 }} />
                Active Rescue Missions
              </h2>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {activeAssignments.length} Active
              </span>
            </div>

            {activeAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Security sx={{ fontSize: 48, color: '#d1d5db', marginBottom: 2 }} />
                <p>No active rescue missions at the moment.</p>
                <p className="text-sm">All clear! Great job, team! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                      assignment.report_details?.urgency_level === 'EMERGENCY' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-gray-900">
                            #{assignment.report} - {assignment.report_details?.animal_type || 'Animal'} Rescue
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(assignment.report_details?.urgency_level)}`}>
                            {assignment.report_details?.urgency_level || 'NORMAL'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(assignment.status)} flex items-center`}>
                            {getStatusIcon(assignment.status)}
                            <span className="ml-1">{assignment.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Volunteer:</strong> {assignment.volunteer_details?.username}</p>
                          <p><strong>Location:</strong> {assignment.report_details?.location_details || 'Location provided'}</p>
                          <p><strong>Description:</strong> {assignment.report_details?.description}</p>
                          <p className="text-xs text-gray-500">
                            Assigned {calculateTimeElapsed(assignment.assigned_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedAssignment(assignment)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center"
                        >
                          <Visibility sx={{ fontSize: 12, marginRight: 0.5 }} />
                          Details
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center">
                          <Phone sx={{ fontSize: 12, marginRight: 0.5 }} />
                          Contact
                        </button>
                        <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 flex items-center">
                          <Map sx={{ fontSize: 12, marginRight: 0.5 }} />
                          Track
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Reports & Dispatch */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Warning sx={{ fontSize: 20, color: '#ea580c', marginRight: 1 }} />
                Awaiting Dispatch
              </h2>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {availableReports.length} Pending
              </span>
            </div>

            {availableReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle sx={{ fontSize: 48, color: '#16a34a', marginBottom: 2 }} />
                <p>All reports have been assigned! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableReports.map((rescue) => (
                  <div
                    key={rescue.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      rescue.urgency === 'EMERGENCY' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => setSelectedReport(rescue)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">#{rescue.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(rescue.urgency)}`}>
                        {rescue.urgency}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {rescue.animal_type} - {rescue.location_details || 'Location available'}
                    </p>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      {rescue.description}
                    </p>
                    
                    <p className="text-xs text-red-600 font-medium">
                      ⏰ {rescue.time_since_reported}
                    </p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(rescue);
                      }}
                      className="w-full mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center font-bold"
                    >
                      <Send sx={{ fontSize: 16, marginRight: 1 }} />
                      DISPATCH VOLUNTEER
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency FAB */}
      <button className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors">
        <Add sx={{ fontSize: 24 }} />
      </button>

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Rescue Mission Details</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Cancel sx={{ fontSize: 24 }} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Mission Info</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Report ID:</strong> #{selectedAssignment.report}</p>
                    <p><strong>Animal:</strong> {selectedAssignment.report_details?.animal_type}</p>
                    <p><strong>Urgency:</strong> {selectedAssignment.report_details?.urgency_level}</p>
                    <p><strong>Status:</strong> {selectedAssignment.status}</p>
                    <p><strong>Description:</strong> {selectedAssignment.report_details?.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Volunteer Info</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedAssignment.volunteer_details?.username}</p>
                    <p><strong>Assigned:</strong> {new Date(selectedAssignment.assigned_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
                  <Phone sx={{ fontSize: 16, marginRight: 1 }} />
                  Contact Volunteer
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center">
                  <Map sx={{ fontSize: 16, marginRight: 1 }} />
                  Track on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Dispatch Volunteer</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Cancel sx={{ fontSize: 24 }} />
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Mission Details:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Animal:</strong> {selectedReport.animal_type}</p>
                  <p><strong>Location:</strong> {selectedReport.location_details}</p>
                  <p><strong>Urgency:</strong> {selectedReport.urgency}</p>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded mb-4">
                <p className="text-sm text-blue-800">
                  This will automatically find the best available volunteer based on location, 
                  availability, and experience level.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Auto-dispatching for report:', selectedReport.id);
                    setSelectedReport(null);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center font-bold"
                >
                  <Send sx={{ fontSize: 16, marginRight: 1 }} />
                  AUTO-DISPATCH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueOperationsCenter;