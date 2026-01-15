
import React, { useState } from 'react';
import { ProcessedDocument } from '../types';
import { deleteFromSheets } from '../services/sheetsService';
import { 
  Eye, 
  Trash2, 
  X, 
  ImageIcon,
  Package,
  Loader2,
  Calendar,
  Building2,
  User,
  MapPin,
  FileText,
  Maximize2
} from 'lucide-react';

interface HistoryProps {
  docs: ProcessedDocument[];
  onUpdateDoc: (doc: ProcessedDocument) => void;
  onDeleteDoc: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ docs, onDeleteDoc }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);

  const filteredDocs = docs.filter(doc => 
    doc.data.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.data.nombreReceptor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.data.nombreEmisor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'No definida';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const handleDelete = async (doc: ProcessedDocument) => {
    if (!window.confirm(`¿Estás seguro de eliminar la guía #${doc.data.folio}? Esta acción no se puede deshacer en la planilla.`)) return;
    
    setIsDeleting(true);
    const scriptUrl = localStorage.getItem('google_sheets_script_url');
    if (scriptUrl) {
      const success = await deleteFromSheets(doc.data.folio, scriptUrl);
      if (success) {
        onDeleteDoc(doc.id);
        setSelectedDoc(null);
      } else {
        alert("No se pudo eliminar el registro de la nube. Intenta nuevamente.");
      }
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-slide-up">
      {fullScreenImg && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <button 
            onClick={() => setFullScreenImg(null)}
            className="absolute top-10 right-10 text-white p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all z-20"
          >
            <X size={32} />
          </button>
          <img src={fullScreenImg} className="max-w-full max-h-full object-contain shadow-2xl" alt="Documento Fullscreen" />
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
            <FileText className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Auditoría histórica</h2>
            <p className="text-slate-500 text-sm font-medium">Revisa y gestiona los documentos procesados anteriormente.</p>
          </div>
        </div>
      </header>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 mb-6 shrink-0">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar por folio, cliente o empresa emisora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl font-bold text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-950 text-white">
                <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest border-r border-white/5 w-48">Folio / Fecha</th>
                <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest border-r border-white/5">Empresa / Origen</th>
                <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest border-r border-white/5">Cliente / Destino</th>
                <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-center border-r border-white/5 w-32">Bultos</th>
                <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-right w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="group hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <td className="py-5 px-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">#{doc.data.folio || 'S/F'}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">{formatDate(doc.data.fecha)}</span>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <span className="text-[12px] font-bold text-slate-800">{doc.data.nombreEmisor}</span>
                  </td>
                  <td className="py-5 px-8">
                    <span className="text-[12px] font-bold text-slate-800 truncate block max-w-[200px]">{doc.data.nombreReceptor}</span>
                  </td>
                  <td className="py-5 px-8 text-center">
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block font-bold text-slate-900 text-xs">
                      {doc.data.totalUnidades}
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl h-full lg:h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative animate-in zoom-in-95 duration-500 border border-white/20">
            
            {/* Visor de Documento (Izquierda) */}
            <div className="lg:w-[45%] bg-[#0f172a] flex flex-col items-center justify-center p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15),transparent)]"></div>
              {selectedDoc.thumbnail ? (
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedDoc.thumbnail} 
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10 hover:scale-125 transition-transform duration-700 cursor-zoom-in" 
                    alt="Documento adjunto"
                  />
                  <button 
                    onClick={() => setFullScreenImg(selectedDoc.thumbnail!)}
                    className="absolute bottom-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                  >
                    <Maximize2 size={24} />
                  </button>
                  <div className="absolute top-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    Vista previa de auditoría
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-30 relative z-10">
                  <div className="bg-white/5 p-10 rounded-[2.5rem] mb-6 inline-block border border-white/5">
                    <ImageIcon size={64} className="text-white" />
                  </div>
                  <p className="text-white font-bold uppercase tracking-[0.3em] text-[10px]">Sin vista previa</p>
                </div>
              )}
            </div>

            {/* Panel de Datos (Derecha) */}
            <div className="flex-1 p-10 lg:p-16 overflow-y-auto bg-white relative flex flex-col">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all z-20"
              >
                <X size={20} />
              </button>

              <header className="mb-14">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Detalles de auditoría</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Guía folio #{selectedDoc.data.folio}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(selectedDoc); }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all font-bold text-[10px] uppercase tracking-widest border border-rose-100 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    Eliminar registro
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 flex-1">
                <DetailItem label="Fecha documento" value={formatDate(selectedDoc.data.fecha)} icon={<Calendar size={16} />} />
                <DetailItem label="Empresa emisor" value={selectedDoc.data.nombreEmisor} icon={<Building2 size={16} />} />
                <DetailItem label="Cliente receptor" value={selectedDoc.data.nombreReceptor} icon={<User size={16} />} fullWidth />
                <DetailItem label="Dirección entrega" value={selectedDoc.data.direccionEntrega} icon={<MapPin size={16} />} fullWidth />
              </div>

              {/* Tarjeta de Unidades */}
              <div className="mt-14">
                <div className="bg-[#2563eb] p-10 rounded-[3rem] text-white flex justify-between items-center shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70 mb-2">Total unidades</p>
                    <p className="text-7xl font-bold tracking-tighter leading-none">{selectedDoc.data.totalUnidades} bultos</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-[2rem] backdrop-blur-md border border-white/10 relative z-10">
                    <Package size={52} className="text-white/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, icon, fullWidth = false }: { label: string, value: string, icon: React.ReactNode, fullWidth?: boolean }) => (
  <div className={`${fullWidth ? 'col-span-1 md:col-span-2' : ''} space-y-2.5`}>
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {label}
    </label>
    <div className="flex items-center gap-4 px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 text-[15px] shadow-inner">
      <span className="text-slate-300">{icon}</span>
      <span className="truncate">{value || 'No detectado'}</span>
    </div>
  </div>
);

export default History;
