import React, { useRef } from 'react';
import { Button, Box } from '@mui/material';
import { useReactToPrint } from 'react-to-print';

function VirtualAdoptionCertificate({ adoption }) {
  const certificateRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => certificateRef.current,
  });

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handlePrint}>
          Print Certificate
        </Button>
      </Box>
      
      <Box
        ref={certificateRef}
        sx={{
          width: '100%',
          minHeight: '600px',
          border: '10px solid #4a6741',
          padding: '20px',
          textAlign: 'center',
          backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            width: '150%',
            height: '150%',
            opacity: 0.04,
            background: `url(${adoption.animal_details.photos && adoption.animal_details.photos[0] ? adoption.animal_details.photos[0] : '/paw-print.png'})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontFamily: 'cursive', color: '#4a6741', mb: 2 }}>
            Certificate of Virtual Adoption
          </Typography>
          
          <Typography variant="h5" sx={{ color: '#5a5a5a', mb: 4 }}>
            This certifies that
          </Typography>
          
          <Typography variant="h3" sx={{ 
            fontFamily: 'cursive', 
            borderBottom: '2px solid #4a6741',
            display: 'inline-block',
            px: 4,
            py: 1,
            mb: 4
          }}>
            {adoption.is_gift ? adoption.gift_recipient_name : adoption.sponsor_details.username}
          </Typography>
          
          <Typography variant="h5" sx={{ color: '#5a5a5a', mb: 2 }}>
            has virtually adopted
          </Typography>
          
          <Typography variant="h3" sx={{ fontFamily: 'cursive', color: '#4a6741', mb: 4 }}>
            {adoption.animal_details.name || 'Unnamed'}
          </Typography>
          
          <Box sx={{ 
            my: 4,
            border: '1px solid #4a6741',
            width: '300px',
            height: '300px',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {adoption.animal_details.photos && adoption.animal_details.photos[0] ? (
              <Box 
                component="img" 
                src={adoption.animal_details.photos[0]} 
                alt={adoption.animal_details.name}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <PetsIcon sx={{ fontSize: 80, color: '#4a6741' }} />
            )}
          </Box>
          
          <Typography variant="body1" sx={{ color: '#5a5a5a', mb: 2 }}>
            With a {adoption.period.toLowerCase()} commitment of {formatCurrency(adoption.amount)}
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#5a5a5a', mb: 4 }}>
            Starting on {formatDate(adoption.start_date)}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#5a5a5a', mt: 4, fontStyle: 'italic' }}>
            Your generosity helps provide food, shelter, medical care, and love to animals in need. Thank you for your support!
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box sx={{ textAlign: 'center', width: '200px' }}>
              <Typography variant="h6" sx={{ fontFamily: 'cursive', borderTop: '1px solid #4a6741', pt: 1 }}>
                PawRescue
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center', width: '200px' }}>
              <Typography variant="h6" sx={{ fontFamily: 'cursive', borderTop: '1px solid #4a6741', pt: 1 }}>
                Date: {formatDate(new Date())}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default VirtualAdoptionCertificate;