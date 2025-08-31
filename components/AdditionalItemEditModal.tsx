import React, { useState, useCallback, useEffect } from 'react';
import type { AdditionalItem } from '../types';

interface AdditionalItemEditModalProps {
  item: AdditionalItem | null;
  onClose: () => void;
  onSave: (item: AdditionalItem) => void;
}

const getInitialState = (item: AdditionalItem | null): AdditionalItem => {
    return item || {
        id: '',
        category: '',
        productName: '',
        name: '',
        cost: 0,
        additionalPrice: 0,
        upgradePrice: null,
    };
};

export const AdditionalItemEditModal: React.FC<AdditionalItemEditModalProps> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState<AdditionalItem>(getInitialState(item));

    useEffect(() => {
        setFormData(getInitialState(item));
    }, [item]);
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | number | null = value;

        if (type === 'number') {
            if (name === 'upgradePrice' && value === '') {
                finalValue = null;
            } else {
                finalValue = Number(value) || 0;
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: finalValue as any }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
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
                    <h3 className="text-xl font-bold mb-4 text-primary">{item ? '상품 수정' : '새 상품 추가'}</h3>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1">구분</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-background rounded" required placeholder="예: 모니터" />
                    </div>
                     <div className="mb-4">
                        <label className="block text-text-secondary mb-1">상품명</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1">부품명</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                         <div>
                            <label className="block text-text-secondary mb-1">원가</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
                        </div>
                        <div>
                            <label className="block text-text-secondary mb-1">추가구매가</label>
                            <input type="number" name="additionalPrice" value={formData.additionalPrice} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
                        </div>
                        <div>
                            <label className="block text-text-secondary mb-1">변경구매가</label>
                            <input type="number" name="upgradePrice" value={formData.upgradePrice ?? ''} onChange={handleChange} className="w-full p-2 bg-background rounded" placeholder="없으면 비워두기" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary rounded hover:bg-secondary-hover">취소</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};