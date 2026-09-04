# humiwedding.online — thiệp cưới Phi Hùng & Bích Ngọc

Site tĩnh trên GitHub Pages. Ba trang, một bộ giao diện dùng chung.

## Cấu trúc

```
index.html          bản chung — cả hai tiệc
nhatrai/index.html  chỉ tiệc Hạ Long 15/10
nhagai/index.html   Lễ Vu Quy + tiệc Hà Nội 01/10

assets/invite.css   toàn bộ giao diện (1 bản duy nhất)
assets/invite.js    engine: render, đếm ngược, lịch, .ics, RSVP
assets/photo.jpg    ảnh cưới (trước đây nhúng base64 trong index.html)

apps-script/        code + hướng dẫn dựng RSVP
_archive/           3 file HTML cũ, giữ để đối chiếu
```

Mỗi trang HTML **chỉ chứa nội dung của riêng nó** trong `window.SITE` + thẻ meta. Không có CSS hay JS nào nằm trong file trang. Sửa giao diện → sửa `assets/`. Sửa ngày giờ, địa chỉ, tên → sửa `window.SITE` của trang tương ứng.

## Gửi link cho khách

| Khách | Link |
|---|---|
| Bên nhà trai | `https://humiwedding.online/nhatrai/` |
| Bên nhà gái | `https://humiwedding.online/nhagai/` |
| Họ hàng đi cả hai / không rõ | `https://humiwedding.online/` |

### Cá nhân hoá tên khách

Thêm `?ten=` vào cuối link, tên sẽ hiện ngay dưới dòng "Trân trọng kính mời":

```
https://humiwedding.online/nhatrai/?ten=Bác Nam & gia đình
https://humiwedding.online/nhagai/?ten=Chị Hương
```

Dán thẳng vào Zalo được — Zalo tự encode khoảng trắng và dấu tiếng Việt. Nếu cần link sạch thì encode trước:

```bash
python3 -c "import urllib.parse,sys; print('https://humiwedding.online/nhatrai/?ten='+urllib.parse.quote(sys.argv[1]))" "Bác Nam & gia đình"
```

Không có `?ten=` thì phần tên đơn giản là không hiện — link trần vẫn dùng bình thường.

## Khác nhau giữa hai bản

|  | `/nhatrai/` | `/nhagai/` |
|---|---|---|
| Tên lễ | Lễ Thành Hôn | Lễ Vu Quy |
| Thứ tự tên | Phi Hùng & Bích Ngọc | Bích Ngọc & Phi Hùng |
| Thứ tự gia đình | Nhà Trai trước | Nhà Gái trước |
| Số sự kiện | 1 (tiệc 11:00) | 2 (Vu Quy 08:00 + tiệc 11:00) |
| Ngày tô đậm trên lịch | 15 | 01 |
| Cột "Bên" trong sheet RSVP | Nhà trai | Nhà gái |

Theo lệ thiệp cưới truyền thống: bên nào để tên con mình trước và ghi tên lễ của bên mình.

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

Logo là **nhãn hiệu cố định — luôn là HN trên cả 3 trang**. Quy ước để tên cô dâu trước ở bản nhà gái vẫn được áp dụng, nhưng ở phần tên đôi và thứ tự hai gia đình, không phải ở logo.

Ảnh gốc `humiwedding_logo.png` nằm trong `_archive/`, chỉ để đối chiếu, không được xuất bản.

## RSVP

Chưa bật. Mục xác nhận tham dự **tự ẩn** cho tới khi dán URL Apps Script vào cả 3 file — xem [apps-script/README.md](apps-script/README.md).

## Kiểm tra trước khi đẩy lên

```bash
python3 -m http.server 8899
# mở http://127.0.0.1:8899/nhatrai/?ten=Bác Nam
```

## Ghi chú

- Đường dẫn trong HTML là tuyệt đối (`/assets/...`), chạy đúng vì site nằm ở gốc tên miền riêng. Nếu sau này chuyển sang `user.github.io/repo/` thì phải đổi thành tương đối.
- `og:image` đang dùng chính ảnh cưới, tỉ lệ dọc 1400×2100. Zalo và Facebook sẽ cắt bớt hai đầu. Muốn preview đẹp hơn thì làm thêm một ảnh 1200×630 rồi trỏ `og:image` vào đó.
- `_archive/` không được GitHub Pages xuất bản (Jekyll bỏ qua thư mục bắt đầu bằng `_`). Chắc chắn hơn thì đừng commit thư mục này.
- Các link cũ `humiwedding.online/thiepcuoi-nhatrai.html` và `thiepcuoi-nhagai.html` **đã chết**. Hai file đó chưa từng được commit nên chưa ai nhận được link — nhưng nếu đã lỡ gửi cho ai thì cần báo lại.
