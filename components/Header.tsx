import React from 'react';

interface HeaderProps {
    activeView: 'aiQuote' | 'admin';
    setActiveView: (view: 'aiQuote') => void;
    onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onAdminClick }) => {
  const NavButton: React.FC<{ view: 'aiQuote', children: React.ReactNode }> = ({ view, children }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
          isActive ? 'bg-primary text-white' : 'bg-transparent text-text-secondary hover:bg-card'
        }`}
      >
        {children}
      </button>
    );
  };
    
  return (
    <header className="bg-background shadow-lg sticky top-0 z-10 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary tracking-tight hidden sm:block">
              아리젠프라임
            </h1>
          </div>

          <div className="flex items-center gap-2 border border-border rounded-lg p-1">
             <NavButton view="aiQuote">AI 자동견적</NavButton>
          </div>

          <button
            onClick={onAdminClick}
            className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
              activeView === 'admin'
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-secondary text-text-primary hover:bg-secondary-hover'
            }`}
          >
            {activeView === 'admin' ? '관리자 모드' : 'Admin'}
          </button>
        </div>
      </div>
    </header>
  );
};