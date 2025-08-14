import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    icon, 
    title, 
    value, 
    change, 
    changeType,
    iconBgColor = 'bg-gray-700/50', 
    iconColor = 'text-brand-text-primary',
    subtitle
}) => {
  
  const changeColor = changeType === 'increase' ? 'text-brand-success' : 'text-brand-danger';

  const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );

  const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
          <polyline points="16 17 22 17 22 11"/>
      </svg>
  );

  return (
    <div className="bg-brand-surface p-6 rounded-2xl flex items-start gap-5 shadow-lg border border-brand-border">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-grow overflow-hidden min-w-0">
        <p className="text-sm text-brand-text-secondary font-medium truncate">{title}</p>
        <div className="flex items-end gap-2 flex-wrap">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-brand-text-light break-words leading-tight">{value}</p>
            {change && (
                <div className={`flex items-center text-sm font-semibold ${changeColor}`}>
                    {changeType === 'increase' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    <span className="ml-0.5">{change}</span>
                </div>
            )}
        </div>
        {subtitle && <p className="text-sm text-brand-text-secondary mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;