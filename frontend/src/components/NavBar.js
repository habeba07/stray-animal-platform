// components/NavBar.js - ENHANCED VERSION with Medical Management for SHELTER users

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PetsIcon from '@mui/icons-material/Pets';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'; // NEW: Medical icon
import PointsDisplay from './Community/PointsDisplay';
import NotificationBell from './Notifications/NotificationBell';

const customTheme = {
  primary: '#8d6e63',       // Warm Brown (like animal fur)
  secondary: '#81c784',     // Soft Green (nature/grass)
  success: '#4caf50',       // Fresh Green (health/growth)
  grey: '#f3e5ab',          // Warm Cream (cozy/safe)
  accent: '#ff8a65',        // Gentle Orange (warmth/energy)
  background: '#fff8e1',    // Soft Cream (warm background)
};

function NavBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Logout function using Redux
  const handleLogout = () => {
    console.log('Logging out...');
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/login');
  };

  // Navigation items for users that are not logged in
  const publicPages = [
    { title: 'Home', path: '/' },
    { title: 'Adoptable Animals', path: '/animals' },
    { title: 'Report Animal', path: '/report-animal' },
    { title: 'Resources', path: '/resources' },
    { title: 'Interactive Learning', path: '/interactive-learning' }, 
  ];

  const getRoleBasedPages = (userType) => {
    const basePages = [
      { title: 'Home', path: '/' },
      { title: 'Animal Management', path: '/animals' }, // Changed from "Adoptable Animals" for broader scope
    ];

    switch (userType) {
      case 'PUBLIC':
        return [
          ...basePages,
          { title: 'Report Animal', path: '/report-animal' },
          { title: 'My Reports', path: '/reports' },
          { title: 'My Applications', path: '/adoption/applications' },
          { title: 'Resources', path: '/resources' }, // Educational content
          { title: 'Interactive Learning', path: '/interactive-learning' }, 
          { title: 'Adoption Matches', path: '/adoption/matches' }, 
          { title: 'Adopter Profile', path: '/adoption/profile' }, 
          { title: 'Donate', path: '/donations' },
          { title: 'My Donations', path: '/my-donations' }, 
          { title: 'Rewards', path: '/rewards' }, 
          { title: 'My Virtual Adoptions', path: '/virtual-adoptions/my' },
          { title: 'Forum', path: '/forum' }, 
          { title: 'Impact Dashboard', path: '/impact-dashboard' },
        ];

      case 'SHELTER':
        return [
          ...basePages,
          { title: 'Dashboard', path: '/dashboard' }, 
          
          
          { title: 'Medical Management', path: '/medical-management' },

          { title: 'Staff Management', path: '/staff-management' },
          { title: 'Report Animal', path: '/report-animal' }, 
          { title: 'All Reports', path: '/reports' }, 
          { title: 'Volunteer Management', path: '/shelter/volunteer-management' },
          { title: 'Inventory', path: '/inventory/dashboard' }, 
          { title: 'Impact Dashboard', path: '/impact-dashboard' }, 
          { title: 'Predictions', path: '/predictive-dashboard' }, 
          { title: 'All Applications', path: '/adoption/applications' }, // Changed from "My Applications"
          { title: 'Forum', path: '/forum' }, 
        ];

      case 'VOLUNTEER':
        return [
          { title: 'Home', path: '/' },
          { title: 'Emergency Report', path: '/volunteer/emergency-report' },
          { title: 'Volunteer Hub', path: '/volunteer/hub' }, 
          { title: 'Training Center', path: '/interactive-learning' },
          { title: 'Community', path: '/forum' },
          { title: 'My Progress', path: '/achievements' }, 
        ];

      case 'AUTHORITY':  
        return [
          { title: 'Strategic Dashboard', path: '/dashboard' }, 
          { title: 'Impact Analysis', path: '/impact-dashboard' },
          { title: 'Predictions', path: '/predictive-dashboard' },
          { title: 'Reports Overview', path: '/reports' }, 
          { title: 'Policy Resources', path: '/resources' }, // Resource planning data
        ];

      case 'STAFF':
        return [
          ...basePages,
          { title: 'Dashboard', path: '/dashboard' },
          
          // NEW: Medical Management for STAFF as well
          { 
            title: 'Medical Management', 
            path: '/medical-management',
            icon: <MedicalServicesIcon />,
            isNew: true 
          },
          
          { title: 'Reports', path: '/reports' }, // Monitor animals in direct care
          { title: 'Applications', path: '/adoption/applications' }, 
          { title: 'Activities', path: '/activities' }, // Monitor medical treatments
          { title: 'Staff Wellness', path: '/staff-wellness' },
          { title: 'Inventory', path: '/inventory/dashboard' },
          { title: 'Forum', path: '/forum' }, // Staff communication
        ];

      default:
        return basePages;
    }
  };

  const privatePages = user ? getRoleBasedPages(user.user_type) : [];

  // Determine which navigation items to show based on authentication status
  const navItems = user ? privatePages : publicPages;

  console.log('NavBar render - user:', !!user, user?.username);

  return (
    <AppBar 
      position="static"
      sx={{ 
        backgroundColor: customTheme.primary,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - visible on desktop */}
          <PetsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PAWRESCUE
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {navItems.map((page) => (
                <MenuItem 
                  key={page.title} 
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                  sx={{
                    // NEW: Special styling for Medical Management in mobile
                    ...(page.isNew && {
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      }
                    })
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {page.icon && <Box sx={{ mr: 1 }}>{page.icon}</Box>}
                    <Typography textAlign="center">{page.title}</Typography>
                    {page.isNew && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          ml: 1, 
                          px: 1, 
                          py: 0.25, 
                          backgroundColor: '#4caf50', 
                          color: 'white', 
                          borderRadius: 1,
                          fontSize: '0.6rem'
                        }}
                      >
                        NEW
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - visible on mobile */}
          <PetsIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PAWRESCUE
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'flex',
                  alignItems: 'center',
                  
                  // ⭐ Special styling for emergency operations to make it stand out
                  ...(page.title.includes('Emergency Report') && {
                    backgroundColor: 'rgba(244, 67, 54, 0.2)', // Red emergency tint
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.3)',
                    },
                    fontWeight: 'bold',
                  }),
                  
                  // NEW: Special styling for Medical Management
                  ...(page.isNew && {
                    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Green medical tint
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.3)',
                    },
                    fontWeight: 'bold',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: 1,
                    mx: 0.5,
                  })
                }}
              >
                {page.icon && <Box sx={{ mr: 0.5 }}>{page.icon}</Box>}
                {page.title}
                {page.isNew && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 0.5, 
                      px: 0.5, 
                      py: 0.125, 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      borderRadius: 0.5,
                      fontSize: '0.6rem',
                      fontWeight: 'bold'
                    }}
                  >
                    NEW
                  </Typography>
                )}
              </Button>
            ))}
          </Box>

          {/* User menu or login/register buttons */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {user && <NotificationBell />}
            {user ? (
              <>
                {!['STAFF', 'SHELTER'].includes(user.user_type) && <PointsDisplay />}
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.username} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to={user?.user_type === 'VOLUNTEER' ? '/volunteer/profile' : '/profile'} 
                    onClick={handleCloseUserMenu}
                  >
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ 
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;