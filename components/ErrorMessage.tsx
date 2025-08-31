
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-lg" role="alert">
      <p className="font-bold">오류 발생</p>
      <p>{message}</p>
    </div>
  );
};
