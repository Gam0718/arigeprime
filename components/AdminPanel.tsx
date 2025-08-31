import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { componentCategoryMap, categoryToKeyMap } from '../types';
import type { AllComponents, ComponentCategory, AnyComponent, AdditionalItem, ArizenPrimeBuild, CommissionRates, OS } from '../types';
import { ComponentEditModal } from './ComponentEditModal';
import { PasswordChangeModal } from './PasswordChangeModal';
import { AdditionalItemEditModal } from './AdditionalItemEditModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SellingPriceEditModal } from './SellingPriceEditModal';

interface AdminPanelProps {
  components: AllComponents;
  onUpdate: (category: ComponentCategory, component: AnyComponent) => void;
  onAdd: (category: ComponentCategory, component: Omit<AnyComponent, 'id'>) => void;
  onDelete: (category: ComponentCategory, componentId: string) => void;
  onPasswordChange: (newPassword: string) => void;
  additionalItems: AdditionalItem[];
  onAdditionalItemUpdate: (item: AdditionalItem) => void;
  onAdditionalItemAdd: (item: Omit<AdditionalItem, 'id'>) => void;
  onAdditionalItemDelete: (itemId: string) => void;
  onBulkUpdateComponents: (category: ComponentCategory, components: AnyComponent[]) => void;
  onBulkAddAdditionalItems: (items: AdditionalItem[]) => void;
  arizenBuilds: ArizenPrimeBuild[];
  onArizenBuildAdd: (build: Omit<ArizenPrimeBuild, 'id'>) => void;
  onArizenBuildUpdate: (build: ArizenPrimeBuild) => void;
  onArizenBuildDelete: (buildId: string) => void;
  commissionRates: CommissionRates;
  onCommissionChange: (rates: CommissionRates) => void;
}

const displayCategoryOrder: ComponentCategory[] = ['CPU', 'CPUCooler', 'Memory', 'Motherboard', 'GraphicsCard', 'SSD', 'PCCase', 'PowerSupply', 'OS'];

const categoryToBuildIdKey: { [key in ComponentCategory]: keyof Omit<ArizenPrimeBuild, 'id' | 'name' | 'customSellingPrice'> } = {
    CPU: 'cpuId',
    Motherboard: 'motherboardId',
    Memory: 'memoryId',
    GraphicsCard: 'graphicsCardId',
    SSD: 'ssdId',
    PCCase: 'pcCaseId',
    PowerSupply: 'powerSupplyId',
    CPUCooler: 'cpuCoolerId',
    OS: 'osId',
};


const formatCurrency = (value: number | null) => {
    if (value === null || typeof value === 'undefined') return '-';
    return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
};

const csvHeaders: {[key in ComponentCategory | 'AdditionalItem' | 'SimpleAdditionalItem']: string} = {
    CPU: 'id,productName,manufacturer,name,price,score,socket,tdp',
    Motherboard: 'id,productName,manufacturer,name,price,socket,memoryType,formFactor',
    Memory: 'id,productName,manufacturer,name,price,type,capacity',
    GraphicsCard: 'id,productName,manufacturer,name,price,score,length,tdp',
    SSD: 'id,productName,manufacturer,name,price,capacity',
    PCCase: 'id,productName,manufacturer,name,price,formFactor,maxGpuLength',
    PowerSupply: 'id,productName,manufacturer,name,price,wattage',
    CPUCooler: 'id,productName,manufacturer,name,price,supportedSockets',
    OS: 'id,productName,name,price',
    AdditionalItem: 'id,category,productName,name,cost,additionalPrice,upgradePrice',
    SimpleAdditionalItem: 'name,price', // This seems obsolete now, but keeping for reference.
}

interface ArizenPrimeBuildEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (build: ArizenPrimeBuild) => void;
    build: ArizenPrimeBuild | null;
    components: AllComponents;
}

const ArizenPrimeBuildEditModal: React.FC<ArizenPrimeBuildEditModalProps> = ({ isOpen, onClose, onSave, build, components }) => {
    const getInitialState = (p: ArizenPrimeBuild | null): ArizenPrimeBuild => {
        return p || {
            id: '',
            name: '',
            cpuId: '',
            motherboardId: '',
            memoryId: '',
            graphicsCardId: '',
            ssdId: '',
            pcCaseId: '',
            powerSupplyId: '',
            cpuCoolerId: '',
            osId: '',
        };
    };
    
    const [formData, setFormData] = useState<ArizenPrimeBuild>(getInitialState(build));

    useEffect(() => {
        setFormData(getInitialState(build));
    }, [build, isOpen]);
    
    const totalCost = useMemo(() => {
        let cost = 0;
        const allComponentsList = Object.values(components).flat();
        Object.values(categoryToBuildIdKey).forEach(key => {
            const componentId = formData[key];
            if (componentId) {
                cost += allComponentsList.find(c => c.id === componentId)?.price || 0;
            }
        });
        return cost;
    }, [formData, components]);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const componentFields: { key: keyof Omit<ArizenPrimeBuild, 'id' | 'name' | 'customSellingPrice'>, label: string, options: AnyComponent[] }[] = [
        { key: 'cpuId', label: 'CPU', options: components.CPUS },
        { key: 'motherboardId', label: '메인보드', options: components.MOTHERBOARDS },
        { key: 'memoryId', label: '메모리', options: components.MEMORIES },
        { key: 'graphicsCardId', label: '그래픽카드', options: components.GRAPHICS_CARDS },
        { key: 'ssdId', label: 'SSD', options: components.SSDS },
        { key: 'pcCaseId', label: '케이스', options: components.CASES },
        { key: 'powerSupplyId', label: '파워서플라이', options: components.POWER_SUPPLIES },
        { key: 'cpuCoolerId', label: 'CPU 쿨러', options: components.CPU_COOLERS },
        { key: 'osId', label: '운영체제 (OS)', options: components.OS },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
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
                    <h3 className="text-xl font-bold mb-4 text-primary">{build ? '아리젠프라임구성 수정' : '새 아리젠프라임구성 추가'}</h3>
                    <div className="mb-4">
                        <label className="block text-text-secondary mb-1">구성 이름</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-background rounded" required />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {componentFields.map(({ key, label, options }) => (
                            <div key={key}>
                                <label className="block text-text-secondary mb-1">{label}</label>
                                <select name={key} value={(formData as any)[key]} onChange={handleChange} className="w-full p-2 bg-background rounded" required>
                                    <option value="">-- {label} 선택 --</option>
                                    {options.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-background/50 rounded-lg text-right">
                        <span className="text-lg font-semibold text-text-primary">예상 원가: {formatCurrency(totalCost)}</span>
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


export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    components, onUpdate, onAdd, onDelete, onPasswordChange, 
    additionalItems, onAdditionalItemAdd, onAdditionalItemUpdate, onAdditionalItemDelete,
    onBulkUpdateComponents, onBulkAddAdditionalItems,
    arizenBuilds, onArizenBuildAdd, onArizenBuildUpdate, onArizenBuildDelete,
    commissionRates, onCommissionChange
}) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; category: ComponentCategory | null; component: AnyComponent | null }>({
        isOpen: false,
        category: null,
        component: null,
    });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [additionalItemModalState, setAdditionalItemModalState] = useState<{ isOpen: boolean; item: AdditionalItem | null }>({
        isOpen: false,
        item: null,
    });

    const [activeTab, setActiveTab] = useState<'components' | 'additional' | 'arizenPrime' | 'docs' | 'commission'>('arizenPrime');
    const [localCommissionRates, setLocalCommissionRates] = useState<CommissionRates>(commissionRates);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    
    const [deleteModalInfo, setDeleteModalInfo] = useState<{
        isOpen: boolean;
        itemName: string;
        onConfirm: () => void;
    } | null>(null);

    const [arizenModalState, setArizenModalState] = useState<{ isOpen: boolean; build: ArizenPrimeBuild | null }>({
        isOpen: false,
        build: null,
    });
    
    const [priceEditModalState, setPriceEditModalState] = useState<{
        isOpen: boolean;
        buildId: string | null;
    }>({
        isOpen: false,
        buildId: null,
    });

    const [expandedBuildId, setExpandedBuildId] = useState<string | null>(null);

    // For Docs Tab
    const [selectedBuildId, setSelectedBuildId] = useState<string>('');
    const [activeDocTab, setActiveDocTab] = useState<'quote' | 'invoice'>('quote');

    useEffect(() => {
        setLocalCommissionRates(commissionRates);
    }, [commissionRates]);

    const allComponentsMap = useMemo(() => {
        const map = new Map<string, AnyComponent>();
        Object.values(components).flat().forEach(component => {
            map.set(component.id, component);
        });
        return map;
    }, [components]);

    const selectedBuildDetails = useMemo(() => {
        if (!selectedBuildId) return null;
        const build = arizenBuilds.find(b => b.id === selectedBuildId);
        if (!build) return null;

        const buildComponents = new Map<ComponentCategory, AnyComponent>();
        let totalCost = 0;
        
        displayCategoryOrder.forEach(category => {
            const componentIdKey = categoryToBuildIdKey[category];
            const componentId = build[componentIdKey];
            if (componentId) {
                const component = allComponentsMap.get(componentId);
                if (component) {
                    buildComponents.set(category, component);
                    totalCost += component.price;
                }
            }
        });
        
        const sellingPrice = build.customSellingPrice ?? totalCost * 1.15;

        return { build, components: buildComponents, totalCost, sellingPrice };
    }, [selectedBuildId, arizenBuilds, allComponentsMap]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: ComponentCategory) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length === 0) {
                    alert('파일에 데이터가 없습니다.');
                    return;
                }
                const headers = lines.shift()?.split(',').map(h => h.trim()) || [];
                
                const data = lines.map(line => {
                    const values = line.split(',');
                    const obj: any = {};
                    headers.forEach((header, index) => {
                        const value = values[index]?.trim() || '';
                        if (['price', 'score', 'tdp', 'capacity', 'length', 'wattage', 'maxGpuLength'].includes(header)) {
                            obj[header] = Number(value);
                        } else if (['formFactor', 'supportedSockets'].includes(header)) {
                            obj[header] = value.split(';').map(s => s.trim());
                        } else {
                            obj[header] = value;
                        }
                    });
                    return obj;
                });
                onBulkUpdateComponents(type, data as AnyComponent[]);
                
            } catch (error) {
                console.error("CSV 파싱 오류:", error);
                alert("CSV 파일을 처리하는 중 오류가 발생했습니다. 파일 형식과 내용을 확인해주세요.");
            } finally {
                e.target.value = ''; // Reset file input
            }
        };
        reader.readAsText(file, 'utf-8');
    };

    const handleOpenModal = (category: ComponentCategory, component: AnyComponent | null = null) => {
        setModalState({ isOpen: true, category, component });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, category: null, component: null });
    };

    const handleSave = (category: ComponentCategory, componentData: AnyComponent) => {
        if ('id' in componentData && componentData.id && components[categoryToKeyMap[category]].some(c => c.id === componentData.id)) {
            onUpdate(category, componentData);
        } else {
            const { id, ...rest } = componentData;
            onAdd(category, rest);
        }
        handleCloseModal();
    };

    const handleDelete = (category: ComponentCategory, component: AnyComponent) => {
        setDeleteModalInfo({
            isOpen: true,
            itemName: component.name,
            onConfirm: () => {
                onDelete(category, component.id);
                setDeleteModalInfo(null);
            }
        });
    };
    
    const handleOpenAdditionalItemModal = (item: AdditionalItem | null = null) => {
        setAdditionalItemModalState({ isOpen: true, item });
    };

    const handleCloseAdditionalItemModal = () => {
        setAdditionalItemModalState({ isOpen: false, item: null });
    };

    const handleSaveAdditionalItem = (itemData: AdditionalItem) => {
        if (itemData.id && additionalItems.some(item => item.id === itemData.id)) {
            onAdditionalItemUpdate(itemData);
        } else {
            const { id, ...rest } = itemData;
            onAdditionalItemAdd(rest);
        }
        handleCloseAdditionalItemModal();
    };
    
    const handleDeleteAdditionalItem = (item: AdditionalItem) => {
        setDeleteModalInfo({
            isOpen: true,
            itemName: item.productName,
            onConfirm: () => {
                onAdditionalItemDelete(item.id);
                setDeleteModalInfo(null);
            }
        });
    };
    
    const handleOpenArizenModal = (build: ArizenPrimeBuild | null = null) => {
        setArizenModalState({ isOpen: true, build });
    };

    const handleCloseArizenModal = () => {
        setArizenModalState({ isOpen: false, build: null });
    };

    const handleSaveArizenBuild = (buildData: ArizenPrimeBuild) => {
        if (buildData.id && arizenBuilds.some(p => p.id === buildData.id)) {
            onArizenBuildUpdate(buildData);
        } else {
            const { id, ...rest } = buildData;
            onArizenBuildAdd(rest);
        }
        handleCloseArizenModal();
    };

    const handleDeleteArizenBuild = (build: ArizenPrimeBuild) => {
        setDeleteModalInfo({
            isOpen: true,
            itemName: `구성 ${build.name}`,
            onConfirm: () => {
                onArizenBuildDelete(build.id);
                setDeleteModalInfo(null);
            }
        });
    };

    const handleOpenPriceEditModal = useCallback((buildId: string) => {
        setPriceEditModalState({ isOpen: true, buildId });
    }, []);

    const handleSaveSellingPrice = (build: ArizenPrimeBuild, newName: string, newPrice: number | undefined) => {
        onArizenBuildUpdate({ ...build, name: newName, customSellingPrice: newPrice });
        setPriceEditModalState({ isOpen: false, buildId: null });
    };
    
    const handleCloseDeleteModal = () => {
        setDeleteModalInfo(null);
    };

    const handleCommissionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalCommissionRates(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    const handleCommissionSave = () => {
        setIsCommissionModalOpen(true);
    };
    
    const handleConfirmCommissionSave = () => {
        onCommissionChange(localCommissionRates);
        setIsCommissionModalOpen(false);
        alert('수수료 설정이 저장되었습니다.');
    };

    const buildToEdit = useMemo(() => {
        if (!priceEditModalState.buildId) return null;
        return arizenBuilds.find(b => b.id === priceEditModalState.buildId) || null;
    }, [priceEditModalState.buildId, arizenBuilds]);

    const costOfBuildToEdit = useMemo(() => {
        if (!buildToEdit) return null;
        return (Object.keys(categoryToBuildIdKey) as ComponentCategory[]).reduce((acc, category) => {
            const componentId = buildToEdit[categoryToBuildIdKey[category]];
            const component = allComponentsMap.get(componentId);
            return acc + (component?.price || 0);
        }, 0);
    }, [buildToEdit, allComponentsMap]);

    const toggleBuildDetails = (buildId: string) => {
        setExpandedBuildId(prevId => (prevId === buildId ? null : buildId));
    };


    return (
        <div className="bg-card p-6 rounded-xl shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-primary">관리자 페이지</h2>
                <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-hover transition-colors duration-300"
                >
                    비밀번호 변경
                </button>
            </div>
            
            <div className="flex border-b-2 border-border mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('components')} className={`px-4 py-3 text-lg font-semibold transition-colors focus:outline-none whitespace-nowrap ${ activeTab === 'components' ? 'border-b-4 border-primary text-primary' : 'text-text-secondary hover:text-text-primary' }`}>일일단가</button>
                <button onClick={() => setActiveTab('additional')} className={`px-4 py-3 text-lg font-semibold transition-colors focus:outline-none whitespace-nowrap ${ activeTab === 'additional' ? 'border-b-4 border-primary text-primary' : 'text-text-secondary hover:text-text-primary' }`}>추가구매</button>
                <button onClick={() => setActiveTab('arizenPrime')} className={`px-4 py-3 text-lg font-semibold transition-colors focus:outline-none whitespace-nowrap ${ activeTab === 'arizenPrime' ? 'border-b-4 border-primary text-primary' : 'text-text-secondary hover:text-text-primary' }`}>아리젠프라임</button>
                <button onClick={() => setActiveTab('docs')} className={`px-4 py-3 text-lg font-semibold transition-colors focus:outline-none whitespace-nowrap ${ activeTab === 'docs' ? 'border-b-4 border-primary text-primary' : 'text-text-secondary hover:text-text-primary' }`}>견적/거래명세서</button>
                <button onClick={() => setActiveTab('commission')} className={`px-4 py-3 text-lg font-semibold transition-colors focus:outline-none whitespace-nowrap ${ activeTab === 'commission' ? 'border-b-4 border-primary text-primary' : 'text-text-secondary hover:text-text-primary' }`}>마켓수수료</button>
            </div>

            {activeTab === 'components' && (
                 <div className="space-y-8">
                    {displayCategoryOrder.map(category => {
                        const categoryKey = categoryToKeyMap[category];
                        const componentList = components[categoryKey] as AnyComponent[];
                        
                        return (
                            <div key={category} className="bg-background p-4 rounded-lg">
                                <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                                    <h4 className="text-xl font-semibold text-text-primary">{componentCategoryMap[category]}</h4>
                                    <div className="flex gap-2">
                                        <label className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 cursor-pointer">
                                            CSV 일괄 덮어쓰기
                                            <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, category)} />
                                        </label>
                                        <button
                                            onClick={() => handleOpenModal(category)}
                                            className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors duration-300"
                                        >
                                            새 부품 추가
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b border-border">
                                            <tr>
                                                <th className="p-2">상품명</th>
                                                <th className="p-2">부품명</th>
                                                <th className="p-2 text-right">가격</th>
                                                <th className="p-2 text-center" style={{ width: '80px' }}>수정</th>
                                                <th className="p-2 text-center" style={{ width: '80px' }}>삭제</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {componentList.map(item => (
                                                <tr key={item.id} className="border-b border-border/50">
                                                    <td className="p-2 font-semibold">{item.productName}</td>
                                                    <td className="p-2">{item.name}</td>
                                                    <td className="p-2 text-right font-mono">{formatCurrency(item.price)}</td>
                                                    <td className="p-2 text-center">
                                                        <button 
                                                            onClick={() => handleOpenModal(category, item)}
                                                            className="text-primary hover:text-blue-400"
                                                        >
                                                            수정
                                                        </button>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button 
                                                            onClick={() => handleDelete(category, item)}
                                                            className="text-red-500 hover:text-red-400"
                                                        >
                                                            삭제
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-2 text-xs text-text-secondary">
                                    <p><b>CSV 헤더 형식 (덮어쓰기):</b> {csvHeaders[category]}</p>
                                    <p>*배열(formFactor, supportedSockets)은 세미콜론(;)으로 구분합니다. (예: ATX;M-ATX)</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'additional' && (
                 <div className="bg-background p-4 rounded-lg">
                     <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                        <h4 className="text-xl font-semibold text-text-primary">상품 목록</h4>
                         <button
                            onClick={() => handleOpenAdditionalItemModal()}
                            className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors duration-300"
                        >
                            새 상품 추가
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-border">
                                <tr>
                                    <th className="p-2">구분</th>
                                    <th className="p-2">상품명</th>
                                    <th className="p-2">부품명</th>
                                    <th className="p-2 text-right">원가</th>
                                    <th className="p-2 text-right">추가구매가</th>
                                    <th className="p-2 text-right">변경구매가</th>
                                    <th className="p-2 text-right">네이버정산가</th>
                                    <th className="p-2 text-right">쿠팡정산가</th>
                                    <th className="p-2 text-right">마켓정산가</th>
                                    <th className="p-2 text-center">수정</th>
                                    <th className="p-2 text-center">삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                                {additionalItems.map(item => {
                                    const naverSettlement = item.additionalPrice * (1 - commissionRates.naver / 100);
                                    const coupangSettlement = item.additionalPrice * (1 - commissionRates.coupang / 100);
                                    const marketSettlement = item.additionalPrice * (1 - commissionRates.market / 100);
                                    return (
                                        <tr key={item.id} className="border-b border-border/50">
                                            <td className="p-2">{item.category}</td>
                                            <td className="p-2 font-semibold">{item.productName}</td>
                                            <td className="p-2">{item.name}</td>
                                            <td className="p-2 text-right font-mono">{formatCurrency(item.cost)}</td>
                                            <td className="p-2 text-right font-mono text-green-400">{formatCurrency(item.additionalPrice)}</td>
                                            <td className="p-2 text-right font-mono text-yellow-400">{formatCurrency(item.upgradePrice)}</td>
                                            <td className="p-2 text-right font-mono text-cyan-400">{formatCurrency(naverSettlement)}</td>
                                            <td className="p-2 text-right font-mono text-cyan-400">{formatCurrency(coupangSettlement)}</td>
                                            <td className="p-2 text-right font-mono text-cyan-400">{formatCurrency(marketSettlement)}</td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => handleOpenAdditionalItemModal(item)} className="text-primary hover:text-blue-400">
                                                    수정
                                                </button>
                                            </td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => handleDeleteAdditionalItem(item)} className="text-red-500 hover:text-red-400">
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'arizenPrime' && (
                <div className="space-y-8">
                    <div className="bg-background p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold text-text-primary">PC 구성 목록</h4>
                            <button
                                onClick={() => handleOpenArizenModal()}
                                className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors duration-300"
                            >
                                새 구성 추가
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-border">
                                    <tr>
                                        <th className="p-2">이름</th>
                                        <th className="p-2 text-right">원가</th>
                                        <th className="p-2 text-right">판매가</th>
                                        <th className="p-2 text-right">네이버정산가</th>
                                        <th className="p-2 text-right">쿠팡정산가</th>
                                        <th className="p-2 text-right">마켓정산가</th>
                                        <th className="p-2 text-center">수정</th>
                                        <th className="p-2 text-center">삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arizenBuilds.map(build => {
                                        const cost = (Object.keys(categoryToBuildIdKey) as ComponentCategory[])
                                            .reduce((acc, category) => {
                                                const componentId = build[categoryToBuildIdKey[category]];
                                                const component = allComponentsMap.get(componentId);
                                                return acc + (component?.price || 0);
                                            }, 0);
                                        
                                        const sellingPrice = build.customSellingPrice ?? cost * 1.15;
                                        const naverPrice = sellingPrice * (1 - commissionRates.naver / 100);
                                        const coupangPrice = sellingPrice * (1 - commissionRates.coupang / 100);
                                        const marketPrice = sellingPrice * (1 - commissionRates.market / 100);

                                        const naverMargin = naverPrice - cost;
                                        const coupangMargin = coupangPrice - cost;
                                        const marketMargin = marketPrice - cost;

                                        return (
                                            <React.Fragment key={build.id}>
                                                <tr className="border-b border-border/50">
                                                    <td className="p-2 font-semibold cursor-pointer hover:text-primary" onClick={() => toggleBuildDetails(build.id)}>
                                                        {build.name}
                                                    </td>
                                                    <td className="p-2 text-right font-mono">{formatCurrency(cost)}</td>
                                                    <td 
                                                        className="p-2 text-right font-mono text-green-400 cursor-pointer hover:bg-slate-700/50"
                                                        onClick={() => handleOpenPriceEditModal(build.id)}
                                                    >
                                                        {formatCurrency(sellingPrice)}
                                                    </td>
                                                    <td className="p-2 text-right font-mono">
                                                        <div className="text-cyan-400">{formatCurrency(naverPrice)}</div>
                                                        <div className="text-xs text-sky-600">({formatCurrency(naverMargin)})</div>
                                                    </td>
                                                    <td className="p-2 text-right font-mono">
                                                        <div className="text-cyan-400">{formatCurrency(coupangPrice)}</div>
                                                        <div className="text-xs text-sky-600">({formatCurrency(coupangMargin)})</div>
                                                    </td>
                                                    <td className="p-2 text-right font-mono">
                                                        <div className="text-cyan-400">{formatCurrency(marketPrice)}</div>
                                                        <div className="text-xs text-sky-600">({formatCurrency(marketMargin)})</div>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button onClick={() => handleOpenArizenModal(build)} className="text-primary hover:text-blue-400">수정</button>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button onClick={() => handleDeleteArizenBuild(build)} className="text-red-500 hover:text-red-400">삭제</button>
                                                    </td>
                                                </tr>
                                                {expandedBuildId === build.id && (
                                                    <tr className="bg-background/50">
                                                        <td colSpan={8} className="p-4">
                                                            <h5 className="text-lg font-semibold mb-2 text-text-primary">'{build.name}' 구성품 상세</h5>
                                                            <table className="w-full text-sm">
                                                                <thead className="border-b border-border">
                                                                    <tr>
                                                                        <th className="p-2 text-left">카테고리</th>
                                                                        <th className="p-2 text-left">부품명</th>
                                                                        <th className="p-2 text-right">원가</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(Object.keys(categoryToBuildIdKey) as ComponentCategory[]).map(category => {
                                                                        const componentId = build[categoryToBuildIdKey[category]];
                                                                        const component = allComponentsMap.get(componentId);
                                                                        return (
                                                                            <tr key={category} className="border-b border-border/20 last:border-b-0">
                                                                                <td className="p-2">{componentCategoryMap[category]}</td>
                                                                                <td className="p-2">{component?.name || 'N/A'}</td>
                                                                                <td className="p-2 text-right font-mono">{formatCurrency(component?.price || 0)}</td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'docs' && (
                 <div className="space-y-8">
                     <div className="bg-background p-6 rounded-xl">
                        <label htmlFor="build-select" className="block text-lg font-semibold mb-2 text-text-primary">
                            출력할 상품 번호 선택
                        </label>
                        <select
                            id="build-select"
                            value={selectedBuildId}
                            onChange={(e) => setSelectedBuildId(e.target.value)}
                            className="w-full p-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        >
                            <option value="">-- 아리젠프라임구성 선택 --</option>
                            {arizenBuilds.map(build => (
                                <option key={build.id} value={build.id}>{build.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedBuildDetails && (
                        <div className="bg-background p-6 rounded-xl animate-fade-in">
                            <div className="flex border-b-2 border-border mb-6">
                                <button
                                    onClick={() => setActiveDocTab('quote')}
                                    className={`px-6 py-3 text-lg font-semibold transition-colors focus:outline-none ${
                                        activeDocTab === 'quote'
                                        ? 'border-b-4 border-primary text-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    견적서
                                </button>
                                <button
                                    onClick={() => setActiveDocTab('invoice')}
                                    className={`px-6 py-3 text-lg font-semibold transition-colors focus:outline-none ${
                                        activeDocTab === 'invoice'
                                        ? 'border-b-4 border-primary text-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    거래명세표
                                </button>
                            </div>

                            {activeDocTab === 'quote' && (
                                <div>
                                    <h2 className="text-3xl font-bold text-center mb-6 text-primary">견 적 서</h2>
                                    <p className="text-xl mb-4"><span className="font-semibold text-text-secondary">상품명:</span> {selectedBuildDetails.build.name}</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="border-b-2 border-primary bg-card/50">
                                                <tr>
                                                    <th className="p-3">카테고리</th>
                                                    <th className="p-3">상품명</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayCategoryOrder.map(category => {
                                                    const component = selectedBuildDetails.components.get(category);
                                                    return (
                                                        <tr key={category} className="border-b border-border/50">
                                                            <td className="p-3 font-semibold">{componentCategoryMap[category]}</td>
                                                            <td className="p-3">{component?.productName || '-'}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="text-right border-t-2 border-border pt-4 mt-4">
                                        <p className="text-2xl font-bold">
                                            <span className="text-text-secondary">총 액: </span> 
                                            <span className="text-primary">{formatCurrency(selectedBuildDetails.sellingPrice)}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeDocTab === 'invoice' && (
                                <div>
                                    <h2 className="text-3xl font-bold text-center mb-6 text-primary">거래명세표</h2>
                                    <p className="text-xl mb-4"><span className="font-semibold text-text-secondary">상품명:</span> {selectedBuildDetails.build.name}</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="border-b-2 border-primary bg-card/50">
                                                <tr>
                                                    <th className="p-3">카테고리</th>
                                                    <th className="p-3">상품명</th>
                                                    <th className="p-3">부품명</th>
                                                    <th className="p-3 text-right">원가</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayCategoryOrder.map(category => {
                                                     const component = selectedBuildDetails.components.get(category);
                                                    return (
                                                        <tr key={category} className="border-b border-border/50">
                                                            <td className="p-3 font-semibold">{componentCategoryMap[category]}</td>
                                                            <td className="p-3">{component?.productName || '-'}</td>
                                                            <td className="p-3">{component?.name || '-'}</td>
                                                            <td className="p-3 text-right font-mono">{component ? formatCurrency(component.price) : '-'}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                            <tfoot className="border-t-2 border-primary">
                                                <tr>
                                                    <td colSpan={3} className="p-3 text-right font-bold text-lg">원가 총액</td>
                                                    <td className="p-3 text-right font-bold font-mono text-lg">{formatCurrency(selectedBuildDetails.totalCost)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'commission' && (
                <div className="bg-background p-6 rounded-lg max-w-md mx-auto">
                    <h3 className="text-2xl font-bold text-primary mb-6">마켓별 판매 수수료 설정</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="naver" className="block text-lg font-semibold mb-2 text-text-primary">네이버 수수료 (%)</label>
                            <input type="number" id="naver" name="naver" value={localCommissionRates.naver} onChange={handleCommissionRateChange} className="w-full p-2 bg-card rounded" />
                        </div>
                         <div>
                            <label htmlFor="coupang" className="block text-lg font-semibold mb-2 text-text-primary">쿠팡 수수료 (%)</label>
                            <input type="number" id="coupang" name="coupang" value={localCommissionRates.coupang} onChange={handleCommissionRateChange} className="w-full p-2 bg-card rounded" />
                        </div>
                         <div>
                            <label htmlFor="market" className="block text-lg font-semibold mb-2 text-text-primary">기타 마켓 수수료 (%)</label>
                            <input type="number" id="market" name="market" value={localCommissionRates.market} onChange={handleCommissionRateChange} className="w-full p-2 bg-card rounded" />
                        </div>
                    </div>
                    <div className="mt-8 text-right">
                         <button onClick={handleCommissionSave} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors duration-300">
                            저장
                        </button>
                    </div>
                </div>
            )}


            {modalState.isOpen && modalState.category && (
                <ComponentEditModal
                    category={modalState.category}
                    component={modalState.component}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            {isPasswordModalOpen && (
                <PasswordChangeModal
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSave={onPasswordChange}
                />
            )}
             {additionalItemModalState.isOpen && (
                <AdditionalItemEditModal
                    item={additionalItemModalState.item}
                    onClose={handleCloseAdditionalItemModal}
                    onSave={handleSaveAdditionalItem}
                />
            )}
            {deleteModalInfo?.isOpen && (
                <DeleteConfirmationModal
                    isOpen={true}
                    onClose={handleCloseDeleteModal}
                    onConfirm={deleteModalInfo.onConfirm}
                    itemName={deleteModalInfo.itemName}
                />
            )}
            {arizenModalState.isOpen && (
                <ArizenPrimeBuildEditModal
                    isOpen={arizenModalState.isOpen}
                    onClose={handleCloseArizenModal}
                    onSave={handleSaveArizenBuild}
                    build={arizenModalState.build}
                    components={components}
                />
            )}
            {priceEditModalState.isOpen && buildToEdit && costOfBuildToEdit !== null && (
                <SellingPriceEditModal
                    isOpen={priceEditModalState.isOpen}
                    onClose={() => setPriceEditModalState({ isOpen: false, buildId: null })}
                    onSave={handleSaveSellingPrice}
                    build={buildToEdit}
                    cost={costOfBuildToEdit}
                />
            )}
            {isCommissionModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-lg shadow-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-primary w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2 text-text-primary">저장 확인</h3>
                            <p className="text-text-secondary mb-6">
                                변경된 수수료 설정을 저장하시겠습니까?
                            </p>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => setIsCommissionModalOpen(false)} 
                                    className="px-6 py-2 bg-secondary text-white rounded hover:bg-secondary-hover font-semibold transition-colors"
                                >
                                    취소
                                </button>
                                <button 
                                    onClick={handleConfirmCommissionSave} 
                                    className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover font-semibold transition-colors"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};