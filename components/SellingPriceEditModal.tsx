import React, { useState, useEffect } from 'react';
import type { ArizenPrimeBuild } from '../types';

interface SellingPriceEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (build: ArizenPrimeBuild, newName: string, newPrice: number | undefined) => void;
    build: ArizenPrimeBuild;
    cost: number;
}

export const SellingPriceEditModal: React.FC<SellingPriceEditModalProps> = ({ isOpen, onSave, onClose, build, cost }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<string>('');

    useEffect(() => {
        if (isOpen && build) {
            setName(build.name);
            if (build.customSellingPrice != null) {
                setPrice(String(build.customSellingPrice));
            } else {
                const calculatedPrice = Math.round(cost * 1.15);
                setPrice(String(calculatedPrice));
            }
        }
    }, [isOpen, build, cost]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceValue = price.trim();
        const newPrice = priceValue === '' ? undefined : Number(priceValue);
        
        if (priceValue !== '' && (isNaN(newPrice as number) || (newPrice as number) < 0)) {
            alert('유효한 숫자를 입력해주세요.');
            return;
        }
        
        onSave(build, name, newPrice);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-primary">판매가 수정</h3>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1" htmlFor="buildName">
                            구성 이름
                        </label>
                        <input
                            type="text"
                            id="buildName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 bg-background rounded text-text-primary"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1" htmlFor="sellingPrice">
                            판매가 (원)
                        </label>
                        <input
                            type="number"
                            id="sellingPrice"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-2 bg-background rounded"
                            placeholder="자동 계산 (원가 * 1.15)"
                            autoFocus
                        />
                         <p className="text-xs text-text-secondary mt-1">
                            *가격을 비우고 저장하면 자동으로 계산됩니다.
                        </p>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary rounded hover:bg-secondary-hover">
                            취소
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">
                            확인
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};