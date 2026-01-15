
import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Copy, 
  FileCode, 
  Zap, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Settings
} from 'lucide-react';

interface SetupWizardProps {
  onComplete: (scriptUrl: string, sheetsUrl: string) => void;
}

const LATEST_SCRIPT = `/**
 * BRIDGE LOGÍSTICA V5.6 - DRIVE SCAN PRO
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("AUDITORIA_IA") || ss.insertSheet("AUDITORIA_IA");
    
    if (contents.action === 'delete') {
      const folioToDelete = String(contents.folio);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]) === folioToDelete) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput("DELETED");
        }
      }
      return ContentService.createTextOutput("NOT_FOUND");
    }

    if (contents.action === 'save') {
      const data = contents.payload;
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["FECHA", "FOLIO", "EMISOR", "RECEPTOR", "BULTOS", "OBSERVACIONES", "ARCHIVO"]);
        sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#020617").setFontColor("white");
      }
      sheet.appendRow([new Date(), data.folio, data.nombreEmisor, data.nombreReceptor, data.totalUnidades, data.alertaLogistica, data.fileName]);
      return ContentService.createTextOutput("OK");
    }
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}

function doGet(e) {
  if (e && e.parameter.action === "read") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AUDITORIA_IA");
    if (!sheet) return ContentService.createTextOutput("[]");
    const vals = sheet.getDataRange().getValues().slice(1);
    const data = vals.map(r => ({ FOLIO: r[1], RECEPTOR: r[3], TOTAL_PALLETS: r[4], FECHA_SINCRO: r[0] }));
    return ContentService.createTextOutput(JSON.stringify(data.reverse())).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("SERVER ONLINE V5.6");
}`;

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [scriptUrl, setScriptUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(LATEST_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">
        <div className="lg:w-1/3 bg-slate-950 p-12 text-white space-y-10">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-400" />
            <span className="font-bold text-lg">Configuración</span>
          </div>
          <div className="space-y-6">
            <StepIndicator active={step === 1} done={step > 1} num="1" title="El puente IA" />
            <StepIndicator active={step === 2} done={step > 2} num="2" title="Despliegue" />
            <StepIndicator active={step === 3} done={step > 3} num="3" title="Conexión" />
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl mt-20 space-y-4">
             <div className="flex items-center gap-2 text-blue-400">
                <Clock size={16} />
                <span className="font-bold text-[10px] uppercase tracking-widest">Nota de implementación</span>
             </div>
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                Recuerda que la configuración física de escáneres e impresoras en bodega puede tardar de 2 a 4 horas. Asegura la conectividad antes de activar el portal.
             </p>
          </div>
        </div>

        <div className="flex-1 p-12 lg:p-16 bg-white relative flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">Copia tu puente cloud</h3>
              <p className="text-slate-500 text-sm font-medium">Instala el puente inteligente en tu cuenta de Google para habilitar el guardado automático.</p>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><FileCode size={24} /></div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm uppercase">Script Bridge v5.6</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última versión estable</p>
                  </div>
                </div>
                <button onClick={handleCopy} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-950 hover:text-white transition-all shadow-sm">
                  {copied ? <CheckCircle2 className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
              <button onClick={() => setStep(2)} className="w-full btn-gradient text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                Siguiente paso <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">Despliegue en Google</h3>
              <div className="space-y-4">
                <Instruction num="1" text="Entra a script.google.com y crea un nuevo proyecto." />
                <Instruction num="2" text="Pega el código v5.6 borrando todo lo anterior." />
                <Instruction num="3" text="Implementar > Aplicación web > Acceso: Cualquier persona." />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl border border-slate-200 font-bold text-xs uppercase tracking-widest">Atrás</button>
                <button onClick={() => setStep(3)} className="flex-[2] btn-gradient text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                  Tengo mi URL <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">Conecta tu portal</h3>
              <p className="text-slate-500 text-sm font-medium">Pega la dirección que te entregó Google para activar el scanner de auditoría.</p>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL del Script Bridge</label>
                <input 
                  type="text" 
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-600 transition-all font-mono text-xs"
                />
              </div>
              <button 
                onClick={() => scriptUrl.includes('/exec') ? onComplete(scriptUrl, '') : alert('La URL debe terminar en /exec')}
                disabled={!scriptUrl}
                className="w-full btn-gradient text-white py-6 rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                Activar portal <ShieldCheck size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StepIndicator = ({ num, title, active, done }: { num: string, title: string, active: boolean, done: boolean }) => (
  <div className={`flex items-center gap-4 transition-all ${active || done ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
      {done ? <Check size={16} strokeWidth={3} /> : num}
    </div>
    <span className="font-bold text-xs uppercase tracking-widest">{title}</span>
  </div>
);

const Instruction = ({ num, text }: { num: string, text: string }) => (
  <div className="flex gap-4 items-start">
    <span className="font-bold text-blue-600 text-sm">{num}.</span>
    <p className="text-slate-600 font-bold text-xs leading-relaxed">{text}</p>
  </div>
);

export default SetupWizard;
