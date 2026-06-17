/**
 * ═══════════════════════════════════════════════════════════════
 *  HostelKhata — Google Sheets Auto-Sync Script
 *
 *  HOW TO SET UP (one time only):
 *  1. Open your Google Sheet
 *  2. Extensions → Apps Script
 *  3. Delete the default code, paste this entire file
 *  4. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below
 *  5. Click Save (💾)
 *  6. Run → syncToday() once to test (grant permissions when asked)
 *  7. Set up auto-trigger:
 *       Triggers (⏰ icon) → Add Trigger →
 *       Function: autoSync | Event: Time-driven | Daily timer | Midnight to 1am
 *
 *  After that: runs every night automatically. No manual work needed.
 * ═══════════════════════════════════════════════════════════════
 */

// ── YOUR SUPABASE CREDENTIALS ────────────────────────────────────
const SUPABASE_URL  = 'YOUR_SUPABASE_URL';         // e.g. https://xxxx.supabase.co
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';    // from Supabase → Settings → API
// ─────────────────────────────────────────────────────────────────

// ── Fetch data from Supabase ──────────────────────────────────────
function fetchSupabase(table, filters) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  if (filters) url += '&' + filters;
  const res = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
    }
  });
  return JSON.parse(res.getContentText());
}

// ── Format currency ───────────────────────────────────────────────
function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

// ── Get or create a sheet tab ─────────────────────────────────────
function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

// ── Style a header row ────────────────────────────────────────────
function styleHeader(sheet, row, cols) {
  const range = sheet.getRange(row, 1, 1, cols);
  range.setBackground('#1a1a2e');
  range.setFontColor('#a78bfa');
  range.setFontWeight('bold');
  range.setFontSize(10);
}

// ═══════════════════════════════════════════════════════════════
//  DAILY SYNC — writes today's transactions to "Daily - DD Mon YYYY" tab
// ═══════════════════════════════════════════════════════════════
function syncToday() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const today   = new Date();
  const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM yyyy');
  const tabName = 'Daily - ' + dateStr;

  // Fetch today's transactions
  const startISO = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endISO   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const transactions = fetchSupabase('transactions',
    `date=gte.${startISO}&date=lt.${endISO}&order=date.asc`);
  const members = fetchSupabase('profiles', '');
  const memberMap = {};
  members.forEach(m => memberMap[m.id] = m.name);

  const sheet = getOrCreateSheet(ss, tabName);
  sheet.clearContents();

  // Title
  sheet.getRange(1, 1, 1, 7).merge();
  sheet.getRange(1, 1).setValue('HostelKhata — ' + dateStr)
    .setFontSize(14).setFontWeight('bold').setFontColor('#7c3aed');
  sheet.getRange(2, 1).setValue('Generated: ' + new Date().toLocaleString('en-IN'))
    .setFontColor('#64748b').setFontSize(9);

  // Headers
  const headers = ['Time', 'Staff Name', 'Type', 'Category', 'Amount', 'Status', 'Note'];
  sheet.getRange(4, 1, 1, 7).setValues([headers]);
  styleHeader(sheet, 4, 7);

  // Data rows
  let row = 5;
  let totalExpense = 0, totalAdvance = 0;
  transactions.forEach(t => {
    const time = Utilities.formatDate(new Date(t.date), Session.getScriptTimeZone(), 'HH:mm');
    sheet.getRange(row, 1, 1, 7).setValues([[
      time,
      memberMap[t.member_id] || 'Unknown',
      t.type === 'advance' ? 'Advance 💰' : 'Expense 🛒',
      t.category || '—',
      t.amount,
      t.status === 'approved' ? '✓ Approved' : '⏳ Pending',
      t.note || ''
    ]]);
    if (t.type === 'expense' && t.status === 'approved') totalExpense += Number(t.amount);
    if (t.type === 'advance') totalAdvance += Number(t.amount);
    row++;
  });

  // Summary
  row += 1;
  sheet.getRange(row, 1).setValue('SUMMARY').setFontWeight('bold').setFontColor('#7c3aed');
  row++;
  sheet.getRange(row, 1, 3, 2).setValues([
    ['Total Expenses', totalExpense],
    ['Total Advances', totalAdvance],
    ['Net', totalExpense - totalAdvance],
  ]);

  // Auto-resize
  sheet.autoResizeColumns(1, 7);
  Logger.log('Daily sync done: ' + transactions.length + ' transactions for ' + dateStr);
}

// ═══════════════════════════════════════════════════════════════
//  MONTHLY SYNC — writes/updates "Monthly - Mon YYYY" tab
// ═══════════════════════════════════════════════════════════════
function syncMonth(year, month) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const d     = new Date(year || new Date().getFullYear(), (month !== undefined ? month : new Date().getMonth()), 1);
  const tabName = 'Monthly - ' + Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM yyyy');
  const tz = Session.getScriptTimeZone();

  const startISO = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  const endISO   = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

  const transactions = fetchSupabase('transactions',
    `date=gte.${startISO}&date=lt.${endISO}&order=date.asc`);
  const members = fetchSupabase('profiles', '');
  const memberMap = {};
  members.forEach(m => { memberMap[m.id] = m; });

  const sheet = getOrCreateSheet(ss, tabName);
  sheet.clearContents();

  // Title
  sheet.getRange(1,1,1,8).merge();
  sheet.getRange(1,1).setValue('HostelKhata — ' + tabName.replace('Monthly - ',''))
    .setFontSize(14).setFontWeight('bold').setFontColor('#7c3aed');
  sheet.getRange(2,1).setValue('Generated: ' + new Date().toLocaleString('en-IN'))
    .setFontColor('#64748b').setFontSize(9);

  // Transaction list
  const headers = ['Date', 'Day', 'Staff', 'Type', 'Category', 'Amount', 'Status', 'Note'];
  sheet.getRange(4,1,1,8).setValues([headers]);
  styleHeader(sheet, 4, 8);

  let row = 5;
  let catTotals = {}, memberTotals = {};
  let grandExpense = 0, grandAdvance = 0;

  transactions.forEach(t => {
    const dt = new Date(t.date);
    const dayStr = Utilities.formatDate(dt, tz, 'dd MMM');
    const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
    const mName = memberMap[t.member_id]?.name || 'Unknown';

    sheet.getRange(row, 1, 1, 8).setValues([[
      dayStr, weekday, mName,
      t.type === 'advance' ? 'Advance' : 'Expense',
      t.category || '—',
      t.amount,
      t.status === 'approved' ? '✓' : '⏳',
      t.note || ''
    ]]);

    if (t.type === 'expense' && t.status === 'approved') {
      grandExpense += Number(t.amount);
      catTotals[t.category || 'other'] = (catTotals[t.category || 'other'] || 0) + Number(t.amount);
      memberTotals[mName] = (memberTotals[mName] || 0) + Number(t.amount);
    }
    if (t.type === 'advance') grandAdvance += Number(t.amount);
    row++;
  });

  // Category breakdown
  row += 2;
  sheet.getRange(row, 1).setValue('CATEGORY BREAKDOWN').setFontWeight('bold').setFontColor('#06b6d4');
  row++;
  Object.entries(catTotals).sort((a,b) => b[1]-a[1]).forEach(([cat, amt]) => {
    sheet.getRange(row, 1, 1, 2).setValues([[cat, amt]]);
    row++;
  });

  // Member breakdown
  row += 1;
  sheet.getRange(row, 1).setValue('BY STAFF MEMBER').setFontWeight('bold').setFontColor('#10b981');
  row++;
  Object.entries(memberTotals).sort((a,b) => b[1]-a[1]).forEach(([name, amt]) => {
    sheet.getRange(row, 1, 1, 2).setValues([[name, amt]]);
    row++;
  });

  // Monthly totals
  row += 1;
  sheet.getRange(row, 1, 3, 2).setValues([
    ['Total Expenses', grandExpense],
    ['Total Advances', grandAdvance],
    ['Net', grandExpense - grandAdvance],
  ]);
  sheet.getRange(row, 1, 3, 1).setFontWeight('bold');

  sheet.autoResizeColumns(1, 8);
  Logger.log('Monthly sync done: ' + transactions.length + ' transactions for ' + tabName);
}

// ═══════════════════════════════════════════════════════════════
//  YEARLY SUMMARY — writes "Year 2025" overview tab
// ═══════════════════════════════════════════════════════════════
function syncYear(year) {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const yr  = year || new Date().getFullYear();
  const tabName = 'Year ' + yr;

  const startISO = new Date(yr, 0, 1).toISOString();
  const endISO   = new Date(yr + 1, 0, 1).toISOString();

  const transactions = fetchSupabase('transactions',
    `date=gte.${startISO}&date=lt.${endISO}&status=eq.approved&type=eq.expense`);

  const sheet = getOrCreateSheet(ss, tabName);
  sheet.clearContents();

  sheet.getRange(1,1,1,13).merge();
  sheet.getRange(1,1).setValue('HostelKhata — Year ' + yr + ' Summary')
    .setFontSize(14).setFontWeight('bold').setFontColor('#7c3aed');

  // Monthly totals grid
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  sheet.getRange(3,1,1,13).setValues([['Category', ...months]]);
  styleHeader(sheet, 3, 13);

  // Group by month + category
  const grid = {}; // grid[cat][month] = total
  transactions.forEach(t => {
    const m  = new Date(t.date).getMonth();
    const c  = t.category || 'other';
    if (!grid[c]) grid[c] = new Array(12).fill(0);
    grid[c][m] += Number(t.amount);
  });

  let row = 4;
  const monthTotals = new Array(12).fill(0);
  Object.entries(grid).sort().forEach(([cat, monthly]) => {
    sheet.getRange(row, 1, 1, 13).setValues([[cat, ...monthly]]);
    monthly.forEach((v,i) => monthTotals[i] += v);
    row++;
  });

  // Monthly totals row
  sheet.getRange(row, 1, 1, 13).setValues([['TOTAL', ...monthTotals]]);
  sheet.getRange(row, 1, 1, 13).setFontWeight('bold').setBackground('#0a0a1a').setFontColor('#a78bfa');

  sheet.autoResizeColumns(1, 13);
  Logger.log('Yearly sync done for ' + yr);
}

// ═══════════════════════════════════════════════════════════════
//  AUTO TRIGGER — runs every night at midnight
//  Set this as your Apps Script trigger
// ═══════════════════════════════════════════════════════════════
function autoSync() {
  syncToday();                                    // Today's transactions
  syncMonth();                                    // Update this month's sheet
  const yr = new Date().getFullYear();
  syncYear(yr);                                   // Update yearly summary
  Logger.log('autoSync complete at ' + new Date());
}

// ── Manual helpers — run these from Apps Script editor anytime ───
function syncThisMonth()  { syncMonth(); }
function syncThisYear()   { syncYear(); }
function syncAllHistory() {
  const yr = new Date().getFullYear();
  for (let m = 0; m < 12; m++) syncMonth(yr, m); // All months this year
  syncYear(yr);
}
