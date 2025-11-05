import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  
  const formatLargeNumber = (num) => {
    if (typeof num === 'string' && num.includes('₹')) {
     
      const numericValue = parseFloat(num.replace(/[₹,]/g, ''));
      return formatCurrency(numericValue);
    }
    
    if (typeof num === 'number') {
      return formatCount(num);
    }
    
    return value;
  };

  const formatCount = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) { 
      const crores = amount / 10000000;
      return `₹${crores.toFixed(1)}Cr`;
    } else if (amount >= 100000) { 
      const lakhs = amount / 100000;
      return `₹${lakhs.toFixed(1)}L`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return `₹${thousands.toFixed(1)}K`;
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDisplayValue = () => {
    if (typeof value === 'string' && value.includes('₹')) {
      const numericValue = parseFloat(value.replace(/[₹,]/g, ''));
      return formatCurrency(numericValue);
    }
    if (typeof value === 'number') {
      return formatCount(value);
    }
    return value;
  };

  const getFullValue = () => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-IN').format(value);
    }
    return value;
  };

  return (
    <div className="stats-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stats-content">
        <div className="stats-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="stats-info">
          <h3 title={getFullValue()}>{getDisplayValue()}</h3>
          <p>{title}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;