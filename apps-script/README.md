# Cài RSVP bằng Google Apps Script

Mất khoảng 5 phút. Kết quả: mỗi lượt xác nhận là một dòng trong Google Sheet của bạn.

## 1. Tạo Sheet + Script

1. Vào [sheets.new](https://sheets.new), đặt tên file, ví dụ **Xác nhận tham dự — Hùng & Ngọc**.
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá hết code mẫu, dán toàn bộ nội dung [`Code.gs`](Code.gs) vào.
4. Nếu muốn nhận email mỗi lần có người xác nhận: sửa dòng `const NOTIFY_EMAIL = '';` thành email của bạn.
5. Lưu (Ctrl+S).

## 2. Deploy

1. Nút **Deploy → New deployment**.
2. Bánh răng bên trái → chọn **Web app**.
3. Điền:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` ← bắt buộc, nếu để `Anyone with Google account` thì khách sẽ bị chặn
4. **Deploy** → Google hỏi quyền → **Authorize access** → chọn tài khoản → màn hình cảnh báo "Google hasn't verified this app" thì bấm **Advanced → Go to … (unsafe)** → **Allow**.

   (Cảnh báo này là bình thường với script tự viết chưa qua thẩm định của Google.)
5. Copy **Web app URL**, dạng:
   ```
   https://script.google.com/macros/s/AKfycb..................../exec
   ```

## 3. Dán URL vào 3 trang

Thay `PASTE_APPS_SCRIPT_URL_HERE` trong cả ba file:

- `index.html`
- `nhatrai/index.html`
- `nhagai/index.html`

Chạy nhanh bằng lệnh (thay `<URL>` bằng URL vừa copy):

```bash
sed -i "s|PASTE_APPS_SCRIPT_URL_HERE|<URL>|" index.html nhatrai/index.html nhagai/index.html
```

Chưa dán URL thì mục RSVP **tự động bị ẩn** — site vẫn chạy bình thường, khách không thấy form hỏng.

## 4. Kiểm tra

1. Mở thẳng URL `/exec` bằng trình duyệt. Phải thấy `{"ok":true,"msg":"RSVP endpoint đang chạy"}`.
2. Mở `/nhatrai/`, điền form, bấm gửi.
3. Mở Sheet — phải có một dòng mới, sheet tên `RSVP` tự tạo kèm dòng tiêu đề.

## Khi sửa Code.gs về sau

**Đừng** bấm *New deployment* — sẽ sinh URL mới và 3 trang HTML trỏ vào URL cũ.

Làm đúng: **Deploy → Manage deployments** → bấm bút chì ✏️ → **Version: New version** → **Deploy**. URL giữ nguyên.

## Những chỗ đã xử lý sẵn trong Code.gs

| Vấn đề | Cách xử lý |
|---|---|
| Hai người gửi cùng lúc ghi đè nhau | `LockService` khoá 20 giây |
| Bot spam form | Ô ẩn `website` (honeypot) — có giá trị thì bỏ qua, vẫn trả `ok` để bot không thử lại |
| Khách gõ `=IMPORTRANGE(...)` vào lời chúc | Chèn dấu `'` đầu chuỗi, Sheets không chạy như công thức |
| Ký tự điều khiển, chuỗi quá dài | `clean()` lọc và cắt theo độ dài từng cột |
| Lỗi gửi mail làm hỏng cả request | `notify()` bọc try/catch riêng, sheet vẫn được ghi |

## CORS — biết trước cho đỡ hoang mang

Apps Script không trả header CORS cho preflight request. Vì vậy `assets/invite.js` gửi JSON dưới dạng `Content-Type: text/plain;charset=utf-8` — đây là "simple request", trình duyệt không preflight.

Nếu vẫn bị chặn, `invite.js` tự bắn lại lần hai ở chế độ `mode: 'no-cors'`. Request vẫn tới nơi và dòng vẫn được ghi vào Sheet, chỉ là trình duyệt không đọc được phản hồi nên trang luôn báo thành công.

**Hệ quả:** nếu bạn dán sai URL, khách vẫn thấy "Cảm ơn bạn rất nhiều!" nhưng Sheet không có gì. Nên phải làm bước **4. Kiểm tra** ở trên trước khi gửi thiệp cho ai.

## Hạn mức

Tài khoản Google thường: 20.000 lượt gọi URL Fetch/ngày, 90 phút runtime/ngày, 100 email/ngày. Một đám cưới vài trăm khách không chạm gần tới đâu.
