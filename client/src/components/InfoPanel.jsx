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
      className="info-panel-container"
      sx={{
        flex: { xs: "1", lg: "1.5" },
        height: { xs: "auto", lg: "70vh" },
        width: { xs: "95%", sm: "90%", md: "80%", lg: "auto" },
        backgroundColor: "rgba(18, 30, 46, 0.85)", // Darker background for better contrast
        color: "white",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        padding: "15px",
        marginBottom: "30px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        overflow: "hidden"
      }}
    >
      <Typography 
        className="info-panel-header"
        variant="h6" 
        fontWeight="bold"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: 'white',
          fontSize: { xs: '1.1rem', sm: '1.2rem' },
          padding: "0 10px",
          mb: 1
        }}
      >
        <FaInfoCircle style={{ color: '#219ebc' }} /> Info Panel
      </Typography>
      
      {/* How to Use - Always open */}
      <Accordion 
        className="info-accordion"
        expanded={expanded === 'howToUse'} 
        onChange={handleChange('howToUse')}
        sx={{
          background: 'rgba(10, 25, 41, 0.9)', // Darker background
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
          expandIcon={expanded === 'howToUse' ? <FaChevronUp color="#FFD166" /> : <FaChevronDown color="#FFD166" />}
          sx={{ 
            padding: '0 12px',
            minHeight: '48px',
            background: 'linear-gradient(90deg, #1E3A5F 0%, #2D6A9F 100%)', // Darker blue gradient
            borderRadius: '10px',
            '& .MuiAccordionSummary-content': {
              margin: '10px 0'
            }
          }}
        >
          <Typography 
            className="section-title-how-to-use accordion-header"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: 'white', // Changed to white for better visibility
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }}
          >
            <FaRocket style={{ color: '#FFD166' }} /> How to Use:
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0 12px 16px 12px' }}>
          <ul style={{ 
            paddingLeft: "20px", 
            margin: "0",
            fontSize: '0.9rem',
            color: '#E0E0E0',
            listStyleType: 'none',
          }}>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-center', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#219ebc', minWidth: '8px' }}>•</span> 
              <span>Upload your resume (PDF only).</span>
            </li>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-center', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#219ebc', minWidth: '8px' }}>•</span> 
              <span>Provide a job description to analyze match score.</span>
            </li>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-center', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#219ebc', minWidth: '8px' }}>•</span> 
              <span>Receive AI suggestions for resume improvements.</span>
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>
      
      {/* AI-Powered Analysis */}
      <Accordion 
        className="info-accordion"
        expanded={expanded === 'aiAnalysis'} 
        onChange={handleChange('aiAnalysis')}
        sx={{
          background: 'rgba(10, 25, 41, 0.9)', // Darker background
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
          expandIcon={expanded === 'aiAnalysis' ? <FaChevronUp color="#FFD166" /> : <FaChevronDown color="#FFD166" />}
          sx={{ 
            padding: '0 12px',
            minHeight: '48px',
            background: 'linear-gradient(90deg, #263859 0%, #3A6291 100%)', // Slightly lighter shade
            borderRadius: '10px',
            '& .MuiAccordionSummary-content': {
              margin: '10px 0'
            }
          }}
        >
          <Typography 
            className="section-title-ai-analysis accordion-header"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: 'white', // Changed to white for better visibility
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }}
          >
            <FaSearchPlus style={{ color: '#FFD166' }} /> AI-Powered Analysis:
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0 12px 16px 12px' }}>
          <ul style={{ 
            paddingLeft: "20px", 
            margin: "0",
            fontSize: '0.9rem',
            color: '#E0E0E0',
            listStyleType: 'none',
          }}>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#06d6a0', minWidth: '8px' }}>•</span> 
              <span>Calculates ATS match score.</span>
            </li>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#06d6a0', minWidth: '8px' }}>•</span> 
              <span>Identifies missing keywords & skills.</span>
            </li>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#06d6a0', minWidth: '8px' }}>•</span> 
              <span>Suggests modifications for better job fit.</span>
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>
      
      {/* Data Privacy & Usage */}
      <Accordion 
        className="info-accordion"
        expanded={expanded === 'privacy'} 
        onChange={handleChange('privacy')}
        sx={{
          background: 'rgba(10, 25, 41, 0.9)', // Darker background
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
          expandIcon={expanded === 'privacy' ? <FaChevronUp color="#FFD166" /> : <FaChevronDown color="#FFD166" />}
          sx={{ 
            padding: '0 12px',
            minHeight: '48px',
            background: 'linear-gradient(90deg, #2B3252 0%, #4A5788 100%)', // Darkest shade
            borderRadius: '10px',
            '& .MuiAccordionSummary-content': {
              margin: '10px 0'
            }
          }}
        >
          <Typography 
            className="section-title-privacy accordion-header"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600
            }}
          >
            <FaLock style={{ color: '#FFD166' }} /> Data Privacy & Usage:
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0 12px 16px 12px' }}>
          <ul style={{ 
            paddingLeft: "20px", 
            margin: "0",
            fontSize: '0.9rem',
            color: '#E0E0E0',
            listStyleType: 'none',
          }}>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#FF9800', minWidth: '8px' }}>•</span> 
              <span>One resume analysis per hour.</span>
            </li>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#FF9800', minWidth: '8px' }}>•</span> 
              <span>Resume data is automatically deleted after 24 hours.</span>
            </li>
            <li className="info-list-item" style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span className="info-list-bullet" style={{ color: '#FF9800', minWidth: '8px' }}>•</span> 
              <span>Results are cached for faster processing.</span>
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>
      
      {/* Security notice */}
      <Box 
        className="security-notice"
        sx={{ 
          mt: 'auto',
          background: 'rgba(10, 25, 41, 0.8)', // Darker and more opaque
          borderRadius: '10px',
          padding: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography 
          className="security-notice-text"
          sx={{
            fontSize: '0.85rem',
            color: '#E0E0E0', // Lighter color for better readability
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <span style={{ color: '#FFC107', fontSize: '1rem', marginBottom: '4px' }}>🔒</span>
          Your resume data is securely stored and automatically deleted after 24 hours.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InfoPanel;