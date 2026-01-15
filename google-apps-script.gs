
/**
 * BRIDGE LOGÍSTICA DRIVE SCAN V5.4 - LECTURA/ESCRITURA
 * Sincronización oficial para Auditoría IA Masiva.
 */

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const data = contents.payload;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("AUDITORIA_GUIAS") || ss.insertSheet("AUDITORIA_GUIAS");
    
    if (sheet.getLastRow() === 0) {
      const headers = ["FECHA_SINCRO", "FOLIO", "FECHA_DOC", "EMISOR", "RUT_EMISOR", "RECEPTOR", "RUT_RECEPTOR", "DESTINO", "TOTAL_PALLETS", "OBSERVACIONES_IA", "NOMBRE_ARCHIVO", "LINK_DRIVE"];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#0f172a").setFontColor("white");
      sheet.setFrozenRows(1);
    }

    let fileUrl = "";
    try {
      let files = DriveApp.getFilesByName(data.fileName);
      if (files.hasNext()) fileUrl = files.next().getUrl();
    } catch (err) { fileUrl = ""; }

    const hyperlinkFormula = fileUrl ? '=HYPERLINK("' + fileUrl + '"; "📄 VER ARCHIVO")' : "SIN LINK";

    sheet.appendRow([
      new Date(),
      data.folio || "S/F",
      data.fechaDoc || "S/F",
      data.nombreEmisor || "S/R",
      data.rutEmisor || "S/R",
      data.nombreReceptor || "S/R",
      data.rutReceptor || "S/R",
      data.direccionEntrega || "S/D",
      data.totalUnidades || 0,
      data.alertaLogistica || "",
      data.fileName || "",
      hyperlinkFormula
    ]);

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  const action = e ? e.parameter.action : null;
  
  if (action === "read") {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("AUDITORIA_GUIAS");
      if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      
      const values = sheet.getDataRange().getValues();
      if (values.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

      const headers = values[0];
      const data = values.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => obj[header] = row[i]);
        return obj;
      });
      
      return ContentService.createTextOutput(JSON.stringify(data.reverse())).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput("SERVER DRIVE SCAN V5.4 - ONLINE").setMimeType(ContentService.MimeType.TEXT);
}
