import React from 'react';

interface ComponentCardProps {
  category: string;
  name: string;
  advantage?: string;
  iconUrl: string;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ category, name, advantage, iconUrl }) => {
  return (
    <div className="bg-background p-4 rounded-lg shadow-lg border border-border hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center mb-3">
        <img src={iconUrl} alt={category} className="w-8 h-8 mr-3"/>
        <h4 className="text-lg font-bold text-primary">{category}</h4>
      </div>
      <p className="text-md text-text-primary font-medium">{name}</p>
      {advantage && (
        <p className="text-sm text-text-secondary mt-2 border-t border-border/50 pt-2">{advantage}</p>
      )}
    </div>
  );
};