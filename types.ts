export interface CPU {
  id: string;
  productName: string;
  manufacturer: 'Intel' | 'AMD';
  name: string;
  price: number;
  score: number;
  socket: string;
  tdp: number;
}

export interface Motherboard {
  id: string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  socket: string;
  memoryType: string;
  formFactor: string;
}

export interface Memory {
  id: string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  type: string;
  capacity: number; // GB
}

export interface GraphicsCard {
  id: string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  score: number;
  length: number; // mm
  tdp: number;
}

export interface SSD {
  id: string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  capacity: number; // GB
}

export interface Case {
  id: string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  formFactor: string[];
  maxGpuLength: number; // mm
}

export interface PowerSupply {
  id: string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  wattage: number;
}

export interface CPUCooler {
  id:string;
  productName: string;
  manufacturer: string;
  name: string;
  price: number;
  supportedSockets: string[];
}

export interface OS {
  id: string;
  productName: string;
  name: string;
  price: number;
}

export interface PCBuild {
  cpu: CPU & { advantage: string };
  motherboard: Motherboard & { advantage: string };
  memory: Memory & { advantage: string };
  graphicsCard: GraphicsCard & { advantage: string };
  ssd: SSD & { advantage: string };
  pcCase: Case & { advantage: string };
  powerSupply: PowerSupply & { advantage: string };
  cpuCooler: CPUCooler & { advantage: string };
  os: OS & { advantage: string };
  totalPrice: number;
  totalScore: number;
  reasoning: string;
}

// For Admin Panel
export type AnyComponent = CPU | Motherboard | Memory | GraphicsCard | SSD | Case | PowerSupply | CPUCooler | OS;

export type ComponentCategory = 'CPU' | 'Motherboard' | 'Memory' | 'GraphicsCard' | 'SSD' | 'PCCase' | 'PowerSupply' | 'CPUCooler' | 'OS';

export const componentCategoryMap: { [key in ComponentCategory]: string } = {
    CPU: 'CPU',
    Motherboard: '메인보드',
    Memory: '메모리',
    GraphicsCard: '그래픽카드',
    SSD: 'SSD',
    PCCase: '케이스',
    PowerSupply: '파워서플라이',
    CPUCooler: 'CPU 쿨러',
    OS: '운영체제 (OS)',
};

export const categoryInfo: Record<ComponentCategory, { displayName: string; iconUrl: string }> = {
  CPU: { displayName: 'CPU', iconUrl: 'https://img.icons8.com/fluency/48/processor.png' },
  Motherboard: { displayName: '메인보드', iconUrl: 'https://img.icons8.com/fluency/48/motherboard.png' },
  Memory: { displayName: '메모리', iconUrl: 'https://img.icons8.com/fluency/48/ram.png' },
  GraphicsCard: { displayName: '그래픽카드', iconUrl: 'https://img.icons8.com/fluency/48/video-card.png' },
  SSD: { displayName: 'SSD', iconUrl: 'https://img.icons8.com/fluency/48/ssd.png' },
  PCCase: { displayName: '케이스', iconUrl: 'https://img.icons8.com/fluency/48/tower-pc.png' },
  PowerSupply: { displayName: '파워서플라이', iconUrl: 'https://img.icons8.com/fluency/48/power-supply.png' },
  CPUCooler: { displayName: 'CPU 쿨러', iconUrl: 'https://img.icons8.com/fluency/48/fan.png' },
  OS: { displayName: 'os', iconUrl: 'https://img.icons8.com/fluency/48/operating-system.png' }
};

export const apiNameMap: Record<string, ComponentCategory> = {
  cpu: 'CPU',
  motherboard: 'Motherboard',
  memory: 'Memory',
  graphicsCard: 'GraphicsCard',
  ssd: 'SSD',
  pcCase: 'PCCase',
  powerSupply: 'PowerSupply',
  cpuCooler: 'CPUCooler',
  os: 'OS'
};


export interface AllComponents {
    CPUS: CPU[];
    MOTHERBOARDS: Motherboard[];
    MEMORIES: Memory[];
    GRAPHICS_CARDS: GraphicsCard[];
    SSDS: SSD[];
    CASES: Case[];
    POWER_SUPPLIES: PowerSupply[];
    CPU_COOLERS: CPUCooler[];
    OS: OS[];
}

export const categoryToKeyMap: { [key in ComponentCategory]: keyof AllComponents } = {
    CPU: 'CPUS',
    Motherboard: 'MOTHERBOARDS',
    Memory: 'MEMORIES',
    GraphicsCard: 'GRAPHICS_CARDS',
    SSD: 'SSDS',
    PCCase: 'CASES',
    PowerSupply: 'POWER_SUPPLIES',
    CPUCooler: 'CPU_COOLERS',
    OS: 'OS',
};

export interface AdditionalItem {
    id: string;
    category: string;
    productName: string; // 상품명
    name: string; // 부품명
    cost: number; // 원가
    additionalPrice: number; // 추가구매가
    upgradePrice: number | null; // 변경구매가
}

export interface ArizenPrimeBuild {
  id: string;
  name: string;
  cpuId: string;
  motherboardId: string;
  memoryId: string;
  graphicsCardId: string;
  ssdId: string;
  pcCaseId: string;
  powerSupplyId: string;
  cpuCoolerId: string;
  osId: string;
  customSellingPrice?: number;
}

export interface CommissionRates {
    naver: number; // percent
    coupang: number; // percent
    market: number; // percent
}