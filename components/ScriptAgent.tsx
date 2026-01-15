
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Loader2, Code2, Copy, Check, Sparkles, MessageSquare, Terminal } from 'lucide-react';

const ScriptAgent: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateScript = async () => {
    if (!input.trim()) return;
    setLoading(true);
    // @ts-ignore
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Eres un experto en Google Apps Script y extracción de datos.
        El usuario quiere digitalizar un documento específico: "${input}".
        1. Identifica los 5-7 campos de datos más importantes para este tipo de documento.
        2. Genera un código de Google Apps Script (función doPost) que reciba un JSON con esos campos y los guarde en una hoja llamada "DIGITALIZACION".
        3. El código debe incluir encabezados automáticos si la hoja está vacía.
        4. Responde con una breve explicación amigable y LUEGO el bloque de código entre triple comillas.`,
      });
      setResponse(result.text);
    } catch (error) {
      console.error(error);
      setResponse("Lo siento, hubo un error al generar tu script. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!response) return;
    const codeMatch = response.match(/```(?:javascript|gs)?([\s\S]*?)```/);
    const codeToCopy = codeMatch ? codeMatch[1].trim() : response;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <header className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl">
          <Sparkles className="text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Script Studio IA</h2>
          <p className="text-slate-500 text-sm font-medium">Define qué quieres digitalizar y yo crearé el puente con Google Sheets por ti.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <MessageSquare size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">Prompt del arquitecto</span>
            </div>
            
            <div className="space-y-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe qué documento quieres procesar..."
                className="w-full h-44 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 rounded-3xl p-6 text-sm font-medium outline-none transition-all resize-none"
              />
              <button 
                onClick={generateScript}
                disabled={loading || !input}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Generar mi puente IA
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {response ? (
            <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px] animate-in zoom-in-95">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="text-blue-400" size={18} />
                  <span className="text-white font-bold text-sm">Código generado</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/5"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  Copiar script
                </button>
              </div>
              <div className="p-8 flex-1 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
                <div className="text-slate-400 whitespace-pre-wrap mb-6 italic">
                  {response.split('```')[0]}
                </div>
                <pre className="text-blue-300 bg-black/40 p-6 rounded-2xl border border-white/5 overflow-x-auto">
                  {response.match(/```(?:javascript|gs)?([\s\S]*?)```/)?.[1] || response}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center opacity-40">
              <Code2 size={48} className="text-slate-300 mb-6" />
              <h4 className="text-xl font-bold text-slate-950 mb-2">Tu código aparecerá aquí</h4>
              <p className="text-slate-500 font-medium text-sm">Describe tus documentos a la izquierda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptAgent;
