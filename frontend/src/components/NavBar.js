// components/NavBar.js - ENHANCED VERSION with Dropdown Navigation for ALL user types

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
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PetsIcon from '@mui/icons-material/Pets';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
  const [dropdownMenus, setDropdownMenus] = useState({});
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

  const handleDropdownOpen = (event, menuKey) => {
    setDropdownMenus(prev => ({
      ...prev,
      [menuKey]: event.currentTarget
    }));
  };

  const handleDropdownClose = (menuKey) => {
    setDropdownMenus(prev => ({
      ...prev,
      [menuKey]: null
    }));
  };

  // Logout function using Redux
  const handleLogout = () => {
    console.log('Logging out...');
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/login');
  };

  // Get grouped navigation items based on user type
  const getGroupedNavigation = (userType) => {
    switch (userType) {
      case 'PUBLIC':
        return {
          standalone: [
            { title: 'Home', path: '/' }
          ],
          dropdowns: {
            'Animals & Adoption': [
              { title: 'Adoptable Animals', path: '/animals' },
              { title: 'Adoption Matches', path: '/adoption/matches' },
              { title: 'Adopter Profile', path: '/adoption/profile' },
              { title: 'My Applications', path: '/adoption/applications' },
            ],
            'My Account': [
              { title: 'My Reports', path: '/reports' },
              { title: 'My Donations', path: '/my-donations' },
              { title: 'My Virtual Adoptions', path: '/virtual-adoptions/my' },
              { title: 'Rewards', path: '/rewards' },
            ],
            'Take Action': [
              { title: 'Report Animal', path: '/report-animal' },
              { title: 'Donate', path: '/donations' },
            ],
            'Learn & Connect': [
              { title: 'Resources', path: '/resources' },
              { title: 'Interactive Learning', path: '/interactive-learning' },
              { title: 'Forum', path: '/forum' },
              { title: 'Impact Dashboard', path: '/impact-dashboard' },
            ]
          }
        };

      case 'SHELTER':
        return {
          standalone: [
            { title: 'Home', path: '/' }
          ],
          dropdowns: {
            'Operations': [
              { title: 'Dashboard', path: '/dashboard' },
              { title: 'Budget Management', path: '/budget-management' },
              { title: 'Staff Management', path: '/staff-management' },
              { title: 'Volunteer Management', path: '/shelter/volunteer-management' },
            ],
            'Animal Care': [
              { title: 'Animal Management', path: '/animals' },
              { title: 'Medical Management', path: '/medical-management' },
              { title: 'All Applications', path: '/adoption/applications' },
            ],
            'Reports & Data': [
              { title: 'Report Animal', path: '/report-animal' },
              { title: 'All Reports', path: '/reports' },
              { title: 'Impact Dashboard', path: '/impact-dashboard' },
              { title: 'Predictions', path: '/predictive-dashboard' },
            ],
            'Resources': [
              { title: 'Inventory', path: '/inventory/dashboard' },
              { title: 'Forum', path: '/forum' },
            ]
          }
        };

      case 'VOLUNTEER':
        return {
          standalone: [
            { title: 'Home', path: '/' }
          ],
          dropdowns: {
            'Volunteer Work': [
              { title: 'Volunteer Hub', path: '/volunteer/hub' },
              { title: 'Emergency Report', path: '/volunteer/emergency-report' },
            ],
            'Learning & Growth': [
              { title: 'Training Center', path: '/interactive-learning' },
              { title: 'My Progress', path: '/achievements' },
              { title: 'Community', path: '/forum' },
            ]
          }
        };

      case 'AUTHORITY':
        return {
          standalone: [
            { title: 'Home', path: '/' }
          ],
          dropdowns: {
            'Analytics & Insights': [
              { title: 'Strategic Dashboard', path: '/dashboard' },
              { title: 'Impact Analysis', path: '/impact-dashboard' },
              { title: 'Predictions', path: '/predictive-dashboard' },
            ],
            'Policy & Oversight': [
              { title: 'Reports Overview', path: '/reports' },
              { title: 'Policy Resources', path: '/resources' },
            ]
          }
        };

      case 'STAFF':
        return {
          standalone: [
            { title: 'Home', path: '/' }
          ],
          dropdowns: {
            'Operations': [
              { title: 'Dashboard', path: '/dashboard' },
              { title: 'Animal Management', path: '/animals' },
              { title: 'Applications', path: '/adoption/applications' },
              { title: 'Inventory', path: '/inventory/dashboard' },
              { title: 'Reports', path: '/reports' },
              { title: 'Activities', path: '/activities' },
            ],
            'Medical & Care': [
              { title: 'Medical Management', path: '/staff/medical-management' },
              { title: 'Transfer Management', path: '/transfer-management' },
            ],
            'Personal & Wellness': [
              { title: 'Staff Wellness', path: '/staff-wellness' },
              { title: 'Forum', path: '/forum' },
            ]
          }
        };

      default:
        return {
          standalone: [
            { title: 'Home', path: '/' }
          ],
          dropdowns: {
            'Explore': [
              { title: 'Adoptable Animals', path: '/animals' },
              { title: 'Report Animal', path: '/report-animal' },
              { title: 'Resources', path: '/resources' },
              { title: 'Interactive Learning', path: '/interactive-learning' },
            ]
          }
        };
    }
  };

  // Get navigation structure based on user type
  const navStructure = user ? getGroupedNavigation(user.user_type) : getGroupedNavigation('default');

  console.log('NavBar render - user:', !!user, user?.username);

  // Render dropdown menu
  const renderDropdownMenu = (dropdownKey, items) => (
    <Menu
      anchorEl={dropdownMenus[dropdownKey]}
      open={Boolean(dropdownMenus[dropdownKey])}
      onClose={() => handleDropdownClose(dropdownKey)}
      MenuListProps={{
        'aria-labelledby': `${dropdownKey}-button`,
      }}
      sx={{
        '& .MuiMenu-paper': {
          backgroundColor: customTheme.background,
          boxShadow: '0 4px 20px rgba(141, 110, 99, 0.15)',
          borderRadius: '8px',
          minWidth: '220px',
          border: `1px solid ${customTheme.grey}`,
        }
      }}
    >
      {items.map((item, index) => (
        <MenuItem
          key={item.title}
          component={RouterLink}
          to={item.path}
          onClick={() => handleDropdownClose(dropdownKey)}
          sx={{
            '&:hover': {
              backgroundColor: customTheme.secondary,
              color: 'white',
            },
            py: 1.5,
            px: 2,
            color: customTheme.primary,
            fontWeight: 500,
          }}
        >
          {item.icon && <ListItemIcon sx={{ minWidth: '32px' }}>{item.icon}</ListItemIcon>}
          <ListItemText primary={item.title} />
        </MenuItem>
      ))}
    </Menu>
  );

  // Render mobile menu items
  const renderMobileMenuItems = () => {
    const allItems = [
      ...navStructure.standalone,
      ...Object.entries(navStructure.dropdowns).flatMap(([category, items]) => 
        items.map(item => ({ ...item, category }))
      )
    ];

    return allItems.map((item, index) => (
      <MenuItem
        key={item.title}
        onClick={handleCloseNavMenu}
        component={RouterLink}
        to={item.path}
        sx={{
          ...(item.category && {
            pl: 4,
            fontSize: '0.9rem',
            color: 'text.secondary'
          })
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
          <Typography textAlign="center">
            {item.category ? `${item.category}: ${item.title}` : item.title}
          </Typography>
        </Box>
      </MenuItem>
    ));
  };

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
              {renderMobileMenuItems()}
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

          {/* Desktop menu with dropdowns */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'space-evenly', px: 2 }}>
            {/* Standalone items */}
            {navStructure.standalone.map((item) => (
              <Button
                key={item.title}
                component={RouterLink}
                to={item.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'flex',
                  alignItems: 'center',
                  mx: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.icon && <Box sx={{ mr: 0.5 }}>{item.icon}</Box>}
                {item.title}
              </Button>
            ))}

            {/* Dropdown menus */}
            {Object.entries(navStructure.dropdowns).map(([dropdownKey, items]) => (
              <Box key={dropdownKey}>
                <Button
                  id={`${dropdownKey}-button`}
                  aria-controls={Boolean(dropdownMenus[dropdownKey]) ? `${dropdownKey}-menu` : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(dropdownMenus[dropdownKey]) ? 'true' : undefined}
                  onClick={(event) => handleDropdownOpen(event, dropdownKey)}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'flex',
                    alignItems: 'center',
                    mx: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  {dropdownKey}
                </Button>
                {renderDropdownMenu(dropdownKey, items)}
              </Box>
            ))}
          </Box>

          {/* User menu or login/register buttons */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <NotificationBell />
                {!['STAFF', 'SHELTER'].includes(user.user_type) && (
                  <Box sx={{ mx: 1 }}>
                    <PointsDisplay />
                  </Box>
                )}
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    }
                  }}
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
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)' 
                    }
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