import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Paper, Divider } from '@mui/material';

const TailoredBulletPoints = ({ tailoredBullets }) => {
  if (!tailoredBullets || tailoredBullets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#1A1C2A',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
          border: '1px solid #00E0FF',
          boxShadow: '0 0 15px rgba(0, 224, 255, 0.2)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#00E0FF', 
            fontWeight: 'bold',
            marginBottom: '15px',
            textAlign: 'center'
          }}
        >
          💼 Tailored Resume Bullet Points
        </Typography>

        {tailoredBullets.map((bullet, index) => (
          <Box key={index} sx={{ marginBottom: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
              <Typography 
                sx={{ 
                  color: '#FF5555', 
                  minWidth: '80px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginRight: '10px',
                  marginTop: '2px'
                }}
              >
                ORIGINAL:
              </Typography>
              <Typography sx={{ color: '#BBBBBB', fontSize: '14px' }}>
                {bullet.original}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
              <Typography 
                sx={{ 
                  color: '#00E676', 
                  minWidth: '80px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginRight: '10px',
                  marginTop: '2px'
                }}
              >
                IMPROVED:
              </Typography>
              <Typography sx={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'medium' }}>
                {bullet.improved}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Typography 
                sx={{ 
                  color: '#FFC107', 
                  minWidth: '80px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginRight: '10px',
                  marginTop: '2px'
                }}
              >
                WHY:
              </Typography>
              <Typography sx={{ color: '#AAAAAA', fontSize: '13px', fontStyle: 'italic' }}>
                {bullet.explanation}
              </Typography>
            </Box>
            
            {index < tailoredBullets.length - 1 && (
              <Divider sx={{ backgroundColor: '#333', margin: '15px 0' }} />
            )}
          </Box>
        ))}
      </Paper>
    </motion.div>
  );
};

export default TailoredBulletPoints;