import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const SkeletonLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        alignSelf: 'flex-start',
        background: '#393E46',
        padding: '15px',
        borderRadius: '15px',
        width: '70%',
        marginBottom: '10px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop'
          }}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#00ADB5',
          }}
        />
        <Box sx={{ width: '100%' }}>
          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop'
            }}
            style={{
              height: '12px',
              background: 'linear-gradient(90deg, #555, #444)',
              borderRadius: '6px',
              width: '90%',
              marginBottom: '8px'
            }}
          />
          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
              delay: 0.2
            }}
            style={{
              height: '10px',
              background: 'linear-gradient(90deg, #555, #444)',
              borderRadius: '5px',
              width: '60%',
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

export default SkeletonLoader;