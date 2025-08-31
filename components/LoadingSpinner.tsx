
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl shadow-2xl">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <p className="mt-4 text-lg text-text-secondary font-semibold">AI가 최적의 부품을 찾고 있습니다. 잠시만 기다려주세요...</p>
    </div>
  );
};
