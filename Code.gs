var sheetName = 'Sheet1'
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function sendEmail() {
  var data,dataRange,L,lastRow,message,sheet,thisRow;
  sheet = SpreadsheetApp.getActiveSheet();
  lastRow = sheet.getLastRow();

  dataRange = sheet.getRange(1, 1, lastRow, 6);
  data = dataRange.getValues();

  L = data.length;
 
    thisRow = data[L-1];
    name = thisRow[0]; 
    email = thisRow[1]; 
company = thisRow[2]; 
help = thisRow[3]; 
budget = thisRow[4]; 
message = thisRow[5]; 

    email = thisRow[1];
 
    const dataObj={
      "name":name,
      "email":email,
      "company":company? company :'Not-provided',
      "help":help? help :'Not-provided',
      "budget":budget? budget :'Not-provided',
      "message":message? message :'Not-provided',

    }
   

// sendEmailWithReplyTo(dataObj);
    var templ = HtmlService
      .createTemplateFromFile('Data');  
  templ.dataObj = dataObj;
  var message = templ.evaluate().getContent();
  var recipient = "faraz.sabir@codefulcrum.com";
  var subject = "Your Google Spreadsheet Alert";
  var htmlBody = message;
  MailApp.sendEmail(recipient, subject, htmlBody,{
    htmlBody: htmlBody
    });
}
// function sendEmailWithReplyTo() {
//   var recipient = "faraz.sabir@codefulcrum.com";
//   var subject = "Your Google Spreadsheet Alert";
//   var body = "This is your Alert email!";
//   MailApp.sendEmail(recipient, subject, body);
// }

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)
  // sendEmailWithReplyTo()

  try { 
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName(sheetName)

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })
    
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
    sendEmail();
  }
}
