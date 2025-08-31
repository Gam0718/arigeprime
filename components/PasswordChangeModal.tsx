import React, { useState } from 'react';

interface PasswordChangeModalProps {
    onClose: () => void;
    onSave: (newPassword: string) => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        onSave(newPassword);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
                 <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-primary">비밀번호 변경</h3>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1" htmlFor="newPassword">
                            새 비밀번호
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 bg-background rounded"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1" htmlFor="confirmPassword">
                            새 비밀번호 확인
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 bg-background rounded"
                            required
                        />
                    </div>
                     {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary rounded hover:bg-secondary-hover">
                            취소
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};