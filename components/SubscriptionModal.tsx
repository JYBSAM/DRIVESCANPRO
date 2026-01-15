
import React from 'react';
import { ShieldCheck, X, Check, ArrowRight } from 'lucide-react';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

const SubscriptionModal: React.FC<Props> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-950 transition-colors z-20 p-2 hover:bg-slate-50 rounded-2xl">
          <X size={28} />
        </button>

        <div className="p-14 text-center animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-blue-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-100 rotate-3">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <h3 className="text-4xl font-black text-slate-950 tracking-tighter mb-4 italic uppercase leading-none">Acceso Premium</h3>
          <p className="text-slate-500 font-bold mb-12 leading-relaxed italic">
            Digitaliza hasta 5,000 documentos mensuales con prioridad de procesamiento IA y soporte técnico dedicado.
          </p>
          
          <div className="space-y-5 mb-14 text-left">
            <BenefitItem text="Auditoría Masiva Ilimitada" />
            <BenefitItem text="Extracción de Firmas IA" />
            <BenefitItem text="Script Bridge Dedicado" />
          </div>

          <button 
            onClick={onConfirm}
            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-slate-950 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 group active:scale-95"
          >
            Activar Ahora <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-4 text-sm font-bold text-slate-700 italic">
    <div className="bg-emerald-500 p-1 rounded-lg">
      <Check className="text-white" size={14} strokeWidth={4} />
    </div>
    {text}
  </div>
);

export default SubscriptionModal;
