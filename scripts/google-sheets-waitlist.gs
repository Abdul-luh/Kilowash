/**
 * Kilowash Waitlist — Google Sheets Backend (Google Apps Script)
 * Pre-seeded with the 45 verified LASU waitlist + survey signups.
 *
 * HOW TO DEPLOY (takes ~60 seconds):
 * 1. Open a blank Google Sheet (https://sheets.new).
 * 2. Click Extensions → Apps Script.
 * 3. Replace everything in Code.gs with this file and click Save (Ctrl+S).
 * 4. (Optional) Select `seedSheet` in the top toolbar and click Run once to populate
 *    the 45 existing signups immediately — otherwise they auto-populate on the first request.
 * 5. Click Deploy → New deployment → Web app:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the Web app URL (ends in /exec) into .env.local:
 *    VITE_WAITLIST_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 */

const SHEET_NAME = 'Waitlist';
const HEADERS = ['Timestamp', 'Email', 'School', 'Referral Code', 'Referred By'];

// 45 deduplicated, sorted real signups from Website + Campus Survey
// (excludes test emails: odulateabdullah / abdullahodulate & lagbaj*)
const SEED_ROWS = [
  ['2026-11-12T15:04:23Z', 'abdulazeezjide13@gmail.com', 'Lagos State University (LASU)', 'abdulaze946', ''],
  ['2026-11-13T16:50:59Z', 'abdurrasheedkhabbab@gmail.com', 'Lagos State University (LASU)', 'abdurras518', ''],
  ['2026-11-18T07:59:00Z', 'ade206182@gmail.com', 'Lagos State University (LASU)', 'ade20618426', ''],
  ['2026-11-12T10:01:52Z', 'adeaayat2706@gmail.com', 'Lagos State University (LASU)', 'adeaayat674', ''],
  ['2026-11-12T11:13:45Z', 'adeolah0328@gmail.com', 'Lagos State University (LASU)', 'adeolah0744', ''],
  ['2026-11-12T16:31:27Z', 'adexlr8@gmail.com', 'Lagos State University (LASU)', 'adexlr8697', ''],
  ['2026-11-13T07:59:27Z', 'afolabioluwadabira83@gmail.com', 'Lagos State University (LASU)', 'afolabio519', ''],
  ['2026-11-14T20:05:49Z', 'ayetobaoladimeji@gmail.com', 'Lagos State University (LASU)', 'ayetobao874', ''],
  ['2026-11-12T18:04:14Z', 'balogunsewey4@gmail.com', 'Lagos State University (LASU)', 'baloguns994', ''],
  ['2026-11-13T07:51:26Z', 'basitolokunola@gmail.com', 'Lagos State University (LASU)', 'basitolo432', ''],
  ['2026-11-17T11:42:41Z', 'bellofuhad200@gmail.com', 'Lagos State University (LASU)', 'bellofuh683', ''],
  ['2026-11-14T16:04:49Z', 'benedictbanjo00@gmail.com', 'Lagos State University (LASU)', 'benedict549', ''],
  ['2026-11-14T13:10:42Z', 'daviesprecious202@gmail.com', 'Lagos State University (LASU)', 'daviespr939', ''],
  ['2026-11-14T11:03:12Z', 'erinfolamizainab67@gmail.com', 'Lagos State University (LASU)', 'erinfola571', ''],
  ['2026-11-13T08:58:58Z', 'faosideenolowolagba@gmail.com', 'Lagos State University (LASU)', 'faosidee776', ''],
  ['2026-11-13T12:04:00Z', 'giftayomikun76@gmail.com', 'Lagos State University (LASU)', 'giftayom993', ''],
  ['2026-11-14T11:06:19Z', 'ifeoluwaojuroye2005@gmail.com', 'Lagos State University (LASU)', 'ifeoluwa461', ''],
  ['2026-11-15T19:48:25Z', 'israelcabala06@gmail.com', 'Lagos State University (LASU)', 'israelca289', ''],
  ['2026-11-12T14:20:18Z', 'kennyclassical4real@gmail.com', 'Lagos State University (LASU)', 'kennycla165', ''],
  ['2026-11-16T14:30:54Z', 'koikiafusattaiwo@gmail.com', 'Lagos State University (LASU)', 'koikiafu888', ''],
  ['2026-11-12T11:24:06Z', 'kolapotaofeek4@gmail.com', 'Lagos State University (LASU)', 'kolapota534', ''],
  ['2026-11-12T23:18:22Z', 'makinderidwan0@gmail.com', 'Lagos State University (LASU)', 'makinder193', ''],
  ['2026-11-13T21:39:47Z', 'mathewsedicity@gmail.com', 'Lagos State University (LASU)', 'mathewse489', ''],
  ['2026-11-12T15:55:00Z', 'mayowayusuf3004@gmail.com', 'Lagos State University (LASU)', 'mayowayu346', ''],
  ['2026-11-12T13:12:00Z', 'mimirunsewe96@gmail.com', 'Lagos State University (LASU)', 'mimiruns357', ''],
  ['2026-11-13T11:37:31Z', 'mojereolamichael1@gmail.com', 'Lagos State University (LASU)', 'mojereol591', ''],
  ['2026-11-14T19:08:00Z', 'mujeebsanni679@gmail.com', 'Lagos State University (LASU)', 'mujeebsa106', ''],
  ['2026-11-12T23:32:13Z', 'mutmainnahgiwa@gmail.com', 'Lagos State University (LASU)', 'mutmainn389', ''],
  ['2026-11-14T19:16:00Z', 'nurudeenolumegbon1@gmail.com', 'Lagos State University (LASU)', 'nurudeen868', ''],
  ['2026-11-14T17:24:01Z', 'odogiyonm@gmail.com', 'Lagos State University (LASU)', 'odogiyon922', ''],
  ['2026-11-11T20:49:00Z', 'ojugbelelateef2006@gmail.com', 'Lagos State University (LASU)', 'ojugbele801', ''],
  ['2026-11-11T20:37:00Z', 'okehabeeboluwatobiloba@gmail.com', 'Lagos State University (LASU)', 'okehabee665', ''],
  ['2026-11-15T06:15:39Z', 'oladiposamuel1708@gmail.com', 'Lagos State University (LASU)', 'oladipos640', ''],
  ['2026-11-13T10:27:29Z', 'olugasarah84@gmail.com', 'Lagos State University (LASU)', 'olugasar782', ''],
  ['2026-11-14T15:19:00Z', 'omoleeniola2@gmail.com', 'Lagos State University (LASU)', 'omoleeni833', ''],
  ['2026-11-12T11:44:17Z', 'owolabititobi452@gmail.com', 'Lagos State University (LASU)', 'owolabit476', ''],
  ['2026-11-12T12:53:30Z', 'preciousfuwa14@gmail.com', 'Lagos State University (LASU)', 'precious181', ''],
  ['2026-11-12T14:38:38Z', 'savagehush007@gmail.com', 'Lagos State University (LASU)', 'savagehu923', ''],
  ['2026-11-12T15:20:19Z', 'slamsbaba005@gmail.com', 'Lagos State University (LASU)', 'slamsbab154', ''],
  ['2026-11-13T09:23:56Z', 'taiwoireoluwakunmi@gmail.com', 'Lagos State University (LASU)', 'taiwoire919', ''],
  ['2026-11-12T14:08:32Z', 'trustypeter16@gmail.com', 'Lagos State University (LASU)', 'trustype477', ''],
  ['2026-11-13T09:01:15Z', 'uthmanfathiu8@gmail.com', 'Lagos State University (LASU)', 'uthmanfa481', ''],
  ['2026-11-14T12:42:56Z', 'wabimbola9@gmail.com', 'Lagos State University (LASU)', 'wabimbol700', ''],
  ['2026-11-13T07:56:44Z', 'wareezahoyeshola05@gmail.com', 'Lagos State University (LASU)', 'wareezah655', ''],
  ['2026-11-15T08:15:41Z', 'yusufhalimah78@gmail.com', 'Lagos State University (LASU)', 'yusufhal448', ''],
];

function isExcludedTestEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  return e.indexOf('lagbaj') === 0 || e.indexOf('odulate') !== -1;
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    if (SEED_ROWS.length > 0) {
      sheet.getRange(2, 1, SEED_ROWS.length, HEADERS.length).setValues(SEED_ROWS);
    }
  }
  return sheet;
}

function seedSheet() {
  getOrCreateSheet();
}

function getCounts(sheet, targetSchool) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { count: 0, schoolCount: 0, emails: new Set() };
  }

  const values = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
  const emails = new Set();
  let schoolCount = 0;
  const normalizedSchool = (targetSchool || '').trim().toLowerCase();

  for (let i = 0; i < values.length; i++) {
    const rowEmail = String(values[i][0] || '').trim().toLowerCase();
    const rowSchool = String(values[i][1] || '').trim().toLowerCase();
    if (rowEmail && !isExcludedTestEmail(rowEmail)) {
      if (!emails.has(rowEmail)) {
        emails.add(rowEmail);
        if (normalizedSchool && rowSchool === normalizedSchool) {
          schoolCount++;
        }
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

    if (isExcludedTestEmail(email)) {
      return jsonResponse({
        ok: true,
        count: stats.count,
        schoolCount: stats.schoolCount,
        excludedTestEmail: true,
      });
    }

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
