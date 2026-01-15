
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  data?: string; // Base64
}

export interface DriveContent {
  base64: string;
  mimeType: string;
  name: string;
}

export async function fetchFilesFromDrive(scriptUrl: string, folderId: string): Promise<DriveFile[]> {
  if (!scriptUrl || !folderId) return [];

  try {
    const response = await fetch(`${scriptUrl}?action=list&folderId=${encodeURIComponent(folderId)}`);
    if (!response.ok) throw new Error("Error de red al conectar con Drive (Status: " + response.status + ")");
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error("Drive Fetch Error:", error);
    throw new Error(error.message || "Error al obtener lista de archivos de Drive");
  }
}

export async function getFileContent(scriptUrl: string, fileId: string): Promise<DriveContent> {
  if (!fileId) throw new Error("ID de archivo no proporcionado");
  
  try {
    const response = await fetch(`${scriptUrl}?action=get&fileId=${encodeURIComponent(fileId)}`);
    if (!response.ok) throw new Error("Error de red al obtener archivo (Status: " + response.status + ")");
    
    const result = await response.json();
    
    if (result.error) {
      console.error("Google Apps Script Error:", result.error);
      throw new Error(result.error);
    }

    if (!result.base64) {
      throw new Error("El bridge de Drive no devolvió contenido para el ID: " + fileId);
    }

    return {
      base64: result.base64,
      mimeType: result.mimeType || 'application/pdf',
      name: result.name || 'Sin nombre'
    };
  } catch (error: any) {
    console.error("Error crítico obteniendo archivo:", fileId, error);
    throw error;
  }
}
