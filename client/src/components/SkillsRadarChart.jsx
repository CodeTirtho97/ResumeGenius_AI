import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

const SkillsRadarChart = ({ matchedSkills, missingSkills }) => {
  // Prepare data for radar chart
  const prepareRadarData = () => {
    // Combine matched and missing skills, showing up to 6 skills for readability
    const allSkills = [...matchedSkills, ...missingSkills].slice(0, 6);
    
    return allSkills.map(skill => ({
      skill,
      'Your Resume': matchedSkills.includes(skill) ? 100 : 0,
      'Job Requirements': 100
    }));
  };

  return (
    <Box sx={{ 
      width: '100%', 
      background: 'rgba(20, 20, 28, 0.7)', 
      borderRadius: '12px', 
      padding: '20px',
      marginTop: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
    }}>
      <Typography sx={{ 
        textAlign: 'center', 
        color: '#00E0FF',
        marginBottom: '15px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        Skills Match Analysis
      </Typography>
      
      {/* IMPORTANT FIX: Use a fixed height to ensure the chart is fully visible */}
      <Box sx={{ width: '100%', height: 320, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={90} data={prepareRadarData()}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: '#DDD', fontSize: 12 }} 
              tickFormatter={(value) => {
                // Truncate long skill names
                return value.length > 10 ? value.substring(0, 8) + '...' : value;
              }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#AAA' }} />
            
            <Radar 
              name="Your Resume" 
              dataKey="Your Resume" 
              stroke="#00E0FF" 
              fill="#00E0FF" 
              fillOpacity={0.5} 
            />
            
            <Radar 
              name="Job Requirements" 
              dataKey="Job Requirements" 
              stroke="#FF5733" 
              fill="#FF5733" 
              fillOpacity={0.3} 
            />
            
            <Legend wrapperStyle={{ color: '#FFF' }} />
            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
          </RadarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '10px',
        color: '#CCC',
        fontSize: '13px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00E0FF' }}></Box>
          <Typography sx={{ fontSize: '12px', color: '#CCC' }}>Present in your resume</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5733' }}></Box>
          <Typography sx={{ fontSize: '12px', color: '#CCC' }}>Required for job</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SkillsRadarChart;