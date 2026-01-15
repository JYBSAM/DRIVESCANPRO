
export interface ProductItem {
  descripcion: string;
  cantidad: number;
}

export interface DispatchGuide {
  folio: string;
  fecha: string;
  rutEmisor: string;
  nombreEmisor: string;
  rutReceptor: string;
  nombreReceptor: string;
  direccionEntrega: string;
  items: ProductItem[];
  totalUnidades: number;
  total: number;
  validacionRuta: {
    origenValidado: boolean;
    destinoValidado: boolean;
    alertaLogistica: string | null;
  };
}

export interface ProcessedDocument {
  id: string;
  fileName: string;
  timestamp: number;
  data: DispatchGuide;
  status: 'success' | 'error' | 'processing';
  errorMessage?: string;
  thumbnail?: string;
}

export enum ViewMode {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  PROCESSOR = 'processor',
  HISTORY = 'history',
  SETTINGS = 'settings',
  AGENT = 'agent'
}

export interface UserSubscription {
  userId: string;
  active: boolean;
  trialEnds: number;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'expired';
}
