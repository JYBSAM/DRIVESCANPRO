
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Box, 
  ShieldCheck,
  BrainCircuit,
  FileSpreadsheet,
  Check,
  Clock,
  TrendingDown,
  Target,
  HardDrive,
  Scan,
  Gem,
  ArrowRight,
  Building2,
  Truck,
  Factory,
  Printer,
  Sparkles,
  Layers,
  Cpu,
  ShieldAlert,
  Users,
  MessageSquare,
  ChevronRight,
  Globe,
  Settings,
  CheckCircle2
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

type SubPage = 'inicio' | 'soluciones' | 'instalacion' | 'planes';

const NavLink = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`relative font-bold uppercase tracking-[0.2em] text-[10px] transition-all duration-300 ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {label}
    <div className={`absolute -bottom-2 left-0 h-[2px] bg-blue-500 transition-all duration-500 ${active ? 'w-full' : 'w-0'}`}></div>
  </button>
);

const BenefitItem = ({ text, highlighted = false }: { text: string, highlighted?: boolean }) => (
  <div className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight ${highlighted ? 'text-blue-400' : 'text-slate-300'}`}>
    <div className={`p-1 rounded-md border ${highlighted ? 'bg-blue-500/20 border-blue-400' : 'bg-slate-800 border-slate-700'}`}>
      <Check size={12} className={highlighted ? 'text-blue-400' : 'text-emerald-400'} strokeWidth={3} />
    </div>
    {text}
  </div>
);

const ImpactMetric = ({ icon, title, before, after, percentage }: { icon: React.ReactNode, title: string, before: string, after: string, percentage: string }) => (
  <div className="glass-panel p-8 group relative overflow-hidden border-white/5">
    <div className="absolute -right-4 -bottom-4 text-[70px] font-bold text-white/5 uppercase select-none group-hover:text-blue-500/10 transition-colors">
      {percentage}
    </div>
    <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/20 w-fit p-4 rounded-2xl bg-blue-500/5">
      {React.cloneElement(icon as React.ReactElement, { strokeWidth: 1.5 })}
    </div>
    <h4 className="text-lg font-bold text-white uppercase mb-4 tracking-tight">{title}</h4>
    <div className="space-y-4 relative z-10">
      <div className="flex items-center gap-3 opacity-40">
        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Manual: {before}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
        <p className="text-[10px] font-bold text-white uppercase tracking-widest">IA DriveScan: <span className="text-emerald-400">{after}</span></p>
      </div>
    </div>
  </div>
);

const InicioView = ({ onStart, setActivePage }: { onStart: () => void, setActivePage: (p: SubPage) => void }) => (
  <div className="space-y-32 page-transition">
    <div className="max-w-7xl mx-auto px-8 text-center space-y-10 py-12 relative">
      {/* Resplandor Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>

      <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
        <Gem size={14} className="text-blue-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Software de Auditoría Inteligente</span>
      </div>

      <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight max-w-5xl mx-auto uppercase">
        Convierte tus <span className="text-gradient">Documentos en Datos</span> en Tiempo Real.
      </h1>

      <p className="text-lg text-slate-400 font-bold max-w-3xl mx-auto leading-relaxed uppercase tracking-tight">
        Audita 100 guías en solo <span className="text-blue-400">5 minutos</span>. Lo que antes tomaba <span className="text-slate-200">2 horas</span> de digitación tediosa, ahora es automático con 
        <span className="inline-flex items-center gap-1.5 ml-2">
          <Sparkles size={18} className="text-blue-400" />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Gemini Flash IA</span>
        </span>.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
        <button onClick={onStart} className="btn-gradient text-white px-12 py-5 rounded-full font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 group">
          Portal de Auditoría <Zap size={18} strokeWidth={2} />
        </button>
        <button onClick={() => setActivePage('planes')} className="glass-panel px-12 py-5 rounded-full font-bold text-sm uppercase tracking-widest text-white hover:bg-white/5 transition-all border border-white/10">
          Ver Planes de Acceso
        </button>
      </div>
    </div>

    <div className="light-contrast-section py-32">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="absolute -inset-10 bg-blue-500/5 blur-3xl rounded-full"></div>
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl relative z-10 border-8 border-slate-50 transition-all duration-700" alt="Bodega Digital" />
        </div>
        <div className="space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tighter leading-tight">Diseñado para la Bodega Real.</h2>
          <p className="text-slate-600 font-bold leading-relaxed uppercase text-sm">Entendemos que el papel es difícil de eliminar. Por eso creamos el puente perfecto entre lo físico y lo digital. Sin escáneres costosos, sin software complejo.</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><h4 className="text-2xl font-bold text-blue-600 mb-2 tracking-tighter">0.1%</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margen de Error IA</p></div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><h4 className="text-2xl font-bold text-blue-600 mb-2 tracking-tighter">100%</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nube Privada</p></div>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-8 space-y-32">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { t: "Scanner/Smartphone", d: "Digitaliza con lo que tengas.", i: <Scan className="text-blue-400" /> },
          { t: "Google Drive", d: "Almacén de evidencias.", i: <HardDrive className="text-emerald-400" /> },
          { t: "Google Sheets", d: "Tus datos ya tabulados.", i: <FileSpreadsheet className="text-blue-400" /> },
          { t: "Gemini Flash IA", d: "Motor de visión de Google.", i: <Sparkles className="text-transparent bg-clip-content bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-400" /> }
        ].map((req, idx) => (
          <div key={idx} className="glass-panel p-8 flex flex-col items-center text-center gap-5">
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10">{React.cloneElement(req.i as React.ReactElement, { strokeWidth: 1.5, size: 32 })}</div>
            <div>
              <h5 className="text-white font-bold uppercase text-xs tracking-widest mb-2">{req.t}</h5>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter leading-relaxed">{req.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SolucionesView = () => (
  <div className="max-w-7xl mx-auto px-8 py-12 space-y-32 page-transition pb-32">
    <div className="text-center space-y-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10"></div>
      <h2 className="text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight">Capacidades del Ecosistema</h2>
      <p className="text-lg text-slate-400 font-bold max-w-2xl mx-auto uppercase">La inteligencia artificial de Google al servicio de tu logística.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <InteractiveSolutionCard 
        icon={<BrainCircuit />} 
        title="OCR Inteligente" 
        desc="Extracción de datos manuscritos, timbres y firmas con precisión industrial. Aprende de los formatos específicos de tu empresa."
        features={["Firma de cliente", "Bultos manuales", "Folios complejos"]}
      />
      <InteractiveSolutionCard 
        icon={<Layers />} 
        title="Digitalización Masiva" 
        desc="Sube carpetas completas de un solo clic. Nuestra IA procesa en paralelo permitiéndote auditar cientos de guías en minutos."
        features={["Procesamiento paralelo", "Cola de fondo", "Reporte de errores"]}
      />
      <InteractiveSolutionCard 
        icon={<Globe />} 
        title="Validación Geo-Cloud" 
        desc="Verificamos que las direcciones de entrega sean válidas y las mapeamos automáticamente en tu planilla maestra."
        features={["Google Maps Sync", "Validación RUT", "Mapeo de zonas"]}
      />
    </div>

    <div className="glass-panel p-16 flex flex-col lg:flex-row items-center gap-16 border-blue-500/10 bg-blue-500/5">
      <div className="lg:w-1/2 space-y-8">
        <h3 className="text-3xl font-bold text-white uppercase tracking-tight">Auditoría 24/7 sin Supervisión</h3>
        <p className="text-slate-400 font-bold uppercase text-sm leading-relaxed">Configura tus escáneres de bodega para que envíen las guías directamente a la nube. DriveScan las procesará automáticamente mientras descansas.</p>
        <div className="space-y-4">
          <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div><span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Alertas inmediatas en Telegram/WhatsApp</span></div>
          <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div><span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Dashboard de cumplimiento semanal</span></div>
        </div>
      </div>
      <div className="lg:w-1/2 bg-slate-900 rounded-[3rem] p-8 border border-white/5 shadow-2xl">
        <div className="flex gap-4 mb-6"><div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
        <div className="space-y-4 font-mono text-[10px] text-blue-400 opacity-60">
          <p>{" > "} Analizando Guía_77182.pdf...</p>
          <p className="text-emerald-400">{" > "} IA: Folio detectado 77182</p>
          <p className="text-emerald-400">{" > "} IA: Total bultos: 12 (manuscrito)</p>
          <p className="text-emerald-400">{" > "} IA: Destino: Las Condes 12900</p>
          <p className="text-blue-500">{" > "} Sincronizando con Google Sheets...</p>
          <p className="text-white font-bold">{" > "} STATUS: COMPLETADO ✓</p>
        </div>
      </div>
    </div>
  </div>
);

const InstalacionView = () => (
  <div className="max-w-7xl mx-auto px-8 py-12 space-y-24 page-transition pb-32">
    <div className="text-center space-y-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 blur-[100px] rounded-full -z-10"></div>
      <h2 className="text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight">Proceso de Implementación</h2>
      <p className="text-lg text-slate-400 font-bold max-w-2xl mx-auto uppercase">De la bodega a la nube en 4 simples pasos.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <StepCard num="01" title="Mapeo Hardware" desc="Identificamos tus escáneres e impresoras térmicas para configurar los perfiles de envío directo." icon={<Printer />} />
      <StepCard num="02" title="Bridge Cloud" desc="Desplegamos tu instancia privada de Google Apps Script para asegurar que tus datos nunca salgan de tu ecosistema." icon={<Cpu />} />
      <StepCard num="03" title="Audit Config" desc="Personalizamos la IA para reconocer tus guías específicas, facturas o manifiestos de carga." icon={<Settings />} />
      <StepCard num="04" title="Marcha Blanca" desc="Periodo de 7 días de monitoreo asistido para asegurar que el 100% de los datos sean correctos." icon={<CheckCircle2 />} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="glass-panel p-12 border-white/5 space-y-6">
        <ShieldAlert className="text-amber-500" size={32} />
        <h4 className="text-xl font-bold text-white uppercase">Requisitos Técnicos</h4>
        <div className="space-y-4">
          <BenefitItem text="Escáner con soporte SMB o Email-to-Cloud" highlighted />
          <BenefitItem text="Cuenta Google Workspace Business/Standard" highlighted />
          <BenefitItem text="Conexión estable a Internet en Bodega" />
          <BenefitItem text="Google Sheets habilitado para scripts" />
        </div>
      </div>
      <div className="glass-panel p-12 border-white/5 space-y-6">
        <Users className="text-blue-500" size={32} />
        <h4 className="text-xl font-bold text-white uppercase">Soporte y Capacitación</h4>
        <p className="text-slate-400 text-sm font-bold uppercase leading-relaxed">Nuestro equipo no solo instala, capacitamos a tus jefes de bodega para que entiendan cómo leer las alertas de la IA y optimizar el flujo.</p>
        <button className="flex items-center gap-3 text-white font-bold text-[10px] uppercase tracking-widest hover:text-blue-400 transition-all duration-300">
          Descargar manual de implementación <ChevronRight size={14} />
        </button>
      </div>
    </div>
  </div>
);

const PlanesView = ({ onStart }: { onStart: () => void }) => (
  <div className="max-w-7xl mx-auto px-8 py-12 space-y-24 page-transition pb-32">
    <div className="text-center space-y-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full -z-10"></div>
      <h2 className="text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight">Planes y Membresías</h2>
      <p className="text-lg text-slate-400 font-bold max-w-2xl mx-auto uppercase">Escoge el nivel de automatización que tu empresa necesita.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
      <PricingCard 
        title="Básico" 
        price="Gratis" 
        subtitle="Para emprendedores" 
        features={["50 Guías mensuales", "OCR Estándar", "Dashboard básico", "Soporte comunitario"]}
        onSelect={onStart}
      />
      <PricingCard 
        title="Professional" 
        price="$150.000" 
        subtitle="El más popular" 
        isPopular 
        features={["Guías ilimitadas", "IA Gemini Flash Pro", "Configuración de Hardware", "Soporte 24/7 WhatsApp", "Historial ilimitado"]}
        onSelect={onStart}
      />
      <PricingCard 
        title="Enterprise" 
        price="Cotizar" 
        subtitle="Auditoría a medida" 
        features={["Múltiples bodegas", "API de integración", "Servidor privado", "Capacitación en terreno", "SLA Garantizado"]}
        onSelect={onStart}
      />
    </div>

    <div className="text-center py-10">
      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">¿Tienes dudas sobre los planes?</p>
      <button className="flex items-center gap-2 mx-auto text-blue-400 font-bold uppercase text-xs hover:text-white transition-colors">
        Hablemos por WhatsApp <MessageSquare size={16} />
      </button>
    </div>
  </div>
);

const PricingCard = ({ title, price, subtitle, features, isPopular = false, onSelect }: any) => (
  <div className={`glass-panel p-10 flex flex-col gap-8 transition-all duration-500 ${isPopular ? 'border-blue-500/40 bg-blue-500/5 ring-1 ring-blue-500/20 scale-105 z-10' : 'border-white/5 opacity-80 hover:opacity-100'}`}>
    {isPopular && <div className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1 rounded-full w-fit absolute -top-3 left-1/2 -translate-x-1/2 tracking-[0.2em] shadow-xl">Recomendado</div>}
    <div>
      <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-2">{title}</h3>
      <div className="text-4xl font-bold text-white tracking-tighter mb-2">{price}</div>
      <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{subtitle}</p>
    </div>
    <div className="flex-1 space-y-4">
      {features.map((f: string, i: number) => (
        <div key={i} className="flex items-start gap-3">
          <div className="p-1 bg-white/5 rounded-md border border-white/10 mt-0.5"><Check size={10} className="text-blue-400" /></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight leading-tight">{f}</span>
        </div>
      ))}
    </div>
    <button onClick={onSelect} className={`w-full py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${isPopular ? 'btn-gradient text-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}>
      Seleccionar Plan
    </button>
  </div>
);

const InteractiveSolutionCard = ({ icon, title, desc, features }: any) => (
  <div className="glass-panel p-10 space-y-6 group">
    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 w-fit group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div className="space-y-4">
      <h4 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h4>
      <p className="text-slate-400 font-bold text-[11px] uppercase leading-relaxed tracking-tight">{desc}</p>
    </div>
    <div className="pt-4 space-y-3">
      {features.map((f: string, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{f}</span>
        </div>
      ))}
    </div>
  </div>
);

const StepCard = ({ num, title, desc, icon }: any) => (
  <div className="space-y-6 group cursor-default">
    <div className="relative">
      <span className="text-7xl font-black text-white/5 absolute -top-10 -left-4 group-hover:text-blue-500/10 transition-colors">{num}</span>
      <div className="p-4 bg-slate-800 rounded-2xl border border-white/5 text-white w-fit relative z-10 group-hover:bg-blue-600 transition-colors shadow-xl">
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
    <div className="space-y-3">
      <h4 className="text-lg font-bold text-white uppercase tracking-tight">{title}</h4>
      <p className="text-slate-500 font-bold text-[10px] uppercase leading-relaxed tracking-tighter">{desc}</p>
    </div>
  </div>
);

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [activePage, setActivePage] = useState<SubPage>('inicio');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  return (
    <div className="min-h-screen relative font-sans overflow-hidden">
      {/* Resplandor Global de Fondo */}
      <div className="fixed inset-0 overflow-hidden -z-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full"></div>
      </div>

      <nav className="h-20 flex items-center justify-between px-8 lg:px-24 border-b border-white/10 fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActivePage('inicio')}>
          <Box className="text-blue-400 w-7 h-7 group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-bold text-xl tracking-tighter uppercase">DriveScan<span className="text-blue-400">Pro</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          <NavLink label="Inicio" active={activePage === 'inicio'} onClick={() => setActivePage('inicio')} />
          <NavLink label="Soluciones" active={activePage === 'soluciones'} onClick={() => setActivePage('soluciones')} />
          <NavLink label="Instalación" active={activePage === 'instalacion'} onClick={() => setActivePage('instalacion')} />
          <NavLink label="Planes" active={activePage === 'planes'} onClick={() => setActivePage('planes')} />
        </div>

        <button onClick={onStart} className="btn-gradient px-8 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest text-white transition-all active:scale-95">
          Portal Auditoría
        </button>
      </nav>

      <main className="pt-40">
        {activePage === 'inicio' && <InicioView onStart={onStart} setActivePage={setActivePage} />}
        {activePage === 'soluciones' && <SolucionesView />}
        {activePage === 'instalacion' && <InstalacionView />}
        {activePage === 'planes' && <PlanesView onStart={onStart} />}
      </main>
    </div>
  );
};

export default Landing;
