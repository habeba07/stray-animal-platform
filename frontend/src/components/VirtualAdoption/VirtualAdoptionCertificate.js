import React, { useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// Enhanced theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

function VirtualAdoptionCertificate({ adoption }) {
  const certificateRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    handlePrint();
  };

  // Handle undefined adoption prop
  if (!adoption) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.grey}20 50%, ${theme.background} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography variant="h4" sx={{ color: theme.primary }}>
          Loading certificate...
        </Typography>
      </Box>
    );
  }

  // Set default values to prevent errors
  const animalDetails = adoption.animal_details || {};
  const sponsorDetails = adoption.sponsor_details || {};
  const animalName = animalDetails.name || 'Unnamed Animal';
  const animalPhotos = animalDetails.photos || [];
  const sponsorName = sponsorDetails.username || 'Anonymous Sponsor';
  const recipientName = adoption.is_gift ? (adoption.gift_recipient_name || 'Gift Recipient') : sponsorName;
  const giftMessage = adoption.is_gift ? adoption.gift_message : null;
  const startDate = adoption.start_date || new Date().toISOString();
  const adoptionId = adoption.id || '0000';

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.grey}20 50%, ${theme.background} 100%)`,
      py: 4,
    }}>
      {/* Print Buttons */}
      <Box 
        className="print-buttons"
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 3,
          mb: 4,
          '@media print': {
            display: 'none',
          }
        }}
      >
        <Button 
          variant="contained" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            fontWeight: 'bold',
            borderRadius: 3,
            px: 6,
            py: 2,
            textTransform: 'none',
          }}
        >
          Print Certificate
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{
            borderColor: theme.primary,
            color: theme.primary,
            fontWeight: 'bold',
            borderRadius: 3,
            px: 6,
            py: 2,
            textTransform: 'none',
          }}
        >
          Download PDF
        </Button>
      </Box>
      
      {/* Simple Certificate Container */}
      <Box
        ref={certificateRef}
        className="certificate-container"
        sx={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          aspectRatio: '297/210', // A4 landscape ratio
          background: 'white',
          border: `6px solid ${theme.primary}`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          position: 'relative',
          '@media print': {
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            margin: 0,
            border: `4px solid ${theme.primary}`,
            boxShadow: 'none',
            aspectRatio: 'auto',
            pageBreakInside: 'avoid',
          }
        }}
      >
        {/* Inner Border */}
        <Box sx={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          right: '15px',
          bottom: '15px',
          border: `2px solid ${theme.secondary}`,
          '@media print': {
            top: '10px',
            left: '10px',
            right: '10px',
            bottom: '10px',
          }
        }} />

        {/* Corner Circles */}
        <Box sx={{
          position: 'absolute',
          top: '25px',
          left: '25px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${theme.secondary}`,
        }} />
        <Box sx={{
          position: 'absolute',
          top: '25px',
          right: '25px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${theme.accent}`,
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '25px',
          left: '25px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${theme.accent}`,
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '25px',
          right: '25px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${theme.secondary}`,
        }} />

        {/* Main Content Area */}
        <Box sx={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          right: '40px',
          bottom: '40px',
          display: 'flex',
          flexDirection: 'row',
          gap: '30px',
          '@media print': {
            top: '25px',
            left: '25px',
            right: '25px',
            bottom: '25px',
            gap: '20px',
          }
        }}>
          
          {/* Left Column - Photo and Animal Name */}
          <Box sx={{
            width: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            pt: 2,
            '@media print': {
              width: '160px',
              pt: 1,
            }
          }}>
            {/* Animal Photo */}
            <Box sx={{
              width: '140px',
              height: '140px',
              border: `3px solid ${theme.secondary}`,
              borderRadius: '8px',
              overflow: 'hidden',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              '@media print': {
                width: '120px',
                height: '120px',
              }
            }}>
              {animalPhotos.length > 0 ? (
                <img 
                  src={animalPhotos[0]} 
                  alt={animalName}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <PetsIcon sx={{ fontSize: 60, color: theme.primary, opacity: 0.6 }} />
              )}
            </Box>

            {/* Animal Name */}
            <Typography sx={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '1.8rem',
              color: theme.primary,
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 2,
              '@media print': {
                fontSize: '1.5rem',
              }
            }}>
              {animalName}
            </Typography>

            {/* Support Date */}
            <Box sx={{
              textAlign: 'center',
              padding: '8px 12px',
              backgroundColor: `${theme.grey}40`,
              borderRadius: '6px',
              border: `1px solid ${theme.secondary}40`,
            }}>
              <Typography sx={{
                fontFamily: '"Merriweather", serif',
                fontSize: '0.7rem',
                color: theme.primary,
                opacity: 0.8,
              }}>
                Supported since
              </Typography>
              <Typography sx={{
                fontFamily: '"Merriweather", serif',
                fontSize: '0.8rem',
                color: theme.primary,
                fontWeight: 'bold',
              }}>
                {formatDate(startDate)}
              </Typography>
            </Box>
          </Box>

          {/* Right Column - Certificate Content */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            
            {/* Header Icon */}
            <WorkspacePremiumIcon sx={{
              fontSize: '2.5rem',
              color: theme.primary,
              mb: 2,
            }} />
            
            {/* Certificate Title */}
            <Typography sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '2.2rem',
              color: theme.primary,
              fontWeight: 'bold',
              lineHeight: 1,
              mb: 0.5,
              '@media print': {
                fontSize: '1.8rem',
              }
            }}>
              Certificate of
            </Typography>
            
            <Typography sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '2.2rem',
              color: theme.accent,
              fontWeight: 'bold',
              lineHeight: 1,
              mb: 3,
              '@media print': {
                fontSize: '1.8rem',
              }
            }}>
              Virtual Adoption
            </Typography>

            {/* Decorative Line */}
            <Box sx={{
              width: '120px',
              height: '2px',
              backgroundColor: theme.accent,
              mb: 3,
            }} />
            
            {/* Certificate Text */}
            <Typography sx={{
              fontFamily: '"Merriweather", serif',
              fontSize: '1.1rem',
              color: theme.primary,
              fontWeight: 300,
              mb: 2,
              '@media print': {
                fontSize: '0.9rem',
              }
            }}>
              This certifies that
            </Typography>
            
            {/* Adopter Name */}
            <Typography sx={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '2rem',
              color: theme.accent,
              fontWeight: 'bold',
              mb: 1,
              '@media print': {
                fontSize: '1.6rem',
              }
            }}>
              {recipientName}
            </Typography>
            
            {/* Underline */}
            <Box sx={{
              width: '200px',
              height: '1px',
              backgroundColor: theme.primary,
              opacity: 0.5,
              mb: 2,
            }} />
            
            <Typography sx={{
              fontFamily: '"Merriweather", serif',
              fontSize: '1.1rem',
              color: theme.primary,
              fontWeight: 300,
              mb: 3,
              '@media print': {
                fontSize: '0.9rem',
              }
            }}>
              has virtually adopted the above animal
            </Typography>

            {/* Gift Message - Only for gifts */}
            {adoption.is_gift && giftMessage && (
              <Box sx={{
                padding: '12px 16px',
                backgroundColor: `${theme.grey}30`,
                borderRadius: '6px',
                border: `1px solid ${theme.accent}40`,
                mb: 3,
                maxWidth: '250px',
              }}>
                <Typography sx={{
                  fontFamily: '"Dancing Script", cursive',
                  fontSize: '1rem',
                  color: theme.primary,
                  fontStyle: 'italic',
                }}>
                  "{giftMessage}"
                </Typography>
              </Box>
            )}
            
            {/* Thank You Message */}
            <Typography sx={{
              fontFamily: '"Merriweather", serif',
              fontSize: '0.8rem',
              color: theme.primary,
              fontStyle: 'italic',
              lineHeight: 1.4,
              maxWidth: '300px',
              mb: 3,
              '@media print': {
                fontSize: '0.7rem',
              }
            }}>
              Your generosity helps provide food, shelter, medical care, and love to animals in need. 
              Thank you for making a difference.
            </Typography>
            
            {/* Signatures */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '300px',
              mt: 2,
            }}>
              <Box sx={{ textAlign: 'center', width: '45%' }}>
                <Box sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: theme.primary,
                  mb: 0.5,
                }} />
                <Typography sx={{
                  fontFamily: '"Dancing Script", cursive',
                  fontSize: '0.9rem',
                  color: theme.primary,
                  fontWeight: 'bold',
                }}>
                  PawRescue Team
                </Typography>
                <Typography sx={{
                  fontFamily: '"Merriweather", serif',
                  fontSize: '0.6rem',
                  color: theme.primary,
                  opacity: 0.7,
                }}>
                  Director
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', width: '45%' }}>
                <Box sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: theme.primary,
                  mb: 0.5,
                }} />
                <Typography sx={{
                  fontFamily: '"Dancing Script", cursive',
                  fontSize: '0.9rem',
                  color: theme.primary,
                  fontWeight: 'bold',
                }}>
                  {formatDate(new Date())}
                </Typography>
                <Typography sx={{
                  fontFamily: '"Merriweather", serif',
                  fontSize: '0.6rem',
                  color: theme.primary,
                  opacity: 0.7,
                }}>
                  Certificate Date
                </Typography>
              </Box>
            </Box>
            
            {/* Certificate Number */}
            <Typography sx={{
              fontFamily: '"Merriweather", serif',
              fontSize: '0.5rem',
              color: theme.primary,
              opacity: 0.5,
              letterSpacing: '0.5px',
              mt: 1,
            }}>
              Certificate No: VA-{adoptionId}-{new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Simple Print Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@400;700&family=Merriweather:wght@300;400;700&display=swap');
        
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          body > * {
            visibility: hidden !important;
          }
          
          .certificate-container,
          .certificate-container * {
            visibility: visible !important;
          }
          
          .certificate-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </Box>
  );
}

export default VirtualAdoptionCertificate;