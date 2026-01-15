
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewMode, ProcessedDocument, DispatchGuide, UserSubscription } from './types';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Processor from './components/Processor';
import History from './components/History';
import Settings from './components/Settings';
import ScriptAgent from './components/ScriptAgent';
import SetupWizard from './components/SetupWizard';
import SubscriptionModal from './components/SubscriptionModal';
import { checkConnectivity, SystemStatus } from './services/healthService';
import { fetchFromSheets, syncToGoogleSheets, VersionError } from './services/sheetsService';
import { analyzeDocument } from './services/geminiService';
import { validateLicense } from './services/licenseService';
import { LayoutDashboard, History as HistoryIcon, Box, Zap, Settings as SettingsIcon, Code2, AlertTriangle, ArrowRight, LogOut, Lock } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

export interface QueueItem {
  id: string;
  file: File;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: DispatchGuide;
  error?: string;
  thumbnail?: string;
  synced?: boolean;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.LANDING);
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ ai: 'checking', sheets: 'checking' });
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [versionMismatch, setVersionMismatch] = useState<string | null>(null);

  const [globalQueue, setGlobalQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processedFileNames = useMemo(() => processedDocs.map(d => d.fileName), [processedDocs]);

  const checkLicense = useCallback(async () => {
    const sUrl = localStorage.getItem('google_sheets_script_url') || '';
    const sub = await validateLicense(sUrl);
    setSubscription(sub);
    if (sub.status === 'expired' && sub.plan !== 'pro') {
      setShowUpgrade(true);
    }
  }, []);

  const loadCloudData = useCallback(async () => {
    const sUrl = localStorage.getItem('google_sheets_script_url') || '';
    if (!sUrl) return;
    
    setIsRefreshing(true);
    try {
      const cloudDocs = await fetchFromSheets(sUrl);
      if (cloudDocs) {
        setProcessedDocs(cloudDocs);
        localStorage.setItem('dispatch_guides_history', JSON.stringify(cloudDocs));
      }
    } catch (e: any) {
      if (e instanceof VersionError) setVersionMismatch(e.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    const sUrl = localStorage.getItem('google_sheets_script_url') || '';
    // @ts-ignore
    const aKey = process.env.API_KEY || 'VALID';
    const health = await checkConnectivity(sUrl, aKey);
    setSystemStatus(health);
    if (health.sheets === 'online') loadCloudData();
    checkLicense();
  }, [loadCloudData, checkLicense]);

  const convertPdfToImage = async (file: File): Promise<{ dataUrl: string, base64Only: string }> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Canvas context failure");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return { dataUrl, base64Only: dataUrl.split(',')[1] };
  };

  const processNextInQueue = useCallback(async () => {
    // BLOQUEO DE SEGURIDAD: Si no está activo, no procesa.
    if (subscription && !subscription.active) return;

    const nextItem = globalQueue.find(item => item.status === 'pending');
    if (!nextItem || isProcessing) return;
    
    setIsProcessing(true);
    setGlobalQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'processing' } : i));

    try {
      let base64 = '';
      let thumb = '';
      const isPdf = nextItem.fileName.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        const converted = await convertPdfToImage(nextItem.file);
        base64 = converted.base64Only;
        thumb = converted.dataUrl;
      } else {
        const reader = new FileReader();
        const readerPromise = new Promise<string>((res) => {
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(nextItem.file);
        });
        const dataUrl = await readerPromise;
        base64 = dataUrl.split(',')[1];
        thumb = dataUrl;
      }

      const result = await analyzeDocument(base64, 'image/jpeg');
      const scriptUrl = localStorage.getItem('google_sheets_script_url');
      let isSynced = false;
      
      if (scriptUrl) {
        isSynced = await syncToGoogleSheets(result, nextItem.fileName, scriptUrl);
      }

      const newProcessedDoc: ProcessedDocument = {
        id: nextItem.id,
        fileName: nextItem.fileName,
        timestamp: Date.now(),
        data: result,
        status: 'success',
        thumbnail: thumb
      };

      setProcessedDocs(prev => [newProcessedDoc, ...prev]);
      setGlobalQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'completed', result, thumbnail: thumb, synced: isSynced } : i));
    } catch (err: any) {
      setGlobalQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'error', error: err.message } : i));
    } finally {
      setIsProcessing(false);
    }
  }, [globalQueue, isProcessing, subscription]);

  useEffect(() => {
    if (!isProcessing) {
      const timer = setTimeout(processNextInQueue, 500);
      return () => clearTimeout(timer);
    }
  }, [globalQueue, isProcessing, processNextInQueue]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('dispatch_guides_history');
    if (savedHistory) {
      try { setProcessedDocs(JSON.parse(savedHistory)); } catch (e) {}
    }
    const sessionActive = localStorage.getItem('app_session_active');
    if (sessionActive === 'true') {
      setCurrentView(ViewMode.DASHBOARD);
      refreshHealth();
    }
  }, [refreshHealth]);

  const handleLogout = () => {
    localStorage.removeItem('app_session_active');
    setShowSetup(false);
    setCurrentView(ViewMode.LANDING);
  };

  const renderView = () => {
    // Si la suscripción expiró, bloqueamos la vista de procesamiento
    if (subscription && !subscription.active && (currentView === ViewMode.PROCESSOR || currentView === ViewMode.AGENT)) {
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-slide-up">
          <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-100/50">
            <Lock size={64} className="text-rose-500 mb-4 mx-auto" />
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Periodo de Prueba Finalizado</h2>
            <p className="text-slate-500 font-bold max-w-sm mx-auto uppercase text-xs leading-relaxed mt-2">
              Tu acceso gratuito ha expirado. Para continuar auditando guías de despacho de forma masiva, activa tu suscripción Professional.
            </p>
          </div>
          <button 
            onClick={() => setShowUpgrade(true)}
            className="btn-gradient text-white px-10 py-5 rounded-3xl font-bold uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl"
          >
            Activar Licencia Pro <Zap size={18} />
          </button>
        </div>
      );
    }

    switch (currentView) {
      case ViewMode.DASHBOARD: return <Dashboard docs={processedDocs} onNavigate={setCurrentView} onRefresh={loadCloudData} isRefreshing={isRefreshing} />;
      case ViewMode.PROCESSOR: return <Processor globalQueue={globalQueue} setGlobalQueue={setGlobalQueue} processedFileNames={processedFileNames} />;
      case ViewMode.HISTORY: return <History docs={processedDocs} onUpdateDoc={() => {}} onDeleteDoc={() => loadCloudData()} />;
      case ViewMode.SETTINGS: return <Settings onSettingsSaved={refreshHealth} />;
      case ViewMode.AGENT: return <ScriptAgent />;
      default: return <Dashboard docs={processedDocs} onNavigate={setCurrentView} onRefresh={loadCloudData} isRefreshing={isRefreshing} />;
    }
  };

  if (currentView === ViewMode.LANDING && !showSetup) {
    return <Landing onStart={() => {
      const hasConfig = localStorage.getItem('google_sheets_script_url');
      if (hasConfig) {
        localStorage.setItem('app_session_active', 'true');
        setCurrentView(ViewMode.DASHBOARD);
        refreshHealth();
      } else {
        setShowSetup(true);
      }
    }} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-[#1e293b]">
      {showUpgrade && (
        <SubscriptionModal 
          onClose={() => setShowUpgrade(false)} 
          onConfirm={() => {
            // Simulamos activación de pago
            localStorage.setItem('is_premium_active', 'true');
            setShowUpgrade(false);
            checkLicense();
          }} 
        />
      )}
      
      {showSetup && (
        <SetupWizard onComplete={(s, p) => { 
          localStorage.setItem('google_sheets_script_url', s); 
          localStorage.setItem('google_sheets_page_url', p); 
          localStorage.setItem('app_session_active', 'true'); 
          setShowSetup(false); 
          setCurrentView(ViewMode.DASHBOARD); 
          refreshHealth(); 
        }} />
      )}
      
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shadow-2xl">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setCurrentView(ViewMode.DASHBOARD)}>
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform">
              <Box className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">DriveScan</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={currentView === ViewMode.DASHBOARD} onClick={() => setCurrentView(ViewMode.DASHBOARD)} />
            <NavItem 
              icon={<div className="relative"><Zap size={18} />{globalQueue.some(i => i.status === 'pending' || i.status === 'processing') && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />}</div>} 
              label="Scanner IA" 
              active={currentView === ViewMode.PROCESSOR} 
              onClick={() => setCurrentView(ViewMode.PROCESSOR)} 
            />
            <NavItem icon={<Code2 size={18} />} label="Script Studio" active={currentView === ViewMode.AGENT} onClick={() => setCurrentView(ViewMode.AGENT)} />
            <NavItem icon={<HistoryIcon size={18} />} label="Historial" active={currentView === ViewMode.HISTORY} onClick={() => setCurrentView(ViewMode.HISTORY)} />
            <NavItem icon={<SettingsIcon size={18} />} label="Configuración" active={currentView === ViewMode.SETTINGS} onClick={() => setCurrentView(ViewMode.SETTINGS)} />
          </nav>

          <div className="mt-auto pt-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <StatusIndicator label="IA Gemini" status={systemStatus.ai} />
              <StatusIndicator label="Suscripción" status={subscription?.active ? 'online' : 'offline'} />
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#fcfcfd]">
        <div className="max-w-6xl mx-auto">
          {versionMismatch && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-[2rem] p-8 flex items-center justify-between shadow-lg">
              <div className="flex gap-6 items-center">
                <AlertTriangle size={32} className="text-amber-600" />
                <div>
                  <h3 className="text-amber-950 font-bold text-lg">Puente desactualizado</h3>
                  <p className="text-amber-800 font-medium text-xs opacity-70">Tu versión actual no soporta todas las funciones. Actualiza en configuración.</p>
                </div>
              </div>
              <button onClick={() => setCurrentView(ViewMode.SETTINGS)} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">Configurar <ArrowRight size={16} /></button>
            </div>
          )}
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const StatusIndicator: React.FC<{ label: string, status: 'online' | 'offline' | 'checking' }> = ({ label, status }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : status === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'}`} />
  </div>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white font-bold shadow-xl' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}>
    <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
    <span className="text-[14px]">{label}</span>
  </button>
);

export default App;
