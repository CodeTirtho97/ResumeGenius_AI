import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const SkillsRadarChart = ({ matchedSkills, missingSkills }) => {
  // Prepare data for radar chart
  const prepareRadarData = () => {
    // Combine matched and missing skills, showing up to 8 skills for readability
    const allSkills = [...matchedSkills, ...missingSkills].slice(0, 8);
    
    return allSkills.map(skill => ({
      skill,
      'Your Resume': matchedSkills.includes(skill) ? 100 : 0,
      'Job Requirements': 100
    }));
  };

  return (
    <div style={{ 
      background: 'rgba(20, 20, 28, 0.7)', 
      borderRadius: '12px', 
      padding: '20px',
      marginTop: '20px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
    }}>
      <h3 style={{ 
        textAlign: 'center', 
        color: '#00E0FF',
        marginBottom: '15px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        Skills Match Analysis
      </h3>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RadarChart outerRadius={90} data={prepareRadarData()}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: '#DDD', fontSize: 12 }} />
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
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        marginTop: '10px',
        color: '#CCC',
        fontSize: '13px'
      }}>
        <div>
          <span style={{ color: '#00E0FF', fontWeight: 'bold' }}>●</span> Present in your resume
        </div>
        <div>
          <span style={{ color: '#FF5733', fontWeight: 'bold' }}>●</span> Required for job
        </div>
      </div>
    </div>
  );
};

export default SkillsRadarChart;