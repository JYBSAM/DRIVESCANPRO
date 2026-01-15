
// Added missing React import to fix namespace errors
import React from 'react';
import { ProcessedDocument, ViewMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileCheck, AlertCircle, TrendingUp, Zap, RefreshCcw, LayoutDashboard } from 'lucide-react';

interface DashboardProps {
  docs: ProcessedDocument[];
  onNavigate: (view: ViewMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ docs, onNavigate, onRefresh, isRefreshing }) => {
  const today = new Date().toISOString().split('T')[0];
  const docsToday = docs.filter(d => new Date(d.timestamp).toISOString().split('T')[0] === today);
  const errorCount = docs.filter(d => d.data.validacionRuta?.alertaLogistica && d.data.validacionRuta.alertaLogistica.length > 5).length;
  
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      name: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      count: docs.filter(doc => new Date(doc.timestamp).toISOString().split('T')[0] === dateStr).length,
      fullDate: dateStr
    };
  }).reverse();

  return (
    <div className="space-y-10 animate-slide-up pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl">
            <LayoutDashboard className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Panel logístico</h2>
            <p className="text-slate-500 text-sm font-medium">Visualización en tiempo real de tu Google Sheet de auditoría.</p>
          </div>
        </div>
        
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={16} />
          {isRefreshing ? 'Sincronizando...' : 'Refrescar nube'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<FileCheck className="text-blue-600" size={20} />} 
          title="Guías en la nube" 
          value={docs.length} 
          subtitle="Total acumulado en sheets"
          theme="blue"
        />
        <StatCard 
          icon={<AlertCircle className="text-rose-500" size={20} />} 
          title="Alertas activas" 
          value={errorCount} 
          subtitle="Registros con observaciones"
          theme="rose"
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-500" size={20} />} 
          title="Auditadas hoy" 
          value={docsToday.length} 
          subtitle="Jornada actual"
          theme="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-sm text-slate-900 mb-6">Actividad semanal</h3>
          <div className="h-64 w-full min-w-0" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={30}>
                  {last7Days.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fullDate === today ? '#2563eb' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-950 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between group">
          <div>
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-6">
              <Zap className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Nuevo lote</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Sube tus archivos y observa cómo aparecen instantáneamente en tu planilla.
            </p>
          </div>
          <button 
            onClick={() => onNavigate(ViewMode.PROCESSOR)}
            className="mt-8 bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all group/btn uppercase tracking-widest"
          >
            Escanear ahora
          </button>
        </div>
      </div>
    </div>
  );
};

// Added missing React import above to fix namespace issues here
const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, subtitle: string, theme: 'blue' | 'rose' | 'emerald' }> = ({ icon, title, value, subtitle, theme }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className={`p-3 rounded-xl w-fit mb-4 border ${styles[theme]}`}>
        {icon}
      </div>
      <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-[10px] font-medium text-slate-400">{subtitle}</p>
    </div>
  );
};

export default Dashboard;
