/**
 * RSVP endpoint cho thiệp cưới humiwedding.online
 * Nhận POST từ assets/invite.js rồi ghi một dòng vào Google Sheet.
 *
 * Cài đặt: xem apps-script/README.md
 */

const SHEET_NAME = 'RSVP';
const NOTIFY_EMAIL = '';        // điền email nếu muốn nhận thông báo mỗi lần có người xác nhận
const TZ = 'Asia/Ho_Chi_Minh';

const HEADERS = [
  'Thời điểm gửi', 'Bên', 'Buổi tiệc', 'Họ tên', 'Tham dự',
  'Số người', 'Lời chúc', 'Tên trên thiệp', 'Trang'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'server đang bận, thử lại giúp mình' });
  }

  try {
    const data = parseBody(e);

    // honeypot: chỉ bot mới điền ô này. Trả ok để bot không thử lại.
    if (data.website) return json({ ok: true });

    const name = clean(data.name, 80);
    if (!name) return json({ ok: false, error: 'thiếu họ tên' });

    getSheet().appendRow([
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'),
      clean(data.side, 40),
      clean(data.event, 120),
      name,
      clean(data.attend, 20),
      Math.max(0, Math.min(20, Number(data.guests) || 0)),
      clean(data.wish, 500),
      clean(data.invited, 60),
      clean(data.page, 200)
    ]);

    notify(name, data);
    return json({ ok: true });

  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Mở URL /exec bằng trình duyệt sẽ chạy hàm này — dùng để kiểm tra deploy sống hay chết. */
function doGet() {
  return json({ ok: true, msg: 'RSVP endpoint đang chạy' });
}

/* ---------------- helpers ---------------- */

function parseBody(e) {
  // invite.js gửi JSON dưới dạng text/plain để tránh preflight CORS
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (err) { /* rơi xuống dưới */ }
  }
  return (e && e.parameter) || {};
}

/**
 * Cắt độ dài và vô hiệu hoá công thức.
 * Khách gõ "=IMPORTRANGE(...)" vào ô lời chúc thì Sheets sẽ chạy nó như công thức,
 * nên phải chèn dấu nháy đơn ở đầu.
 */
function clean(v, max) {
  let s = String(v == null ? '' : v).replace(/[\x00-\x1f\x7f]/g, ' ').trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, max);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify(name, data) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '[Thiệp cưới] ' + name + ' — ' + (data.attend || ''),
      body: [
        'Họ tên: ' + name,
        'Bên: ' + (data.side || ''),
        'Buổi tiệc: ' + (data.event || ''),
        'Tham dự: ' + (data.attend || ''),
        'Số người: ' + (data.guests || ''),
        'Lời chúc: ' + (data.wish || '')
      ].join('\n')
    });
  } catch (err) {
    console.error('gửi mail lỗi', err);   // lỗi mail không được làm hỏng việc ghi sheet
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
