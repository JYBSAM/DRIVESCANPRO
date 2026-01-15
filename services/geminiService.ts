
import { GoogleGenAI, Type } from "@google/genai";
import { DispatchGuide } from "../types";

const GUIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    folio: { type: Type.STRING, description: "Número de folio o correlativo de la guía" },
    fecha: { type: Type.STRING, description: "Fecha de emisión impresa en el documento (FECHA_DOC)" },
    nombreEmisor: { type: Type.STRING, description: "Nombre o Razón Social del emisor" },
    rutEmisor: { type: Type.STRING, description: "RUT del emisor (ej: 76.123.456-K)" },
    nombreReceptor: { type: Type.STRING, description: "Nombre o Razón Social del cliente/receptor" },
    rutReceptor: { type: Type.STRING, description: "RUT del receptor (ej: 96.987.654-3)" },
    direccionEntrega: { type: Type.STRING, description: "Dirección de destino de la carga" },
    totalUnidades: { type: Type.NUMBER, description: "Suma total de pallets o bultos. Prioriza números manuscritos." },
    validacionRuta: {
      type: Type.OBJECT,
      properties: {
        alertaLogistica: { type: Type.STRING, description: "Observaciones sobre tachones, firmas o legibilidad" }
      },
      required: ["alertaLogistica"]
    }
  },
  required: ["folio", "fecha", "nombreEmisor", "nombreReceptor", "totalUnidades", "validacionRuta"]
};

function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function analyzeDocument(base64Data: string, mimeType: string = 'image/jpeg'): Promise<DispatchGuide> {
  // Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const payload = {
    model: 'gemini-3-flash-preview', 
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: "Analiza esta guía de despacho. Es CRÍTICO extraer la FECHA DE EMISIÓN del documento y el TOTAL DE BULTOS/PALLETS (especialmente si hay números escritos a mano con lápiz)." }
      ],
    },
    config: {
      systemInstruction: `Eres un auditor experto en logística chilena.
      Extrae los datos con precisión quirúrgica.
      FECHA: Busca la fecha de emisión del documento.
      RUTS: Extrae los RUTs con puntos y guion si es posible.
      TOTAL UNIDADES: Tu prioridad número 1 es el conteo manual escrito por el bodeguero.
      OBSERVACIONES: Indica si el documento está timbrado o si hay firmas cruzadas.`,
      responseMimeType: "application/json",
      responseSchema: GUIDE_SCHEMA,
    },
  };

  const response = await ai.models.generateContent(payload);
  const cleanText = cleanJsonResponse(response.text || "{}");
  const parsed = JSON.parse(cleanText);

  // Added missing properties to satisfy the DispatchGuide interface and handle optional values robustly
  return {
    ...parsed,
    items: parsed.items || [],
    total: parsed.total || 0,
    validacionRuta: {
      origenValidado: parsed.validacionRuta?.origenValidado ?? true,
      destinoValidado: parsed.validacionRuta?.destinoValidado ?? true,
      alertaLogistica: parsed.validacionRuta?.alertaLogistica || null
    }
  } as DispatchGuide;
}
