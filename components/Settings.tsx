
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Check, 
  Link2, 
  ExternalLink, 
  Copy, 
  AlertTriangle,
  Settings as SettingsIcon,
  HelpCircle,
  CreditCard
} from 'lucide-react';

interface SettingsProps {
  onSettingsSaved?: () => void;
  onUpgrade?: () => void;
}

const LATEST_APPS_SCRIPT = `/**
 * BRIDGE LOGÍSTICA DRIVE SCAN PRO V5.6
 * Sincronización completa: Guardar, Leer y Eliminar.
 */

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("AUDITORIA_IA") || ss.insertSheet("AUDITORIA_IA");
    
    // Acción: ELIMINAR
    if (contents.action === 'delete') {
      const folioToDelete = String(contents.folio);
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]) === folioToDelete) { // Columna B (Folio)
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput("DELETED").setMimeType(ContentService.MimeType.TEXT);
        }
      }
      return ContentService.createTextOutput("NOT_FOUND").setMimeType(ContentService.MimeType.TEXT);
    }

    // Acción: GUARDAR
    if (contents.action === 'save') {
      const data = contents.payload;
      if (sheet.getLastRow() === 0) {
        const headers = ["FECHA_SINCRO", "FOLIO", "FECHA_DOC", "EMISOR", "RUT_EMISOR", "RECEPTOR", "RUT_RECEPTOR", "DESTINO", "TOTAL_PALLETS", "OBSERVACIONES_IA", "NOMBRE_ARCHIVO"];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#020617").setFontColor("white");
        sheet.setFrozenRows(1);
      }
      sheet.appendRow([new Date(), data.folio, data.fechaDoc, data.nombreEmisor, data.rutEmisor, data.nombreReceptor, data.rutReceptor, data.direccionEntrega, data.totalUnidades, data.alertaLogistica, data.fileName]);
      return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
    }

    return ContentService.createTextOutput("INVALID_ACTION").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  if (e && e.parameter.action === "read") {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("AUDITORIA_IA");
      if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
      const values = sheet.getDataRange().getValues();
      if (values.length <= 1) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
      const headers = values[0];
      const data = values.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => obj[header] = row[i]);
        return obj;
      });
      return ContentService.createTextOutput(JSON.stringify(data.reverse())).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput("SERVER ONLINE V5.6").setMimeType(ContentService.MimeType.TEXT);
}`;

const Settings: React.FC<SettingsProps> = ({ onSettingsSaved }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setScriptUrl(localStorage.getItem('google_sheets_script_url') || '');
    setSheetsUrl(localStorage.getItem('google_sheets_page_url') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('google_sheets_script_url', scriptUrl);
    localStorage.setItem('google_sheets_page_url', sheetsUrl);
    setSaved(true);
    if (onSettingsSaved) onSettingsSaved();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(LATEST_APPS_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-slide-up pb-20">
      <header className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl">
          <SettingsIcon className="text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configuración avanzada</h2>
          <p className="text-slate-500 text-sm font-medium">Gestión de infraestructura y despliegue del bridge IA.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="flex gap-6">
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg h-fit">
                  <AlertTriangle className="text-white" size={32} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl mb-2">Actualización del Puente V5.6</h4>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xl">
                    Para habilitar la función de eliminar registros del historial, debes reemplazar el código de tu Google Script por esta nueva versión estable.
                  </p>
                </div>
              </div>

              <button 
                onClick={handleCopyScript}
                className="w-full bg-white text-slate-950 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
              >
                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                {copied ? 'Código copiado' : 'Copiar nuevo código v5.6'}
              </button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Link2 size={16} className="text-blue-500" /> Conexiones cloud
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Script URL (Google Bridge)</label>
                <input 
                  type="text" 
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-600 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planilla Maestra (Google Sheet)</label>
                <input 
                  type="text" 
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-600 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all font-mono"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
            >
              {saved ? <Check size={20} className="text-emerald-400" /> : <Save size={20} />}
              {saved ? 'Cambios guardados' : 'Guardar configuración'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-6">Estado de cuenta</h3>
            <p className="text-2xl font-bold text-slate-950">Plan Business</p>
            <p className="text-sm font-medium text-slate-400 mt-1">Status Pro Activo</p>
          </div>

          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HelpCircle size={16} /> Ayuda técnica
            </h4>
            <p className="text-sm font-medium text-blue-800 leading-relaxed mb-6">
              ¿Problemas con el despliegue del script? Nuestro equipo puede ayudarte con la configuración inicial.
            </p>
            <a href="mailto:soporte@drivescan.pro" className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
              Contactar soporte <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
