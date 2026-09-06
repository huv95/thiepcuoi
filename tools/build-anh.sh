#!/usr/bin/env bash
# Nén ảnh cưới cho web: anhcuoi/*.jpg (ảnh gốc 5000px, ~20MB) -> assets/anh/
#
# Mỗi ảnh cho ra 3 file:
#   <tên>.webp      900px, chất lượng 72 — bản chính, mọi trình duyệt từ 2020 đều đọc được
#   <tên>.jpg       900px, chất lượng 78 — bản dự phòng cho máy quá cũ
#   <tên>.blur.txt  data:URI 20px đã làm mờ — chèn thẳng vào CSS làm nền chờ, không tốn request
#
# Ảnh gốc KHÔNG commit (xem .gitignore). Chạy lại khi thay ảnh:
#   bash tools/build-anh.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d anhcuoi ] || { echo "Thiếu thư mục anhcuoi/"; exit 1; }
mkdir -p assets/anh

for f in anhcuoi/*.jpg; do
  n=$(basename "$f" .jpg)
  convert "$f" -auto-orient -strip -resize 900x -quality 72 -define webp:method=6 "assets/anh/$n.webp"
  convert "$f" -auto-orient -strip -resize 900x -quality 78 -interlace Plane "assets/anh/$n.jpg"
  convert "$f" -auto-orient -strip -resize 20x -quality 40 "assets/anh/$n.blur.jpg"
  printf 'data:image/jpeg;base64,%s' "$(base64 -w0 "assets/anh/$n.blur.jpg")" > "assets/anh/$n.blur.txt"
  rm -f "assets/anh/$n.blur.jpg"
  printf '%-14s %7s webp  %7s jpg  %5s nền chờ\n' "$n" \
    "$(du -h "assets/anh/$n.webp" | cut -f1)" \
    "$(du -h "assets/anh/$n.jpg"  | cut -f1)" \
    "$(wc -c < "assets/anh/$n.blur.txt")"
done
