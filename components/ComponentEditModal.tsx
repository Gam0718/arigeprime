import React, { useState, useCallback } from 'react';
import type { ComponentCategory, AnyComponent } from '../types';

interface ComponentEditModalProps {
  category: ComponentCategory;
  component: AnyComponent | null;
  onClose: () => void;
  onSave: (category: ComponentCategory, component: AnyComponent) => void;
}

const getInitialState = (component: AnyComponent | null, category: ComponentCategory) => {
    const base = {
        id: '',
        name: '',
        productName: '',
        manufacturer: '',
        price: 0,
    };

    const categoryDefaults: { [key in ComponentCategory]: any } = {
        CPU: { ...base, score: 0, socket: 'LGA1700', tdp: 0, manufacturer: 'Intel' },
        Motherboard: { ...base, socket: 'LGA1700', memoryType: 'DDR5', formFactor: 'ATX' },
        Memory: { ...base, type: 'DDR5', capacity: 16 },
        GraphicsCard: { ...base, score: 0, length: 0, tdp: 0, manufacturer: 'NVIDIA' },
        SSD: { ...base, capacity: 1000 },
        PCCase: { ...base, formFactor: ['ATX'], maxGpuLength: 0 },
        PowerSupply: { ...base, wattage: 550 },
        CPUCooler: { ...base, supportedSockets: ['LGA1700'] },
        OS: { ...base, productName: 'WIN 11 HOME DSP', name: 'WIN 11 HOME DSP', price: 150000, manufacturer: 'Microsoft'}
    };

    return { ...(component || categoryDefaults[category]) };
};


export const ComponentEditModal: React.FC<ComponentEditModalProps> = ({ category, component, onClose, onSave }) => {
    const [formData, setFormData] = useState<any>(getInitialState(component, category));
    
    const handleOverlayClick = () => {
        alert('부품 수정 창이 열려 있습니다. 저장 또는 취소 버튼을 이용해 창을 닫아주세요.');
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;

        if ((category === 'PCCase' && name === 'formFactor') || (category === 'CPUCooler' && name === 'supportedSockets')) {
            finalValue = value.split(',').map(s => s.trim()).filter(Boolean);
        } else if (type === 'number') {
            finalValue = Number(value) || 0;
        }

        setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(category, formData as AnyComponent);
    };

    const renderCommonFields = () => (
        <>
            <div className="mb-4">
                <label className="block text-text-secondary mb-1">상품명</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full p-2 bg-background rounded" required placeholder="예: 인텔 코어 i9-14900K" />
            </div>
            <div className="mb-4">
                <label className="block text-text-secondary mb-1">부품명 (상세 모델명)</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
            </div>
            {category !== 'OS' && (
                 <div className="mb-4">
                    <label className="block text-text-secondary mb-1">제조사</label>
                    <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
                </div>
            )}
             <div className="mb-4">
                <label className="block text-text-secondary mb-1">가격</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
            </div>
        </>
    );

    const renderFieldsByCategory = () => {
        switch(category) {
            case 'CPU': return <>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">성능 점수</label>
                    <input type="number" name="score" value={formData.score} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">소켓</label>
                    <select name="socket" value={formData.socket} onChange={handleChange} className="w-full p-2 bg-background rounded"><option value="LGA1700">LGA1700</option><option value="AM5">AM5</option></select>
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">TDP (W)</label>
                    <input type="number" name="tdp" value={formData.tdp} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
            </>;
            case 'Motherboard': return <>
                 <div className="mb-4">
                    <label className="block text-text-secondary mb-1">소켓</label>
                    <select name="socket" value={formData.socket} onChange={handleChange} className="w-full p-2 bg-background rounded"><option value="LGA1700">LGA1700</option><option value="AM5">AM5</option></select>
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">메모리 타입</label>
                    <select name="memoryType" value={formData.memoryType} onChange={handleChange} className="w-full p-2 bg-background rounded"><option value="DDR4">DDR4</option><option value="DDR5">DDR5</option></select>
                </div>
                 <div className="mb-4">
                    <label className="block text-text-secondary mb-1">폼팩터</label>
                    <select name="formFactor" value={formData.formFactor} onChange={handleChange} className="w-full p-2 bg-background rounded"><option value="ATX">ATX</option><option value="M-ATX">M-ATX</option><option value="ITX">ITX</option></select>
                </div>
            </>;
            case 'Memory': return <>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">메모리 타입</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-background rounded">
                        <option value="DDR4">DDR4</option>
                        <option value="DDR5">DDR5</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">용량 (GB)</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
            </>;
            case 'GraphicsCard': return <>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">성능 점수</label>
                    <input type="number" name="score" value={formData.score} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">길이 (mm)</label>
                    <input type="number" name="length" value={formData.length} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">TDP (W)</label>
                    <input type="number" name="tdp" value={formData.tdp} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
            </>;
             case 'SSD': return <>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">용량 (GB)</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
            </>;
            case 'PCCase': return <>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">지원 폼팩터 (쉼표로 구분)</label>
                    <input type="text" name="formFactor" value={Array.isArray(formData.formFactor) ? formData.formFactor.join(', ') : ''} onChange={handleChange} className="w-full p-2 bg-background rounded" placeholder="ATX, M-ATX, ITX" />
                </div>
                <div className="mb-4">
                    <label className="block text-text-secondary mb-1">최대 GPU 길이 (mm)</label>
                    <input type="number" name="maxGpuLength" value={formData.maxGpuLength} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
            </>;
            case 'PowerSupply': return <>
                 <div className="mb-4">
                    <label className="block text-text-secondary mb-1">정격 출력 (W)</label>
                    <input type="number" name="wattage" value={formData.wattage} onChange={handleChange} className="w-full p-2 bg-background rounded" />
                </div>
            </>;
            case 'CPUCooler': return <>
                 <div className="mb-4">
                    <label className="block text-text-secondary mb-1">지원 소켓 (쉼표로 구분)</label>
                    <input type="text" name="supportedSockets" value={Array.isArray(formData.supportedSockets) ? formData.supportedSockets.join(', ') : ''} onChange={handleChange} className="w-full p-2 bg-background rounded" placeholder="LGA1700, AM5" />
                </div>
            </>;
            case 'OS':
                return null;
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
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
                    <h3 className="text-xl font-bold mb-4 text-primary">{component ? '부품 수정' : '새 부품 추가'}</h3>
                    {renderCommonFields()}
                    {renderFieldsByCategory()}
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary rounded hover:bg-secondary-hover">취소</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};