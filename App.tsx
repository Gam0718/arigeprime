import React, { useState, useCallback, useEffect } from 'react';
import { QuoteForm } from './components/QuoteForm';
import { QuoteDisplay } from './components/QuoteDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { PasswordModal } from './components/PasswordModal';
import { generatePCQuote } from './services/geminiService';
import type { PCBuild, AllComponents, ComponentCategory, AnyComponent, AdditionalItem, ArizenPrimeBuild, CommissionRates, OS } from './types';
import { categoryToKeyMap } from './types';
import { CPUS, MOTHERBOARDS, MEMORIES, GRAPHICS_CARDS, SSDS, CASES, POWER_SUPPLIES, CPU_COOLERS, OS_COMPONENTS, ADDITIONAL_ITEMS, ARIZEN_PRIME_BUILDS, INITIAL_COMMISSION_RATES } from './constants';

const LOCAL_STORAGE_KEYS = {
  COMPONENTS: 'adminComponents',
  ADDITIONAL_ITEMS: 'adminAdditionalItems',
  ARIZEN_BUILDS: 'adminArizenBuilds',
  COMMISSION_RATES: 'adminCommissionRates',
  ADMIN_PASSWORD: 'adminPassword',
};

const App: React.FC = () => {
  const [quote, setQuote] = useState<PCBuild | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'aiQuote' | 'admin'>('aiQuote');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_PASSWORD) || 'admin';
  });

  const [components, setComponents] = useState<AllComponents>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPONENTS);
      return saved ? JSON.parse(saved) : { CPUS, MOTHERBOARDS, MEMORIES, GRAPHICS_CARDS, SSDS, CASES, POWER_SUPPLIES, CPU_COOLERS, OS: OS_COMPONENTS };
    } catch {
      return { CPUS, MOTHERBOARDS, MEMORIES, GRAPHICS_CARDS, SSDS, CASES, POWER_SUPPLIES, CPU_COOLERS, OS: OS_COMPONENTS };
    }
  });

  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ADDITIONAL_ITEMS);
      return saved ? JSON.parse(saved) : ADDITIONAL_ITEMS;
    } catch {
      return ADDITIONAL_ITEMS;
    }
  });

  const [arizenBuilds, setArizenBuilds] = useState<ArizenPrimeBuild[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ARIZEN_BUILDS);
      return saved ? JSON.parse(saved) : ARIZEN_PRIME_BUILDS;
    } catch {
      return ARIZEN_PRIME_BUILDS;
    }
  });

  const [commissionRates, setCommissionRates] = useState<CommissionRates>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.COMMISSION_RATES);
      return saved ? JSON.parse(saved) : INITIAL_COMMISSION_RATES;
    } catch {
      return INITIAL_COMMISSION_RATES;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_PASSWORD, adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
  }, [components]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ADDITIONAL_ITEMS, JSON.stringify(additionalItems));
  }, [additionalItems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ARIZEN_BUILDS, JSON.stringify(arizenBuilds));
  }, [arizenBuilds]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMMISSION_RATES, JSON.stringify(commissionRates));
  }, [commissionRates]);

  const handleGenerateQuote = useCallback(async (prompt: string, budget: number) => {
    setIsLoading(true);
    setError(null);
    setQuote(null);
    try {
      const result = await generatePCQuote(prompt, budget, components);
      setQuote(result);
    } catch (err) {
      console.error(err);
      setError('견적 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [components]);

  const handleComponentUpdate = useCallback((category: ComponentCategory, updatedComponent: AnyComponent) => {
    const categoryKey = categoryToKeyMap[category];
    
    setComponents(prev => {
        const list = prev[categoryKey] as AnyComponent[];
        const updatedList = list.map(item => item.id === updatedComponent.id ? updatedComponent : item);
        return { ...prev, [categoryKey]: updatedList };
    });
  }, []);

  const handleComponentAdd = useCallback((category: ComponentCategory, newComponent: Omit<AnyComponent, 'id'>) => {
      const categoryKey = categoryToKeyMap[category];
      const componentWithId = {
          ...newComponent,
          id: `${category.toLowerCase()}-${Date.now()}`
      } as AnyComponent;

      setComponents(prev => {
          const list = prev[categoryKey] as AnyComponent[];
          return { ...prev, [categoryKey]: [...list, componentWithId] };
      });
  }, []);

  const handleComponentDelete = useCallback((category: ComponentCategory, componentId: string) => {
    const categoryKey = categoryToKeyMap[category];
    setComponents(prev => {
        const currentList = prev[categoryKey] as AnyComponent[];
        const updatedList = currentList.filter(item => item.id !== componentId);
        return { ...prev, [categoryKey]: updatedList };
    });
  }, []);

  const handleBulkUpdateComponents = useCallback((category: ComponentCategory, newComponents: AnyComponent[]) => {
    const categoryKey = categoryToKeyMap[category];
    setComponents(prev => ({ ...prev, [categoryKey]: newComponents }));
    alert(`${category} 카테고리의 부품 ${newComponents.length}개가 성공적으로 일괄 등록되었습니다.`);
  }, []);
  
  const handleAdditionalItemUpdate = useCallback((updatedItem: AdditionalItem) => {
    setAdditionalItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  }, []);

  const handleAdditionalItemAdd = useCallback((newItem: Omit<AdditionalItem, 'id'>) => {
    const itemWithId = { ...newItem, id: `add-${Date.now()}` };
    setAdditionalItems(prev => [...prev, itemWithId]);
  }, []);

  const handleAdditionalItemDelete = useCallback((itemId: string) => {
    setAdditionalItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);
  
  const handleBulkAddAdditionalItems = useCallback((newItems: AdditionalItem[]) => {
    setAdditionalItems(prev => [...prev, ...newItems]);
    alert(`추가구매상품 ${newItems.length}개가 성공적으로 추가되었습니다.`);
  }, []);

  const handleArizenBuildAdd = useCallback((newBuildData: Omit<ArizenPrimeBuild, 'id'>) => {
    const buildWithId = { ...newBuildData, id: `arizen-${Date.now()}` };
    setArizenBuilds(prev => [...prev, buildWithId]);
  }, []);

  const handleArizenBuildUpdate = useCallback((updatedBuild: ArizenPrimeBuild) => {
    setArizenBuilds(prev => prev.map(p => p.id === updatedBuild.id ? updatedBuild : p));
  }, []);

  const handleArizenBuildDelete = useCallback((buildId: string) => {
    setArizenBuilds(prev => prev.filter(p => p.id !== buildId));
  }, []);

  const handleAdminLogin = (password: string) => {
    if (password === adminPassword) {
        setActiveView('admin');
        setShowPasswordModal(false);
    } else {
        alert('비밀번호가 올바르지 않습니다.');
    }
  };
  
  const handlePasswordChange = (newPassword: string) => {
    setAdminPassword(newPassword);
    alert('비밀번호가 성공적으로 변경되었습니다.');
  };

  const handleCommissionChange = (newRates: CommissionRates) => {
    setCommissionRates(newRates);
  };

  const renderActiveView = () => {
    switch(activeView) {
        case 'aiQuote':
            return (
                <div className="max-w-4xl mx-auto">
                    <QuoteForm onGenerate={handleGenerateQuote} isLoading={isLoading} />
                    <div className="mt-8">
                    {isLoading && <LoadingSpinner />}
                    {error && <ErrorMessage message={error} />}
                    {quote && <QuoteDisplay quote={quote} />}
                    </div>
                </div>
            );
        case 'admin':
             return <AdminPanel 
              components={components} 
              onUpdate={handleComponentUpdate} 
              onAdd={handleComponentAdd} 
              onDelete={handleComponentDelete}
              onPasswordChange={handlePasswordChange}
              additionalItems={additionalItems}
              onAdditionalItemAdd={handleAdditionalItemAdd}
              onAdditionalItemUpdate={handleAdditionalItemUpdate}
              onAdditionalItemDelete={handleAdditionalItemDelete}
              onBulkUpdateComponents={handleBulkUpdateComponents}
              onBulkAddAdditionalItems={handleBulkAddAdditionalItems}
              arizenBuilds={arizenBuilds}
              onArizenBuildAdd={handleArizenBuildAdd}
              onArizenBuildUpdate={handleArizenBuildUpdate}
              onArizenBuildDelete={handleArizenBuildDelete}
              commissionRates={commissionRates}
              onCommissionChange={handleCommissionChange}
            />;
        default:
            return null;
    }
  }


  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onAdminClick={() => setShowPasswordModal(true)} 
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderActiveView()}
      </main>
      <Footer />
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} onLogin={handleAdminLogin} />}
    </div>
  );
};

export default App;
