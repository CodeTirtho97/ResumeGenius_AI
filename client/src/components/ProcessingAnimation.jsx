import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const ProcessingAnimation = ({ text = "Processing your resume..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        margin: '10px 0',
        background: 'rgba(0, 173, 181, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 173, 181, 0.3)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '15px',
        }}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'loop',
              delay: index * 0.1,
            }}
            style={{
              width: '12px',
              height: '12px',
              background: 'linear-gradient(135deg, #00E0FF 0%, #06d6a0 100%)',
              borderRadius: '50%',
              margin: '0 5px',
            }}
          />
        ))}
      </Box>
      
      <Typography
        variant="body1"
        sx={{
          fontSize: '14px',
          color: '#00E0FF',
          textAlign: 'center',
          fontWeight: 'medium',
        }}
      >
        {text}
      </Typography>
      
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{
          duration: 8,
          ease: "linear",
        }}
        style={{
          height: '4px',
          background: 'linear-gradient(90deg, #00E0FF, #06d6a0)',
          borderRadius: '2px',
          marginTop: '15px',
          width: '80%',
        }}
      />
    </Box>
  );
};

export default ProcessingAnimation;