import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  barWidth?: string;
  bgColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, barWidth = 'w-full', bgColor = 'bg-blue-500' }) => {
  const percent = Math.round(progress);
  return (
    <div className={`${barWidth}`}>
      <div className={`w-full h-4 bg-gray-400 rounded-full overflow-hidden shadow-inner`}>
        <div
          className={`h-full ${bgColor} rounded-full transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
