/**
 * Kilowash Waitlist — Google Sheets Backend (Google Apps Script)
 *
 * HOW TO DEPLOY (takes ~60 seconds):
 * 1. Open a Google Sheet (new or existing).
 * 2. Click Extensions → Apps Script.
 * 3. Replace everything in Code.gs with this file and click Save (Ctrl+S).
 * 4. Click Deploy → New deployment.
 * 5. Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click Deploy, authorize access, and copy the Web app URL (ends in /exec).
 * 7. Add it to your .env.local file:
 *    VITE_WAITLIST_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 */

const SHEET_NAME = 'Waitlist';
const HEADERS = ['Timestamp', 'Email', 'School', 'Referral Code', 'Referred By'];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getCounts(sheet, targetSchool) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { count: 0, schoolCount: 0, emails: new Set() };
  }

  // Read Email (col B) and School (col C) from row 2 downwards
  const values = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
  const emails = new Set();
  let schoolCount = 0;
  const normalizedSchool = (targetSchool || '').trim().toLowerCase();

  for (let i = 0; i < values.length; i++) {
    const rowEmail = String(values[i][0] || '').trim().toLowerCase();
    const rowSchool = String(values[i][1] || '').trim().toLowerCase();
    if (rowEmail) {
      emails.add(rowEmail);
      if (normalizedSchool && rowSchool === normalizedSchool) {
        schoolCount++;
      }
    }
  }

  return {
    count: emails.size,
    schoolCount: schoolCount,
    emails: emails,
  };
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const school = e && e.parameter ? e.parameter.school : '';
    const stats = getCounts(sheet, school);

    return jsonResponse({
      ok: true,
      count: stats.count,
      schoolCount: stats.schoolCount,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);

    const email = String(body.email || '').trim().toLowerCase();
    const school = String(body.school || '').trim();
    const referralCode = String(body.referralCode || '').trim();
    const referredBy = String(body.referredBy || '').trim();

    if (!email || !school) {
      return jsonResponse({ ok: false, error: 'Missing email or school' });
    }

    const sheet = getOrCreateSheet();
    const stats = getCounts(sheet, school);

    let alreadyRegistered = false;
    if (stats.emails.has(email)) {
      alreadyRegistered = true;
    } else {
      sheet.appendRow([
        new Date().toISOString(),
        email,
        school,
        referralCode,
        referredBy,
      ]);
      stats.count += 1;
      stats.schoolCount += 1;
    }

    return jsonResponse({
      ok: true,
      count: stats.count,
      schoolCount: stats.schoolCount,
      alreadyRegistered: alreadyRegistered,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
