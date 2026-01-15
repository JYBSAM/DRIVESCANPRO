
import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderSearch, 
  Loader2, 
  FileText, 
  ImageIcon,
  Zap,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Plus,
  Info,
  Check
} from 'lucide-react';
import { syncToGoogleSheets } from '../services/sheetsService';
import { QueueItem } from '../App';

interface ProcessorProps {
  globalQueue: QueueItem[];
  setGlobalQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  processedFileNames: string[];
}

const Processor: React.FC<ProcessorProps> = ({ globalQueue, setGlobalQueue, processedFileNames }) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showDuplicateNotice, setShowDuplicateNotice] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setShowDuplicateNotice(false);
    setNewCount(0);
    const newItems: QueueItem[] = [];
    const currentQueueNames = new Set(globalQueue.map(i => i.fileName));
    const historyNames = new Set(processedFileNames);

    let skippedCount = 0;

    Array.from(files).forEach((file: File) => {
      const name = file.name;
      const lowerName = name.toLowerCase();
      const isSupported = lowerName.endsWith('.pdf') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png');
      
      if (isSupported) {
        if (!currentQueueNames.has(name) && !historyNames.has(name)) {
          newItems.push({
            id: crypto.randomUUID(),
            file,
            fileName: name,
            status: 'pending'
          });
        } else {
          skippedCount++;
        }
      }
    });

    if (newItems.length > 0) {
      setGlobalQueue(prev => [...prev, ...newItems]);
      setNewCount(newItems.length);
      setTimeout(() => setNewCount(0), 4000);
    } else if (skippedCount > 0) {
      setShowDuplicateNotice(true);
      setTimeout(() => setShowDuplicateNotice(false), 5000);
    }

    if (folderInputRef.current) folderInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSyncAll = async () => {
    const pendingSync = globalQueue.filter(item => item.status === 'completed' && !item.synced);
    if (pendingSync.length === 0 || isSyncingAll) return;
    setIsSyncingAll(true);
    const scriptUrl = localStorage.getItem('google_sheets_script_url');
    if (!scriptUrl) { alert("Configura el puente en configuración."); setIsSyncingAll(false); return; }

    for (const item of pendingSync) {
      if (item.result) {
        const success = await syncToGoogleSheets(item.result, item.fileName, scriptUrl);
        if (success) setGlobalQueue(prev => prev.map(i => i.id === item.id ? { ...i, synced: true } : i));
      }
    }
    setIsSyncingAll(false);
  };

  const selectedItem = globalQueue.find(i => i.id === selectedItemId) || globalQueue.find(i => i.status === 'processing') || globalQueue[0];
  const unsyncedCount = globalQueue.filter(i => i.status === 'completed' && !i.synced).length;

  return (
    <div className="space-y-6 lg:space-y-10 animate-slide-up pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl">
            <Zap className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Auditoría digital</h2>
            <p className="text-slate-500 text-sm font-medium">Extrae datos de guías de despacho mediante visión artificial.</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={() => (isMobile ? fileInputRef : folderInputRef).current?.click()}
            className="flex-1 lg:flex-none bg-slate-950 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            {isMobile ? <Plus size={18} /> : <FolderSearch size={18} />}
            Cargar guías
          </button>
          
          <button 
            disabled={unsyncedCount === 0 || isSyncingAll}
            onClick={handleSyncAll}
            className={`flex-1 lg:flex-none px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
              unsyncedCount > 0 
              ? 'bg-blue-600 text-white shadow-xl' 
              : 'bg-slate-200 text-slate-400'
            }`}
          >
            {isSyncingAll ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
            Sincronizar {unsyncedCount > 0 ? `(${unsyncedCount})` : ''}
          </button>
        </div>
        
        <input type="file" webkitdirectory="" directory="" multiple className="hidden" ref={folderInputRef} onChange={handleFileSelection} />
        <input type="file" multiple accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelection} />
      </div>

      {newCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-emerald-500 p-2 rounded-xl text-white">
            <Check size={18} strokeWidth={3} />
          </div>
          <p className="text-emerald-900 font-bold text-sm">
            Se han detectado {newCount} nuevos documentos para añadir a la cola.
          </p>
        </div>
      )}

      {showDuplicateNotice && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-amber-500 p-2 rounded-xl text-white">
            <Info size={20} />
          </div>
          <p className="text-amber-900 font-bold text-sm leading-relaxed">
            No hay documentos nuevos para procesar. Los archivos seleccionados ya existen en el historial o ya están siendo analizados.
          </p>
          <button onClick={() => setShowDuplicateNotice(false)} className="ml-auto text-amber-400 hover:text-amber-600 transition-colors">
            <XCircle size={20} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={`lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col ${isMobile ? 'h-[250px]' : 'h-[600px]'} overflow-hidden`}>
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cola de auditoría</h3>
            <span className="px-2.5 py-1 bg-slate-200 rounded-full text-[10px] font-bold">{globalQueue.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {globalQueue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30">
                <FileText size={32} className="text-slate-300 mb-2" />
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Sin tareas pendientes</p>
              </div>
            ) : (
              globalQueue.map(item => (
                <div key={item.id} onClick={() => setSelectedItemId(item.id)}
                  className={`p-5 cursor-pointer transition-all border-l-4 ${selectedItemId === item.id ? 'bg-blue-50/50 border-blue-600' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      item.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                      item.status === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.status === 'processing' ? <Loader2 className="animate-spin" size={16} /> : 
                       item.status === 'completed' ? <CheckCircle2 size={16} /> :
                       item.status === 'error' ? <XCircle size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="truncate flex-1">
                      <p className="font-bold text-slate-900 text-xs truncate uppercase">{item.fileName}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.status}</span>
                    </div>
                  </div>
                </div>
              )).reverse()
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedItem?.result ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-slide-up flex flex-col min-h-[500px] lg:h-[600px]">
              <div className="p-8 bg-slate-950 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-bold leading-none mb-2">Guía #{selectedItem.result.folio}</h3>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{selectedItem.result.fecha}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl">
                  <ShieldCheck className="text-blue-400" size={24} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="space-y-8">
                    <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1">Total detectado</p>
                      <p className="text-5xl font-bold tracking-tight">{selectedItem.result.totalUnidades} <span className="text-lg opacity-40">bultos</span></p>
                    </div>

                    <div className="space-y-6">
                      <AuditField label="Empresa emisor" value={selectedItem.result.nombreEmisor} />
                      <AuditField label="Cliente receptor" value={selectedItem.result.nombreReceptor} />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200 relative aspect-[3/4] lg:aspect-auto lg:h-full group">
                    {selectedItem.thumbnail ? (
                      <img src={selectedItem.thumbnail} className="w-full h-full object-contain hover:scale-125 transition-transform duration-700 cursor-zoom-in" />
                    ) : (
                      <div className="text-center opacity-10">
                        <ImageIcon size={64} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center h-[600px] opacity-40">
              <div className="bg-slate-50 p-8 rounded-[2rem] mb-6">
                <Zap size={48} className="text-slate-300" />
              </div>
              <h4 className="text-xl font-bold text-slate-950 mb-2">Monitor de Escaneo</h4>
              <p className="text-slate-500 font-medium text-sm max-w-xs uppercase tracking-tighter leading-relaxed">Inicia una carga de documentos para ver el progreso en tiempo real.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AuditField = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
    <p className="font-bold text-slate-900 text-sm uppercase truncate bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100 shadow-inner">{value || 'Detectando...'}</p>
  </div>
);

export default Processor;
