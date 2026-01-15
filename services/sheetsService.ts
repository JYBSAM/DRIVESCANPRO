
import { DispatchGuide, ProcessedDocument } from "../types";

export class VersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VersionError";
  }
}

export async function syncToGoogleSheets(
  guide: DispatchGuide, 
  fileName: string, 
  scriptUrl: string
): Promise<boolean> {
  if (!scriptUrl) return false;
  try {
    const payload = {
      action: 'save',
      payload: {
        folio: guide.folio || "S/F",
        fechaDoc: guide.fecha || "S/F",
        nombreEmisor: guide.nombreEmisor || "S/R",
        rutEmisor: guide.rutEmisor || "S/R",
        nombreReceptor: guide.nombreReceptor || "S/R",
        rutReceptor: guide.rutReceptor || "S/R",
        direccionEntrega: guide.direccionEntrega || "S/D",
        totalUnidades: guide.totalUnidades || 0,
        alertaLogistica: guide.validacionRuta?.alertaLogistica || "",
        fileName: fileName
      }
    };
    
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (error) {
    console.error("Error sincronización:", error);
    return false;
  }
}

export async function deleteFromSheets(folio: string, scriptUrl: string): Promise<boolean> {
  if (!scriptUrl) return false;
  try {
    const payload = {
      action: 'delete',
      folio: folio
    };
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (error) {
    console.error("Error al eliminar:", error);
    return false;
  }
}

export async function fetchFromSheets(scriptUrl: string): Promise<ProcessedDocument[]> {
  if (!scriptUrl) return [];
  
  const cleanUrl = scriptUrl.trim();
  const separator = cleanUrl.includes('?') ? '&' : '?';
  const fullUrl = `${cleanUrl}${separator}action=read&t=${Date.now()}`;
  
  try {
    const response = await fetch(fullUrl);
    const text = await response.text();
    
    if (text.includes("SERVER") && text.includes("ONLINE") && !text.trim().startsWith('[')) {
      throw new VersionError(text);
    }

    if (!text.trim() || text.includes('<!DOCTYPE html>')) return [];

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return [];
    }
    
    if (!Array.isArray(data)) return [];

    return data.map((row: any, index: number): ProcessedDocument => ({
      id: `cloud-${index}-${row.FOLIO || 'idx'}`,
      fileName: row.NOMBRE_ARCHIVO || 'Desconocido',
      timestamp: row.FECHA_SINCRO ? new Date(row.FECHA_SINCRO).getTime() : Date.now(),
      status: 'success',
      data: {
        folio: String(row.FOLIO || ''),
        fecha: String(row.FECHA_DOC || ''),
        nombreEmisor: String(row.EMISOR || ''),
        rutEmisor: String(row.RUT_EMISOR || ''),
        nombreReceptor: String(row.RECEPTOR || ''),
        rutReceptor: String(row.RUT_RECEPTOR || ''),
        direccionEntrega: String(row.DESTINO || ''),
        items: [],
        totalUnidades: parseInt(row.TOTAL_PALLETS) || 0,
        total: 0,
        validacionRuta: {
          origenValidado: true,
          destinoValidado: true,
          alertaLogistica: row.OBSERVACIONES_IA || row.OBSERVACIONES || ""
        }
      }
    }));
  } catch (error) {
    if (error instanceof VersionError) throw error;
    return [];
  }
}
