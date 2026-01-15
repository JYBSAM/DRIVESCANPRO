
export interface SystemStatus {
  ai: 'online' | 'offline' | 'checking';
  sheets: 'online' | 'offline' | 'checking';
}

export async function checkConnectivity(scriptUrl: string, apiKey: string): Promise<SystemStatus> {
  const status: SystemStatus = { ai: 'checking', sheets: 'checking' };

  // 1. Verificar IA (Basado en la presencia de la Key)
  status.ai = apiKey ? 'online' : 'offline';

  // 2. Verificar Sheets (Ping al Script URL)
  if (scriptUrl) {
    try {
      // Usamos mode: 'no-cors' para validar existencia del endpoint sin problemas de seguridad
      await fetch(scriptUrl, { method: 'GET', mode: 'no-cors' });
      status.sheets = 'online';
    } catch {
      status.sheets = 'offline';
    }
  } else {
    status.sheets = 'offline';
  }

  return status;
}
