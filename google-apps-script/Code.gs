'use strict';
const SHEET_NAME='Contactos';
function doGet(){return json({ok:true,message:'Servicio Senzia activo.'});}
function doPost(e){const lock=LockService.getScriptLock();try{lock.waitLock(10000);const d=JSON.parse(e.postData.contents);if(!d.nombre||!d.email||!d.servicio||!d.mensaje||d.autorizacion!=='Sí')throw new Error('Datos incompletos.');const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(SHEET_NAME);if(!sh){sh=ss.insertSheet(SHEET_NAME);sh.appendRow(['Fecha','Nombre','Correo','Organización','Servicio','Mensaje','Autorización','Estado','Origen']);sh.getRange(1,1,1,9).setFontWeight('bold').setBackground('#0e1424').setFontColor('#ffffff');sh.setFrozenRows(1);}sh.appendRow([new Date(),safe(d.nombre),safe(d.email),safe(d.organizacion),safe(d.servicio),safe(d.mensaje),safe(d.autorizacion),'Nuevo',safe(d.origen)]);return json({ok:true,message:'Solicitud registrada.'});}catch(error){return json({ok:false,message:error.message});}finally{lock.releaseLock();}}
function safe(v){const s=String(v||'').trim();return /^[=+\-@]/.test(s)?"'"+s:s;}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
