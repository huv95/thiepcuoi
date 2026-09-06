# humiwedding.online — thiệp cưới Phi Hùng & Bích Ngọc

Site tĩnh trên GitHub Pages. **Một thiệp duy nhất, do cô dâu chú rể đứng tên**, gói gọn trong 3 trang cuộn dọc — mỗi trang vừa đúng một màn hình.

## Cấu trúc

```
index.html          toàn bộ nội dung thiệp (window.SITE) + thẻ meta

assets/invite.css   toàn bộ giao diện (1 bản duy nhất)
assets/invite.js    engine: render 3 trang, tự co cho vừa màn hình, đếm ngược, .ics, RSVP
assets/photo.jpg    ảnh cưới (trước đây nhúng base64 trong index.html)

apps-script/        code + hướng dẫn dựng RSVP
_archive/           bản HTML cũ (kể cả 2 thiệp nhà trai / nhà gái), giữ để đối chiếu
```

`index.html` **chỉ chứa nội dung** trong `window.SITE` + thẻ meta. Không có CSS hay JS nào nằm trong file trang. Sửa giao diện → sửa `assets/`. Sửa ngày giờ, địa chỉ, tên → sửa `window.SITE`.

## Ba trang

| Trang | Nội dung |
|---|---|
| 1 | Lời mời — logo, tên khách, tên cô dâu chú rể, **đủ giờ + ngày + địa điểm của cả hai buổi tiệc** |
| 2 | Ảnh cưới |
| 3 | Đếm ngược cả hai tiệc, nút bản đồ + thêm vào lịch cho từng tiệc, lời cảm ơn |

Thứ tự các trang nằm ở giữa `assets/invite.js` (`page(1, …)` … `page(3, …)`). Muốn đổi trang nào chứa mục nào thì sửa đúng chỗ đó, không cần đụng vào các hàm dựng section.

Ngày giờ và địa chỉ đầy đủ **chỉ nằm ở `hero.schedule`** (trang 1). `SITE.events` giờ chỉ còn nhãn đếm ngược, mốc thời gian cho .ics và câu tìm đường cho Google Maps.

Giọng văn là lời của **hai bạn**, không phải lời của bố mẹ: "Tới dự lễ thành hôn của hai chúng tôi".

### Mỗi trang tự vừa một màn hình

Không đặt breakpoint riêng cho từng đời máy. `assets/invite.js` (hàm `fitPages`) đo chiều cao thật của khung nhìn — `visualViewport.height`, tức đã trừ thanh công cụ Safari/Chrome — rồi trang nào cao hơn thì thu khối `.page-inner` của trang đó lại đúng bằng tỉ lệ còn thiếu (`zoom`, sàn 0.62). Trang nào vừa sẵn thì không đụng gì.

Đo lại khi: font tải xong, `load` (ảnh cưới xong mới biết chiều cao thật), xoay ngang, đổi cỡ cửa sổ. Đã kiểm bằng Edge ở 393×700, 393×852 và 375×560 — cả ba trang đều trọn trong một màn hình, kể cả khi có thêm dòng tên khách từ `?ten=`.

Hoa văn góc và dòng "Cuộn xuống" nằm **ngoài** `.page-inner` để không bị `zoom` kéo lệch.

CSS vẫn giữ một mốc `@media(max-width:700px)` để bố cục điện thoại gọn sẵn — `fitPages` chỉ là lớp bảo hiểm cho phần còn thiếu.

## Gửi link cho khách

Chỉ còn một link duy nhất: `https://humiwedding.online/`

### Cá nhân hoá tên khách

Thêm `?ten=` vào cuối link, tên sẽ hiện ngay dưới dòng "Trân trọng kính mời":

```
https://humiwedding.online/?ten=Bác Nam & gia đình
https://humiwedding.online/?ten=Chị Hương
```

Dán thẳng vào Zalo được — Zalo tự encode khoảng trắng và dấu tiếng Việt. Nếu cần link sạch thì encode trước:

```bash
python3 -c "import urllib.parse,sys; print('https://humiwedding.online/?ten='+urllib.parse.quote(sys.argv[1]))" "Bác Nam & gia đình"
```

Không có `?ten=` thì phần tên đơn giản là không hiện — link trần vẫn dùng bình thường.

## Logo

Logo H&N **không dùng ảnh** — toàn bộ là `<path>` SVG, nằm trong [assets/logo.js](assets/logo.js).

Được vector hoá trực tiếp từ `humiwedding_logo.png` bằng potrace, tách làm 3 lớp:

| Lớp | Nội dung | Màu |
|---|---|---|
| `.hn-pale` | Phần nhạt: ruột cánh hoa, ruột lá | `#f2e6d2` |
| `.hn-line` | Nét mảnh: vòng tròn, cành, viền lá, chữ WEDDING, trái tim | `#c8a576` |
| *(không class)* | Hai chữ H–N, gồm cả nét sổ thư pháp lớn | gradient `hnGoldA` |

Cách tách: nền và nét vàng phân biệt bằng **độ ấm màu R−B** (nền 5–11, nét vàng 65–103) chứ không phải độ sáng — dùng độ sáng sẽ khoét thủng chữ ở những vệt sáng kim loại. Sau đó dùng distance transform để tách nét dày (chữ) khỏi nét mảnh (vòng, lá).

Hướng và các chặng màu của gradient được suy ra bằng hồi quy tuyến tính trên chính ảnh gốc, nên độ chuyển sáng-tối khớp với bản gốc.

`window.HN_LOGO` có hai biến thể:
- `full` — logo đầy đủ, dùng ở hero
- `mark` — chỉ hai chữ cái, dùng ở footer

Màu có `fill` sẵn trong SVG nên không phụ thuộc CSS, nhưng vẫn cho phép ghi đè qua `.logo .hn-line` / `.logo .hn-pale` trong `invite.css`.

Chỉnh cỡ: sửa `width` của `.logo` (hero) và `.logo-holder--sm .logo` (footer) trong CSS.

Logo là **nhãn hiệu cố định — luôn là HN**.

Ảnh gốc `humiwedding_logo.png` nằm trong `_archive/`, chỉ để đối chiếu, không được xuất bản.

## RSVP

Chưa bật. Mục xác nhận tham dự nằm cuối trang 3 và **tự ẩn** cho tới khi dán URL Apps Script vào `SITE.rsvp.url` — xem [apps-script/README.md](apps-script/README.md).

Lưu ý: bật RSVP lên thì trang 3 dài thêm một cái form, `fitPages` sẽ co trang đó nhỏ lại kha khá. Lúc ấy nên tách RSVP thành trang 4 riêng.

## Kiểm tra trước khi đẩy lên

```bash
python3 -m http.server 8899
# mở http://127.0.0.1:8899/?ten=Bác Nam
```

## Ghi chú

- Đường dẫn trong HTML là tuyệt đối (`/assets/...`), chạy đúng vì site nằm ở gốc tên miền riêng. Nếu sau này chuyển sang `user.github.io/repo/` thì phải đổi thành tương đối.
- `og:image` đang dùng chính ảnh cưới, tỉ lệ dọc 1400×2100. Zalo và Facebook sẽ cắt bớt hai đầu. Muốn preview đẹp hơn thì làm thêm một ảnh 1200×630 rồi trỏ `og:image` vào đó.
- `_archive/` không được GitHub Pages xuất bản (Jekyll bỏ qua thư mục bắt đầu bằng `_`). Chắc chắn hơn thì đừng commit thư mục này.
- Các link cũ `humiwedding.online/nhatrai/`, `humiwedding.online/nhagai/`, `thiepcuoi-nhatrai.html`, `thiepcuoi-nhagai.html` **đã chết**. Nếu đã lỡ gửi cho ai thì gửi lại link gốc `https://humiwedding.online/`.
