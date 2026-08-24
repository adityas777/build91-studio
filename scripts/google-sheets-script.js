/**
 * Google Apps Script for Build91 Studio Feedback Logging
 * 
 * Target Sheet: https://docs.google.com/spreadsheets/d/1zyOIBfjnkRmm9mXv-9O5jc26H-UloMixs_loGX8WWyY/edit?gid=0#gid=0
 * 
 * HOW TO SETUP (Takes 1 minute):
 * 1. Open the Google Sheet above.
 * 2. In the top menu, click: Extensions → Apps Script.
 * 3. Delete any code in the editor and PASTE this entire script.
 * 4. Click the blue "Deploy" button (top right) → "New deployment".
 * 5. Click the gear icon next to "Select type" → Select "Web app".
 * 6. Configuration:
 *    - Description: "Build91 Feedback Logger"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Required so your website can post to it)
 * 7. Click "Deploy" → Authorize Access.
 * 8. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 9. Add it to .env.local as:
 *    GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL="https://script.google.com/macros/s/..."
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Client Name",
        "Organization / Project",
        "Overall Satisfaction",
        "Visual & 3D Quality",
        "Turnaround Time",
        "Communication & Responsiveness",
        "Would Recommend?",
        "Additional Comments"
      ]);
      
      // Style header row
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F1538");
      headerRange.setFontColor("#D4AF37");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.clientName || "Anonymous",
      data.organization || "N/A",
      data.overallSatisfaction || "",
      data.quality || "",
      data.turnaroundTime || "",
      data.communication || "",
      data.recommendation || "",
      data.comments || ""
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", rowAdded: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
