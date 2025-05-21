import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Paper
} from '@mui/material';
import { 
  FaInfoCircle, 
  FaChevronDown, 
  FaChevronUp, 
  FaRocket, 
  FaSearchPlus, 
  FaLock 
} from 'react-icons/fa';

const InfoPanel = () => {
  // State to track which accordion is expanded
  const [expanded, setExpanded] = useState('howToUse');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper
      sx={{
        flex: { xs: "1", lg: "1.5" },
        height: { xs: "auto", lg: "70vh" },
        width: { xs: "95%", sm: "90%", md: "80%", lg: "auto" },
        backgroundColor: "rgba(31, 41, 55, 0.5)",
        color: "white",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        padding: "15px",
        marginBottom: "30px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        overflow: "hidden"
      }}
    >
      <Typography 
        variant="h6" 
        fontWeight="bold"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: '#00E0FF',
          fontSize: { xs: '1.1rem', sm: '1.2rem' },
          padding: "0 10px"
        }}
      >
        <FaInfoCircle /> Info Panel
      </Typography>
      
      {/* How to Use - Always open */}
      <Accordion 
        expanded={expanded === 'howToUse'} 
        onChange={handleChange('howToUse')}
        sx={{
          background: 'rgba(10, 25, 41, 0.7)',
          color: 'white',
          borderRadius: '10px !important', // Important to override MUI defaults
          mb: 1,
          '&:before': {
            display: 'none', // Remove the default divider
          },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          expandIcon={expanded === 'howToUse' ? <FaChevronUp color="#00E0FF" /> : <FaChevronDown color="#00E0FF" />}
          sx={{ 
            padding: '0 12px',
            minHeight: '48px',
            '& .MuiAccordionSummary-content': {
              margin: '10px 0'
            }
          }}
        >
          <Typography 
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: '#FF9800',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }}
          >
            <FaRocket style={{ color: '#FF9800' }} /> How to Use:
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0 12px 12px 12px' }}>
          <ul style={{ 
            paddingLeft: "20px", 
            marginTop: "0",
            fontSize: '0.9rem',
            color: '#E0E0E0',
            listStyleType: 'none',
          }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#00E0FF' }}>•</span> Upload your resume (PDF only).
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#00E0FF' }}>•</span> Provide a job description to analyze match score.
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#00E0FF' }}>•</span> Receive AI suggestions for resume improvements.
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>
      
      {/* AI-Powered Analysis */}
      <Accordion 
        expanded={expanded === 'aiAnalysis'} 
        onChange={handleChange('aiAnalysis')}
        sx={{
          background: 'rgba(10, 25, 41, 0.7)',
          color: 'white',
          borderRadius: '10px !important',
          mb: 1,
          '&:before': {
            display: 'none',
          },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          expandIcon={expanded === 'aiAnalysis' ? <FaChevronUp color="#00E0FF" /> : <FaChevronDown color="#00E0FF" />}
          sx={{ 
            padding: '0 12px',
            minHeight: '48px',
            '& .MuiAccordionSummary-content': {
              margin: '10px 0'
            }
          }}
        >
          <Typography 
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: '#00E0FF',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }}
          >
            <FaSearchPlus style={{ color: '#00E0FF' }} /> AI-Powered Analysis:
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0 12px 12px 12px' }}>
          <ul style={{ 
            paddingLeft: "20px", 
            marginTop: "0",
            fontSize: '0.9rem',
            color: '#E0E0E0',
            listStyleType: 'none',
          }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#06d6a0' }}>•</span> Calculates ATS match score.
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#06d6a0' }}>•</span> Identifies missing keywords & skills.
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#06d6a0' }}>•</span> Suggests modifications for better job fit.
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>
      
      {/* Data Privacy & Usage */}
      <Accordion 
        expanded={expanded === 'privacy'} 
        onChange={handleChange('privacy')}
        sx={{
          background: 'rgba(10, 25, 41, 0.7)',
          color: 'white',
          borderRadius: '10px !important',
          mb: 1,
          '&:before': {
            display: 'none',
          },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          expandIcon={expanded === 'privacy' ? <FaChevronUp color="#00E0FF" /> : <FaChevronDown color="#00E0FF" />}
          sx={{ 
            padding: '0 12px',
            minHeight: '48px',
            '& .MuiAccordionSummary-content': {
              margin: '10px 0'
            }
          }}
        >
          <Typography 
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: '#FFC107',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }}
          >
            <FaLock style={{ color: '#FFC107' }} /> Data Privacy & Usage:
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0 12px 12px 12px' }}>
          <ul style={{ 
            paddingLeft: "20px", 
            marginTop: "0",
            fontSize: '0.9rem',
            color: '#E0E0E0',
            listStyleType: 'none',
          }}>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#FF9800' }}>•</span> One resume analysis per hour.
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#FF9800' }}>•</span> Resume data is automatically deleted after 24 hours.
            </li>
            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#FF9800' }}>•</span> Results are cached for faster processing.
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>
      
      {/* Security notice */}
      <Box sx={{ 
        mt: 'auto',
        background: 'rgba(0, 224, 255, 0.1)',
        borderRadius: '10px',
        padding: '12px',
        border: '1px solid rgba(0, 224, 255, 0.2)',
      }}>
        <Typography 
          sx={{
            fontSize: '0.8rem',
            color: '#BBB',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <span style={{ color: '#00E0FF', fontSize: '1rem', marginBottom: '4px' }}>🔒</span>
          Your resume data is securely stored and automatically deleted after 24 hours.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InfoPanel;