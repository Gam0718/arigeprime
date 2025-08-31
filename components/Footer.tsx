
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-text-secondary">
        <p>&copy; {new Date().getFullYear()} AI PC Builder. All rights reserved.</p>
      </div>
    </footer>
  );
};
