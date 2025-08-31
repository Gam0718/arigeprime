import React from 'react';
import { ComponentCard } from './ComponentCard';
import type { PCBuild } from '../types';
import { categoryInfo, apiNameMap } from '../types';

interface QuoteDisplayProps {
  quote: PCBuild;
}

const QuoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote }) => {
  const { totalPrice, totalScore, reasoning, ...components } = quote;
  const componentList = Object.entries(components);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value) + '원';
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-2xl animate-fade-in">
      <div className="mb-6 bg-background/50 p-4 rounded-lg border-l-4 border-primary">
        <h3 className="text-xl font-bold text-text-primary flex items-center"><QuoteIcon /> AI의 추천 사유</h3>
        <p className="text-text-secondary mt-2">{reasoning}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-background p-4 rounded-lg text-center">
          <p className="text-sm text-text-secondary">총 견적 금액</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
        </div>
        <div className="bg-background p-4 rounded-lg text-center">
          <p className="text-sm text-text-secondary">종합 성능 점수</p>
          <p className="text-3xl font-bold text-primary">{totalScore}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">최종 견적서</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {componentList.map(([key, component]) => {
            if (!('id' in component)) return null;

            const categoryKey = apiNameMap[key];
            const info = categoryKey ? categoryInfo[categoryKey] : null;
            const defaultIcon = 'https://img.icons8.com/fluency/48/server.png';

            return (
                <ComponentCard 
                    key={component.id} 
                    category={info ? info.displayName : key}
                    name={component.name}
                    advantage={component.advantage}
                    iconUrl={info ? info.iconUrl : defaultIcon}
                />
            );
        })}
      </div>
    </div>
  );
};