// Updated App.js with role-based homepage routing

import React, { useEffect, useState } from 'react';  
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { setUserFromStorage } from './redux/slices/authSlice';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DonationList from './components/Donations/DonationList';
import DonationForm from './components/Donations/DonationForm';

import './testAPI.js';

// Pages
import HomePage from './pages/HomePage';
import VolunteerDashboard from './pages/VolunteerDashboard'; // NEW: Volunteer-specific dashboard
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportFormPage from './pages/ReportFormPage';
import AnimalListPage from './pages/AnimalListPage';
import AnimalDetailPage from './pages/AnimalDetailPage';
import ReportListPage from './pages/ReportListPage';
import ReportDetailPage from './pages/ReportDetailPage';
import DashboardPage from './pages/DashboardPage';
import ForumPage from './pages/ForumPage';
import NavBar from './components/NavBar';

// Adoption Components
import AdopterProfileForm from './components/Adoption/AdopterProfileForm';
import AdoptionMatchesPage from './components/Adoption/AdoptionMatchesPage';
import AdoptionApplicationForm from './components/Adoption/AdoptionApplicationForm';
import AdoptionApplicationList from './components/Adoption/AdoptionApplicationList';
import AdoptionApplicationDetail from './components/Adoption/AdoptionApplicationDetail';

import ActivityFeed from './components/Community/ActivityFeed';
import RewardCatalog from './components/Community/RewardCatalog';
import AchievementDisplay from './components/Community/AchievementDisplay';

import VolunteerProfileForm from './components/Volunteer/VolunteerProfileForm';
import VolunteerHub from './components/Volunteer/VolunteerHub';
import VolunteerEmergencyReport from './pages/VolunteerEmergencyReport';

import ResourceList from './components/Resources/ResourceList';
import ResourceDetail from './components/Resources/ResourceDetail';

import VirtualAdoptionForm from './components/VirtualAdoption/VirtualAdoptionForm';
import MyVirtualAdoptions from './components/VirtualAdoption/MyVirtualAdoptions';

import { NotificationProvider } from './context/NotificationContext';
import NotificationsPage from './pages/NotificationsPage';

import InventoryDashboard from './components/Inventory/InventoryDashboard';
import InventoryPage from './pages/InventoryPage';

import ShelterVolunteerManagement from './components/Shelter/ShelterVolunteerManagement';

import ImpactDashboard from './pages/ImpactDashboard';

import PredictiveDashboard from './pages/PredictiveDashboard';

import InteractiveLearningPage from './pages/InteractiveLearningPage';

import HealthTrackingTab from './components/HealthTracking/HealthTrackingTab';
import VaccinationForm from './components/HealthTracking/VaccinationForm';
import MedicalRecordForm from './components/HealthTracking/MedicalRecordForm';
import HealthStatusForm from './components/HealthTracking/HealthStatusForm';
import StaffWellnessPage from './pages/StaffWellnessPage';

import MedicalManagementPage from './pages/MedicalManagementPage';
import StaffManagementPage from './pages/StaffManagementPage';

import EmailVerificationPage from './pages/EmailVerificationPage';
import TrackReportPage from './pages/TrackReportPage';

import UserDashboard from './pages/UserDashboard';

import MyDonationsPage from './pages/MyDonationsPage';



// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// NEW: Role-based homepage component
const RoleBasedHomepage = () => {
  const { user } = useSelector((state) => state.auth);
  
  console.log('RoleBasedHomepage - user type:', user?.user_type);
  
  // Show appropriate homepage based on user type
  switch (user?.user_type) {
    case 'VOLUNTEER':
      return <VolunteerDashboard />;
    case 'SHELTER':
    case 'STAFF':
      return <DashboardPage />;
    case 'AUTHORITY':
      return <ImpactDashboard />;
    default:
      return <HomePage />;
  }
};

// Protected Route Component using Redux state
const ProtectedRoute = ({ children, requiredUserType = null, adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  
  console.log('ProtectedRoute check - user from Redux:', !!user);
  console.log('Required user type:', requiredUserType);
  console.log('User type:', user?.user_type);
  
  // Check if user is authenticated
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check if admin access is required
  if (adminOnly && user.user_type !== 'ADMIN') {
    console.log('ProtectedRoute: Admin required, user is', user.user_type);
    return <Navigate to="/" replace />;
  }
  
  // Check if specific user type is required
  if (requiredUserType && user.user_type !== requiredUserType) {
    console.log('ProtectedRoute: Required type', requiredUserType, 'but user is', user.user_type);
    return <Navigate to="/" replace />;
  }
  
  console.log('ProtectedRoute: Access granted for', user.user_type);
  return children;
};

// App Content Component (needs to be inside Provider to use Redux)
function AppContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Initialize user from localStorage on app start
  useEffect(() => {
    console.log('App useEffect - initializing auth state');
    dispatch(setUserFromStorage());
  }, [dispatch]);

  console.log('App render - user from Redux:', !!user);

  return (
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <NavBar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              {/* ⭐ UPDATED: Role-based homepage routing */}
              <Route 
                path="/" 
                element={
                  user ? (
                    <ProtectedRoute>
                      <RoleBasedHomepage />
                    </ProtectedRoute>
                  ) : (
                    <HomePage />
                  )
                } 
              />
              
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/animals" element={<AnimalListPage />} />
              <Route path="/animals/:id" element={<AnimalDetailPage />} />
              <Route path="/interactive-learning" element={<InteractiveLearningPage />} />
              <Route path="/report-animal" element={<ReportFormPage />} />
              <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
              <Route path="/track-report" element={<TrackReportPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              
              {/* ⭐ NEW: Direct access routes for role-specific dashboards */}
              <Route path="/volunteer/dashboard" element={
                <ProtectedRoute requiredUserType="VOLUNTEER">
                  <VolunteerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/staff/dashboard" element={
                <ProtectedRoute requiredUserType="STAFF">
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/shelter/dashboard" element={
                <ProtectedRoute requiredUserType="SHELTER">
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes - require authentication */}
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportListPage />
                </ProtectedRoute>
              } />
              <Route path="/reports/:id" element={
                <ProtectedRoute>
                  <ReportDetailPage />
                </ProtectedRoute>
              } />
           
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/forum" element={
                <ProtectedRoute>
                  <ForumPage />
                </ProtectedRoute>
              } />
              
              {/* Adoption Routes */}
              <Route path="/adoption/profile" element={
                <ProtectedRoute>
                  <AdopterProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/adoption/matches" element={
                <ProtectedRoute>
                  <AdoptionMatchesPage />
                </ProtectedRoute>
              } />
              <Route path="/adoption/apply/:animalId" element={
                <ProtectedRoute>
                  <AdoptionApplicationForm />
                </ProtectedRoute>
              } />
              <Route path="/adoption/applications" element={
                <ProtectedRoute>
                  <AdoptionApplicationList />
                </ProtectedRoute>
              } />

              <Route path="/adoption/applications/:id" element={
                <ProtectedRoute>
                  <AdoptionApplicationDetail />
                </ProtectedRoute>
              } />

              <Route path="/donations" element={
                <ProtectedRoute>
                  <DonationList />
                </ProtectedRoute>
              } />
              <Route path="/donate/:campaignId" element={
                <ProtectedRoute>
                  <DonationForm />
                </ProtectedRoute>
              } />

              <Route path="/activities" element={
                <ProtectedRoute>
                  <ActivityFeed />
                </ProtectedRoute>
              } />

              <Route path="/rewards" element={
                <ProtectedRoute>
                  <RewardCatalog />
                </ProtectedRoute>
              } />

              <Route path="/achievements" element={
                <ProtectedRoute>
                  <AchievementDisplay />
                </ProtectedRoute>
              } />

              {/* ⭐ ENHANCED: Volunteer routes with better organization */}
              <Route path="/volunteer/profile" element={
                <ProtectedRoute>
                  <VolunteerProfileForm />
                </ProtectedRoute>
              } />
              
              <Route path="/volunteer/hub" element={
                <ProtectedRoute>
                  <VolunteerHub />
                </ProtectedRoute>
              } />

              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourceList />
                </ProtectedRoute>
              } />
              <Route path="/resources/:slug" element={
                <ProtectedRoute>
                  <ResourceDetail />
                </ProtectedRoute>
              } />

              <Route path="/virtual-adoptions/new/:animalId" element={
                <ProtectedRoute>
                  <VirtualAdoptionForm />
                </ProtectedRoute>
              } />
              <Route path="/virtual-adoptions/my" element={
                <ProtectedRoute>
                  <MyVirtualAdoptions />
                </ProtectedRoute>
              } />

              <Route path="/health/tracking/:animalId" element={
                <ProtectedRoute>
                  <HealthTrackingTab />
                </ProtectedRoute>
              } />

              <Route path="/health/vaccination/:animalId" element={
                <ProtectedRoute>
                  <VaccinationForm />
                </ProtectedRoute>
              } />

              <Route path="/health/medical-record/:animalId" element={
                <ProtectedRoute>
                  <MedicalRecordForm />
                </ProtectedRoute>
              } />

              <Route path="/health/status/:animalId" element={
                <ProtectedRoute>
                  <HealthStatusForm />
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />

              <Route path="/inventory/dashboard" element={
                <ProtectedRoute>
                  <InventoryDashboard />
                </ProtectedRoute>
              } />
              <Route path="/inventory/items" element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              } />

              <Route path="/impact-dashboard" element={
                <ProtectedRoute>
                  <ImpactDashboard />
                </ProtectedRoute>
              } />

              <Route path="/predictive-dashboard" element={
                <ProtectedRoute>
                  <PredictiveDashboard />
                </ProtectedRoute>
              } />

              <Route path="/staff-wellness" element={
                <ProtectedRoute requiredUserType="STAFF">
                  <StaffWellnessPage />
                </ProtectedRoute>
              } />
              
              <Route path="/shelter/volunteer-management" element={
                <ProtectedRoute requiredUserType="SHELTER">
                  <ShelterVolunteerManagement />
                </ProtectedRoute>
              } /> 

              <Route path="/volunteer/emergency-report" element={
                <ProtectedRoute requiredUserType="VOLUNTEER">
                  <VolunteerEmergencyReport />
                </ProtectedRoute>
              } />

	      <Route path="/medical-management" element={
  		<ProtectedRoute requiredUserType="SHELTER">
    		  <MedicalManagementPage />
  		</ProtectedRoute>
	      } />

	     <Route path="/staff-management" element={
  	       <ProtectedRoute requiredUserType="SHELTER">
    		 <StaffManagementPage />
  	       </ProtectedRoute>
	     } />

	    <Route path="/animal-management/emergency" element={
  	      <ProtectedRoute requiredUserType="SHELTER">
    	        <AnimalListPage />
  	      </ProtectedRoute>
	    } />

	   <Route path="/adoption/bulk-processing" element={
  	     <ProtectedRoute requiredUserType="SHELTER">
    	       <AdoptionApplicationList />
  	     </ProtectedRoute>
	   } />

           <Route path="/my-donations" element={
             <ProtectedRoute>
               <MyDonationsPage />
           </ProtectedRoute>
         } />
          

            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </NotificationProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;