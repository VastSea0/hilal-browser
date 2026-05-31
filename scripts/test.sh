#!/usr/bin/env bash
# run-build.sh
#
# build-linux.sh betiğini otomatik paketleme modunda tetikler,
# üretilen arşiv yolunu doğrudan loglardan yakalar,
# config.yml dosyasını .packages klasörüne taşır ve arşivi dist klasörüne kopyalar.

set -euo pipefail

# Terminal çıktıları için renk tanımlamaları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Renksiz (Normal)

# Hedef dizin ve dosya tanımlamaları
TARGET_DIST_DIR="dist"
PACKAGES_DIR=".packages"
CONFIG_FILE="config.yml"

echo -e "${BLUE}[Master Script]${NC} Derleme ve paketleme süreci başlatılıyor..."

# build-linux.sh betiğine otomatik paketleme yapacağını bildirmek için
# HILAL_AUTO_PACKAGE çevre değişkenini 1 yapıyoruz.
PACKAGE_FILE=""

# Alt betiğin çıktısını satır satır okuyan döngü
while IFS= read -r line; do
  # Canlı takip için alt betiğin loglarını terminale basıyoruz
  echo "$line"
  
  # Satırda "Created package:" ifadesi geçiyorsa Regex kullanarak dosya yolunu yakala
  if [[ "$line" =~ Created[[:space:]]+package:[[:space:]]*(.+) ]]; then
    # Yakalanan yoldaki olası boşlukları ve satır sonu karakterlerini (\r) temizle
    PACKAGE_FILE=$(echo "${BASH_REMATCH[1]}" | tr -d '\r' | xargs)
  fi
done < <(HILAL_AUTO_PACKAGE=1 bash scripts/build-linux.sh package 2>&1)

echo -e "\n--------------------------------------------------"

if [ -n "$PACKAGE_FILE" ] && [ -f "$PACKAGE_FILE" ]; then
  echo -e "${GREEN}[Başarılı]${NC} Alt betik süreci başarıyla tamamladı."
  echo -e "${YELLOW}[Bulunan Arşiv]:${NC} $PACKAGE_FILE"

  # 1. Eğer mevcutsa config.yml dosyasını .packages klasörüne taşı
  if [ -f "$CONFIG_FILE" ]; then
    echo -e "${BLUE}[İşlem]${NC} '$CONFIG_FILE' dosyası '$PACKAGES_DIR/' dizinine taşınıyor..."
    mkdir -p "$PACKAGES_DIR"
    mv "$CONFIG_FILE" "$PACKAGES_DIR/"
    echo -e "${GREEN}[Tamamlandı]${NC} Konfigürasyon dosyası başarıyla taşındı."
  else
    echo -e "${YELLOW}[Bilgi]${NC} Ana dizinde '$CONFIG_FILE' bulunamadı, taşıma adımı atlanıyor."
  fi

  # 2. Hedef dist dizininin var olduğundan emin ol
  mkdir -p "$TARGET_DIST_DIR"

  # 3. Yalnızca arşiv dosyasını hedef klasöre kopyala
  echo -e "${BLUE}[İşlem]${NC} Arşiv dosyası kopyalanıyor: $(basename "$PACKAGE_FILE") -> $TARGET_DIST_DIR/"
  cp "$PACKAGE_FILE" "$TARGET_DIST_DIR/"

  echo -e "${GREEN}[Tamamlandı]${NC} Arşiv başarıyla '$TARGET_DIST_DIR' dizinine kopyalandı."
else
  echo -e "${RED}[Hata]${NC} Paket dosya yolu çözümlenemedi veya arşiv dosyası mevcut değil."
  exit 1
fi