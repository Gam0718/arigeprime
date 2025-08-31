import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-red-500 w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2 text-text-primary">삭제 확인</h3>
                    <p className="text-text-secondary mb-6">
                        '<span className="font-semibold text-text-primary">{itemName}</span>' 항목을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2 bg-secondary text-white rounded hover:bg-secondary-hover font-semibold transition-colors"
                        >
                            취소
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};