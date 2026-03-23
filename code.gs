/**
 * METRO FC PRO - Backend 
 * Google Apps Script to handle data from the web app
 */

const SHEET_ID = '1qWevWtvKm7v8BkYuNwa0aUOubJD7mTPBCX-plCjInD8';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheetName || 'General_Entries';
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    const formData = data.formData;
    const headers = Object.keys(formData);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'User', ...headers]);
    }
    
    // Get existing headers to ensure alignment
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Check for any new headers and add them
    headers.forEach(h => {
      if (!existingHeaders.includes(h)) {
        existingHeaders.push(h);
        sheet.getRange(1, existingHeaders.length).setValue(h);
      }
    });

    // Prepare row data aligned with existing headers
    const rowData = Array(existingHeaders.length).fill('');
    rowData[0] = new Date(); // Timestamp is always first
    rowData[1] = data.user || 'Unknown'; // User is always second

    for (const key in formData) {
      const colIndex = existingHeaders.indexOf(key);
      if (colIndex !== -1) {
        rowData[colIndex] = formData[key];
      }
    }
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // 1. Serve UI if No parameters (Web App Entry)
  if (!e.parameter.action && !e.parameter.ean && !e.parameter.user) {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('Metro Store Pro - Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const action = e.parameter.action;
  
  function isDateInRange(rowDateStr, startStr, endStr) {
      if (!rowDateStr || !startStr || !endStr) return true; // If no dates passed, allow all (or customize)
      const target = new Date(rowDateStr);
      const s = new Date(startStr);
      s.setHours(0,0,0,0);
      const end = new Date(endStr);
      end.setHours(23,59,59,999);
      return target >= s && target <= end;
  }

  // 1. LOGIN ACTION
  if (action === 'login') {
    const user = e.parameter.user;
    const pass = e.parameter.pass;
    const empSheet = ss.getSheetByName('Employees');
    
    if (!empSheet) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Employees sheet missing from database. Please create it.'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = empSheet.getDataRange().getValues();
    // Assuming Columns in sheet: [0] Employee ID, [1] Password, [2] Full Name, [3] Role
    for (let i = 1; i < data.length; i++) {
        if (data[i][0].toString() === user && data[i][1].toString() === pass) {
            return ContentService.createTextOutput(JSON.stringify({
                status: 'success',
                name: data[i][2],
                role: data[i][3]
            })).setMimeType(ContentService.MimeType.JSON);
        }
    }
    return ContentService.createTextOutput(JSON.stringify({status: 'invalid'}))
        .setMimeType(ContentService.MimeType.JSON);
  }

  // 1.1 OUTWARD STATS (FOR DASHBOARD)
  if (action === 'getOutwardStats') {
    const sDate = e.parameter.start_date || new Date().toISOString().split('T')[0];
    const eDate = e.parameter.end_date || sDate;
    
    let totalOutwardVehicles = 0;
    let totalTrips = 0;
    let totalOutwardValue = 0;

    const sheets = ['Return_To_Vendor', 'STOs', 'Second_Sales', 'Jiomart_Outward'];
    sheets.forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const headers = (data[0] || []).map(h => String(h).toLowerCase());
        
        let valIdx = -1;
        if (headers.includes('total_value')) valIdx = headers.indexOf('total_value');
        else if (headers.includes('trip_value')) valIdx = headers.indexOf('trip_value');

        let tripIdx = -1;
        if (headers.includes('total_trips')) tripIdx = headers.indexOf('total_trips');
        else if (headers.includes('trip_id')) tripIdx = headers.indexOf('trip_id');

        for (let i = 1; i < data.length; i++) {
          const rawTimestamp = data[i][0];
          
          if (!sDate || isDateInRange(rawTimestamp, sDate, eDate)) {
              totalOutwardVehicles++;
              
              if (tripIdx > -1 && data[i][tripIdx]) {
                totalTrips++;
              }
              
              if (valIdx > -1) {
                const val = parseFloat(data[i][valIdx]);
                if (!isNaN(val)) totalOutwardValue += val;
              }
          }
        }
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      vehicles: totalOutwardVehicles,
      trips: totalTrips,
      value: totalOutwardValue
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 1.2 INWARD STATS (FOR DASHBOARD)
  if (action === 'getInwardStats') {
    const sDate = e.parameter.start_date || new Date().toISOString().split('T')[0];
    const eDate = e.parameter.end_date || sDate;
    
    let totalInwardVehicles = 0;
    let totalInwardValue = 0;

    const sheets = ['Vehicle_Inbound', 'Material_Inward', 'Diesel_Water_Inward', 'Imprest_Inward'];
    sheets.forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const headers = (data[0] || []).map(h => String(h).toLowerCase());
        
        let valIdx = -1;
        if (headers.includes('inv_value')) valIdx = headers.indexOf('inv_value');
        else if (headers.includes('material_value')) valIdx = headers.indexOf('material_value');
        else if (headers.includes('purchased_value')) valIdx = headers.indexOf('purchased_value');
        else if (headers.includes('amount_purchased')) valIdx = headers.indexOf('amount_purchased');

        for (let i = 1; i < data.length; i++) {
          const rawTimestamp = data[i][0];
          
          if (!sDate || isDateInRange(rawTimestamp, sDate, eDate)) {
              totalInwardVehicles++;
              
              if (valIdx > -1) {
                const val = parseFloat(data[i][valIdx]);
                if (!isNaN(val)) totalInwardValue += val;
              }
          }
        }
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      vehicles: totalInwardVehicles,
      value: totalInwardValue
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 1.8 PERFORMANCE KPIs
  if (action === 'getPerformanceKPIs') {
    const user = e.parameter.user || 'Unknown';
    const sDate = e.parameter.start_date || new Date().toISOString().split('T')[0];
    const eDate = e.parameter.end_date || sDate;
    
    const auditSheets = ['Dock_Door_Audit', 'Pack_Door_Audit', 'Bin_Audit', 'Floor_Walk', 'Kilometer_Validation', 'Trip_Validation'];
    const exceptionSheets = ['Duplicate_Register', 'CN_Register', 'Daily_Dispatch']; 
    
    const lpaStats = {}; 
    const segStats = {};
    const allSheets = ss.getSheets();
    
    allSheets.forEach(sheet => {
        const sheetName = sheet.getName();
        if (sheetName === 'Employees' || sheetName.includes('Master') || sheetName === 'EAN') return;
        
        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return;
        
        const headers = (data[0] || []).map(h => String(h).toLowerCase());
        let valIndices = [];
        headers.forEach((h, idx) => {
            if (h.includes('value') || h.includes('amount') || h.includes('diff') || h.includes('short') || h.includes('excess') || h.includes('damage')) {
                valIndices.push(idx);
            }
        });
        
        for (let i = 1; i < data.length; i++) {
            const rawTimestamp = data[i][0];
            if (!rawTimestamp) continue;
            
            if (isDateInRange(rawTimestamp, sDate, eDate)) {
                const rowUser = String(data[i][1]).trim() || 'Unknown';
                
                if (!lpaStats[rowUser]) {
                    lpaStats[rowUser] = { subs: 0, exceptions: 0, excValue: 0, audits: 0, audValue: 0 };
                }
                if (!segStats[sheetName]) {
                    segStats[sheetName] = { subs: 0, exceptions: 0, excValue: 0, audits: 0, audValue: 0 };
                }
                
                lpaStats[rowUser].subs++;
                segStats[sheetName].subs++;
                
                let rowSumVal = 0;
                valIndices.forEach(idx => {
                    const v = parseFloat(data[i][idx]);
                    if (!isNaN(v)) rowSumVal += Math.abs(v);
                });
                
                if (auditSheets.includes(sheetName)) {
                    lpaStats[rowUser].audits++;
                    lpaStats[rowUser].audValue += rowSumVal;
                    segStats[sheetName].audits++;
                    segStats[sheetName].audValue += rowSumVal;
                }
                else if (exceptionSheets.includes(sheetName)) {
                    lpaStats[rowUser].exceptions++;
                    lpaStats[rowUser].excValue += rowSumVal;
                    segStats[sheetName].exceptions++;
                    segStats[sheetName].excValue += rowSumVal;
                }
            }
        }
    });
    
    const matrix = Object.keys(lpaStats).map(name => ({
        name: name,
        subs: lpaStats[name].subs,
        exceptions: lpaStats[name].exceptions,
        excValue: lpaStats[name].excValue,
        audits: lpaStats[name].audits,
        audValue: lpaStats[name].audValue
    })).sort((a, b) => b.subs - a.subs);

    const segMatrix = Object.keys(segStats).map(name => ({
        name: name,
        subs: segStats[name].subs,
        exceptions: segStats[name].exceptions,
        excValue: segStats[name].excValue,
        audits: segStats[name].audits,
        audValue: segStats[name].audValue
    })).sort((a, b) => b.subs - a.subs);
    
    const userStats = lpaStats[user] || { subs: 0, exceptions: 0, excValue: 0, audits: 0, audValue: 0 };
    let rank = matrix.findIndex(u => u.name === user) + 1; 
    const totalUsers = Math.max(8, matrix.length); 
    if (rank === 0) rank = "-"; 
    
    return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        submissions: userStats.subs,
        audits: userStats.audits,
        exceptions: userStats.exceptions,
        rank: rank,
        totalTeam: totalUsers,
        lpaMatrix: matrix,
        segMatrix: segMatrix
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. EAN LOOKUP ACTION
  const ean = e.parameter.ean;
  if (ean) {
    const targetEan = String(ean).trim();
    const eanSheet = ss.getSheetByName('EAN');
    if (!eanSheet) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'EAN Sheet missing'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
    const data = eanSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        const currentEan = String(data[i][0]).split('.')[0].trim(); 
        if (currentEan === targetEan) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          article: data[i][1] || '',
          desc: data[i][2] || '',
          map: data[i][3] || 0
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({status: 'not_found'}))
        .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("Invalid Request Parameters");
}
