
import { UserSubscription } from "../types";

/**
 * URL del Master License Script vinculada con éxito.
 * Esta es la URL que controla el acceso de todos tus clientes.
 */
const MASTER_LICENSE_SERVER_URL = "https://script.google.com/macros/s/AKfycbyONC_BE4SxsDSWGGI2Kl8nvg1OefPYbylpLQRNbXrL8u68f1PWG_CUDZwQ66WPW87gxA/exec"; 

export async function validateLicense(clientScriptUrl: string): Promise<UserSubscription> {
  // Si no hay URL de cliente (usuario nuevo), el servidor maestro lo registrará como TRIAL
  try {
    const url = clientScriptUrl || 'new_user_trial';
    
    // Consulta real al servidor maestro del desarrollador
    const response = await fetch(`${MASTER_LICENSE_SERVER_URL}?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) throw new Error("Error en servidor de licencias");
    
    const data = await response.json();
    
    return {
      userId: url,
      active: data.active,
      trialEnds: 0, 
      plan: data.plan || 'free',
      status: data.status || 'expired'
    };
  } catch (e) {
    console.error("Error validando licencia remota:", e);
    
    // Lógica de respaldo: Si tu servidor maestro falla, usamos la seguridad local
    // para no dejar al cliente sin servicio por un error de red.
    const installationDate = Number(localStorage.getItem('install_date')) || Date.now();
    if (!localStorage.getItem('install_date')) {
      localStorage.setItem('install_date', String(installationDate));
    }
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() > (installationDate + sevenDays);
    const isPremium = localStorage.getItem('is_premium_active') === 'true';

    return {
      userId: 'local_fallback',
      active: isPremium || !isExpired,
      trialEnds: installationDate + sevenDays,
      plan: isPremium ? 'pro' : 'free',
      status: isPremium ? 'active' : (isExpired ? 'expired' : 'active')
    };
  }
}
