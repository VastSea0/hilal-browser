# HILAL BROWSER - GUNCEL TARAFSIZ DENETIM RAPORU

**Rapor tarihi:** 2026-06-03
**Incelenen yerel dizin:** `/Users/egehan/Development/huma-browser`
**Yerel repo HEAD:** `e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa`
**Yerel HEAD mesaji:** `Merge branch 'main' of github.com:VastSea0/hilal-browser`
**Yerel branch:** `main`
**Manifest surumu:** `0.3.0`
**Upstream lock:** Firefox `153.0a1`, commit `e28b34ab33dbf49364999070168cbb7e11e8e5bd`
**Public latest release:** `v0.2.0-alpha.5`, GitHub Releases, 2026-05-29
**Kaynak model:** Firefox uzerine patch + overlay katmani; tam Firefox fork'u degil.

Bu rapor onceki raporun uzerine duzeltme olarak yazilmadi. Yerel repo, `engine/` checkout'u, manifest, yamalar, dokumantasyon, scriptler, public GitHub release/action/issue durumu ve calistirilan dogrulama komutlari yeniden incelenerek sifirdan yazildi.

---

## 1. Kisa Sonuc

Hilal Browser aktif gelistirme asamasinda ve public olarak `v0.2.0-alpha.5` buildleri yayinlanmis durumda. Kod organizasyonu artik eski `patches/series` ve `firefox/` modelinden cikmis; `manifest.toml`, `changes/` ve Rust tabanli `./bin/hil` patch manager modeli ana kaynak haline gelmis.

Tarayicinin mevcut ozellik seti alpha bir urun icin kapsamli: Hilal markalama, macOS chrome seffafligi, container tabanli workspace sistemi, Hilal sidebar, compact mode, bang sistemi, privacy level profilleri, Turkish langpack, uBlock Origin bundling, desktop update policy ve MAR imza altyapisi bulunuyor.

Buna karsin mevcut durum release icin temiz degil. Yerel repoda rapor disinda `manifest.toml` degisikligi var, `engine/` Git HEAD cozumlenemiyor, public release workflow son kosularda basarisiz gorunuyor ve bu denetimde tam `mach build`, `mach run` veya browser chrome testleri dogrulanamadi. Bu nedenle bugunku durum "gelistirme/alpha icin ilerlemis, stable icin hazir degil" olarak degerlendirilmeli.

En kritik tarafsiz sonuc: Proje urunlesiyor, fakat release guvenilirligi su anda ozellik sayisindan daha geride.

---

## 2. Inceleme Kapsami ve Sinirlar

Bu rapor su kaynaklara dayanir:

- Yerel dosyalar: `manifest.toml`, `upstream.lock`, `changes/`, `docs/`, `scripts/`, `.github/workflows/`, `www/`, `hil/`, `mozconfigs/`, `flatpak/`.
- Yerel komutlar: Git status/log, `./bin/hil status`, `./bin/hil verify`, `npm` lint/build/test/audit, `cargo test`, Flatpak readiness check, disk durumu, hash kontrolleri.
- Public GitHub API: releases, tags, workflow runs, open issues, main branch metadata.

Not: Denetim sirasinda yerel repo durumu degisti; final rapor, son gorulen durum olan `e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa` HEAD'i ve current working tree status'u esas alir.

Bu raporda dogrulanmayan seyler:

- Tam Firefox/Hilal build sonucu.
- Calisan tarayici UI smoke testi.
- macOS code signing/notarization sonucu.
- Windows, Linux, Android veya Flatpak build sonucu.
- Update MAR'in eski bir build uzerinden gercek "Restart to Update" akisi.
- Public GitHub Actions run'larinin ilerleyen dakikalarda tamamlanmis olabilecegi; API sorgusu anlik durumu temsil eder.

---

## 3. Guncel Durum Tablosu

| Alan | Bulgular |
|---|---|
| Yerel branch | `main` |
| Yerel HEAD | `e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa` |
| GitHub `main` | API'ye gore `e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa` |
| Manifest version | `0.3.0` |
| Public latest release | `v0.2.0-alpha.5` |
| Public latest release metadata | `draft=false`, `prerelease=false` |
| Public latest assets | macOS DMG, Windows installer, Windows zip |
| Yerel son tag | `v0.2.0-alpha.5` |
| Upstream Firefox lock | `153.0a1`, `e28b34ab33dbf49364999070168cbb7e11e8e5bd` |
| Manifest uygulama girdisi | 32 |
| Patch dosyasi | 25 |
| Overlay/dogrudan sync girdisi | 7 |
| `changes/` boyutu | Yaklasik 6.6 MB, 382 dosya |
| Yerel repo durumu | Dirty: `hilal-browser-audit-report.md`, `manifest.toml` |
| `engine/` durumu | Git HEAD `refs/heads/.invalid`; `./bin/hil status` engine HEAD hatasiyla basarisiz |
| Bos disk | Yaklasik 7.8 GiB |
| Website lint/build/test | Gecti |
| Rust `hil` test | Derlendi, test harness gecti; 0 unit test var |
| Upstream checksum verify | No-op; `upstream.lock` icinde tarball URL/SHA yok |
| Public verify-patches workflow | Son sorguda run #42 in-progress; onceki main run cancelled |
| Public release workflow | Son 3 kosu failure |

---

## 4. Yerel Calisma Agaci Durumu

Yerel repo release veya audit tag'i icin temiz degil. Final `git status --porcelain` su iki degisikligi gosteriyor:

- `hilal-browser-audit-report.md`
- `manifest.toml`

Bu rapor degisikligi beklenen degisikliktir. `manifest.toml` degisikligi bu rapor yazimi icin yapilmadi; mevcut working tree durumunun bir parcasi olarak rapora alindi. Bu manifest degisikligi commitlenmeden veya geri alinmadan release kesilmemeli.

Ek olarak `npm run build` calistigi icin `www/dist` tarafinda build ciktilari olusmus olabilir; bunun izlenip izlenmedigi `.gitignore` durumuna gore ayrica kontrol edilmeli.

---

## 5. `engine/` Checkout Sagligi

`engine/` checkout'u final durumda saglikli degil. `engine/.git/HEAD` su ref'e isaret ediyor:

```text
ref: refs/heads/.invalid
```

`engine/.git/refs/heads` altinda cozumlenebilir branch ref'i gorulmedi. Bu nedenle:

```text
git -C engine rev-parse HEAD
```

`fatal: ambiguous argument 'HEAD'` hatasiyla basarisiz oldu. `./bin/hil status` da ayni engine HEAD hatasi nedeniyle exit code `1` ile bitti.

Denetimin onceki asamasinda `engine/.git/objects/info/alternates` su path'e isaret ediyordu:

```text
/Users/egehan/Development/huma-browser/firefox/.git/objects
```

Bu path mevcut degildi. Klasor olarak `firefox/` var, fakat tam Git checkout degil; sadece `obj-aarch64-apple-darwin25.4.0` kalmis gorunuyor.

Sonuc olarak su hatalar alindi:

```text
error: unable to normalize alternate object path: /Users/egehan/Development/huma-browser/firefox/.git/objects
fatal: unable to read tree (...)
```

`git -C engine fsck --no-progress` onceki okumada cok sayida invalid ref ve missing object/blob raporlayarak exit code `11` ile bitti. Final durumda HEAD bile cozumlenemedigi icin bu makinedeki `engine/` checkout'u temiz apply/build dogrulamasi icin saglikli kabul edilmemeli.

Release oncesi en dogru hareket `engine/` durumunu korumak gerekiyorsa once yedeklemek, sonra `./bin/hil setup` ve `./bin/hil apply --force` ile saglikli bir checkout yeniden olusturmak olur. Bu rapor destructive bir islem yapmadi.

---

## 6. Mimari ve Patch Modeli

Repo artik merkezi olarak `manifest.toml` tarafindan yonetiliyor. Manifest:

- Tarayici adini `Hilal Browser` olarak tanimliyor.
- Kod adini `hilal` olarak tutuyor.
- Surumu `0.3.0` olarak gosteriyor.
- 32 uygulama girdisini sira ile listeliyor.

Bu 32 girdinin 25'i `.patch` dosyasi. Kalan 7 girdi overlay veya dogrudan sync edilen dosya/dizin:

- `browser/branding/hilal`
- `browser/base/content/hilal`
- `browser/modules/HilalBangs.sys.mjs`
- `browser/app/distribution/extensions`
- `browser/themes/shared`
- `browser/app/distribution/policies.json`
- `toolkit/mozapps/update/updater`

Bu model dogru yonde: Firefox kaynak agacini repoya gommeden, Hilal degisikliklerini bildirilebilir ve sira kontrollu bir katman olarak tutuyor. Risk ise artik patch yuzeyinin kucuk olmamasi. Ozellikle sidebar, compact mode, browser chrome CSS ve workspace/session state akislarinda upstream Firefox degisiklikleri rebase maliyetini hizli arttirabilir.

`./bin/hil` Rust araci `setup`, `apply`, `refresh`, `status`, `verify` komutlarini sagliyor. `apply` sirasinda patch/overlay adimlarini engine Git gecmisinde commit'liyor, uBlock Origin'i indirip SHA256 ile dogruluyor ve Turkish locale merge akisini calistiriyor.

---

## 7. Ozellik Durumu

### 7.1 Branding ve Surum

Hilal branding overlay'i `changes/browser/branding/hilal` altinda duruyor. `branding-defaults.patch` varsayilan branding dizinini Hilal'e yonlendiriyor. `about-version-details.patch` ve `version.patch` kullaniciya gosterilen surum bilgisini ozellestiriyor.

Surum tarafinda bir tutarsizlik var:

- `manifest.toml`: `0.3.0`
- Public latest GitHub release: `v0.2.0-alpha.5`
- Flatpak metadata: `0.2.0-alpha.5`
- Yerel `dist/`: `0.2.0-alpha.4` MAR/DMG artefaktlari
- Repo root: `Hilal-Browser-0.2.0-alpha.2/3/4/5-mac.dmg`

Bu dogrudan hata demek degil; aktif gelistirme sirasinda normal olabilir. Ancak release notes, manifest, binary version, update manifest ve packaging metadata ayni release icin kilitlenmeden yeni release kesilmemeli.

### 7.2 Workspaces

`changes/browser/base/content/hilal/HilalWorkspaces.js` icindeki workspace sistemi Firefox contextual identity/container altyapisina baglaniyor. Workspace'ler:

- `ContextualIdentityService` ile container olusturuyor/guncelliyor.
- Sekme state'ine `hilalWorkspace` metadata'si yaziyor.
- Workspace bazli pin/group gorunurlugu icin pref kullaniyor.
- Workspace silerken `Services.clearData.deleteDataFromOriginAttributesPattern({ userContextId })` cagirarak ilgili container site verisini temizlemeye calisiyor.
- Host mapping bilgisini pref'te sakliyor; bu veri XOR + base64 ile obfuscate ediliyor.

Onemli not: Host mapping obfuscation gizlilik acisindan encryption degil. Diskteki veriyi kazara okunmaya karsi daha az acik hale getirir, fakat guvenlik garantisi olarak sunulmamali.

Risk: Workspace tasima akisi, hedef workspace aktif degilse session state icinden `groupId` ve `splitViewId` degerlerini siliyor. Bu split view, tab group ve workspace etkilesimlerinde davranis kaybi yaratabilir. Bunun otomatik browser chrome testi gorulmedi.

### 7.3 Privacy Levels

Kodda `standard`, `strict`, `extreme` seviyeleri var. Bunlar:

- Strict tracking protection, HTTPS-only, query stripping, referrer trimming, DNS prefetch/prefetch kapatma gibi sertlestirme ayarlarini uygular.
- `strict` seviyesinde First Party Isolation ve WebRTC kapatma bulunur.
- `extreme` seviyesinde JavaScript kapatma, kamera/mikrofon/location default block, history kapatma ve RFP/letterboxing acma bulunur.

Docs `docs/PRIVACY_LEVELS.md` tarafsiz ve dogru bir cerceve kullaniyor: Hilal'in anonimlik vadetmedigini, IP saklamadigini ve Tor yerine gecmedigini belirtiyor.

Public GitHub'da acik #22 issue'su "RFP is disabled in Extreme privacy level" diyor. Incelenen kodda `extreme` icin `privacy.resistFingerprinting`, `privacy.resistFingerprinting.pbmode` ve `privacy.resistFingerprinting.letterboxing` true gorunuyor. Bu issue ya stale, ya da runtime/apply/build farki var. Kapatilmadan once calisan browser profili uzerinde pref dogrulamasi yapilmali.

### 7.4 Bang Sistemi

`HilalBangs.sys.mjs` default bang haritasi ve custom bang pref'i sagliyor:

- Default bangs: Google, YouTube, Wikipedia, DuckDuckGo, GitHub, Reddit, Amazon, Netflix, IMDb, translate, X/Twitter, maps, Bing, Yahoo, eBay, Wolfram Alpha, Stack Overflow, Twitch, Pinterest, Spotify, Steam, Medium, Quora, Facebook, Instagram vb.
- Custom bangs: `hilal.bangs.custom` JSON pref'i.
- Sadece `http` ve `https` URL'leri kabul ediliyor.
- Unknown bang davranisi `hilal.bangs.fallback_to_ddg` pref'ine bagli.

Kodda Urlbar tarafindan `fallbackToDuckDuckGo: true` geciliyor, fakat pref varsayilani `false`. Bu nedenle mevcut varsayilan davranis: bilinmeyen bang DuckDuckGo'ya otomatik gitmez; bang metni soyulup kalan query normal arama motoruna gider. Pref true yapilirsa `!unknown query` DuckDuckGo bang handler'a gider.

Bu davranis privacy dokumantasyonunda net anlatilmali. Kullanici, bilinmeyen bang'in DuckDuckGo'ya gonderilip gonderilmeyecegini bilmelidir.

### 7.5 Sidebar ve Compact Mode

`sidebar-layout-redesign.patch`, `compact-mode-preferences.patch`, `sidebar-settings-wiring.patch`, `browser/themes/shared` overlay'i ve `hilal.inc.xhtml` birlikte ciddi bir UI yuzeyi olusturuyor:

- Hilal sidebar layout.
- Workspace rail.
- Open tabs ve bookmark bolumleri.
- Footer kisayollari: bookmarks, history, passwords, downloads, privacy, settings.
- Custom sidebar shortcut listesi.
- Compact mode ve hover ile gorunen floating sidebar.
- Compact mode icin toolbox gizleme pref'i.

Bu urunlesme acisindan belirgin bir gelisme. Ancak risk de ayni oranda buyuk: CSS ve Shadow DOM initialization tarafi Firefox upstream UI degisikliklerine hassas. Public acik #27 issue'su da sidebar Shadow Root initialization icin polling mekanizmasinin kirilgan oldugunu soyluyor. Bu konu kapatilmadan sidebar/compact mode stabil kabul edilmemeli.

### 7.6 uBlock Origin

`browser/ublock.patch`, distribution build listesine `extensions/uBlock0@raymondhill.net.xpi` ekliyor. XPI source repo icinde tutulmuyor; `hil/src/main.rs` icindeki `download_ublock` akisi `uBlock Origin 1.57.2` dosyasini indiriyor ve SHA256 ile dogruluyor.

Mevcut `engine/` altindaki XPI:

```text
uBlock Origin: 1.57.2
SHA256: 9928e79a52cecf7cfa231fdb0699c7d7a427660d94eb10d711ed5a2f10d2eb89
```

Bu, eski "latest indir" tarzindan daha iyi bir supply-chain durusu. Kalan risk: uBlock surumu eski kalabilir ve apply sirasinda network bagimliligi vardir. Reproducible release hedefleniyorsa XPI'nin release artifact/cache stratejisi ve per-release refresh checklist'i net olmali.

### 7.7 Localization

Turkish langpack overlay'i mevcut:

```text
changes/browser/app/distribution/extensions/langpack-tr@firefox.mozilla.org.xpi
SHA256: 6d216292d1376c3d7118a7cfbdafc561eb4eb50bd4760724c1f0ab9425f68957
```

Manifest JSON'u `strict_min_version` ve `strict_max_version` olarak `153.0a1` gosteriyor. Bu, upstream lock ile uyumlu. Yine de langpack build/sync akisi temiz `engine/` checkout'u uzerinde tekrar dogrulanmali.

### 7.8 Desktop Updates ve MAR Imza Altyapisi

`mozconfigs/base` desktop buildlerde updater'i aciyor ve default channel olarak `hilal-release` kullaniyor. `changes/browser/app/distribution/policies.json` `AppUpdateURL` tanimliyor. `secure-update-signatures.patch`, `MOZ_UPDATE_CHANNEL` `hilal-` ile basladiginda `release_primary.der` ve `release_secondary.der` sertifikalarini updater binary'sine dahil edecek sekilde build sistemini degistiriyor.

`scripts/make-full-update.sh` artik production icin imzali MAR'i zorunlu tutuyor; `--allow-unsigned` sadece local/development icin var. `scripts/generate-update-manifest.mjs` MAR URL, SHA512, size, appVersion ve displayVersion ayrimini destekliyor. `www/api/update.ts` update XML olusturmadan once channel, platform, hash, size ve Firefox app version validasyonu yapiyor.

Bu yapi dogru yone ilerliyor. Fakat bu denetimde imzali update'in calisan eski build uzerinden basarili sekilde uygulandigi dogrulanmadi. Public latest `v0.2.0-alpha.5` asset listesinde MAR veya update manifest yok; `v0.2.0-alpha.4` release'inde MAR ve `hilal-update-manifest.json` var.

### 7.9 Website ve Update API

`www` Vite + React + TypeScript tabanli. Dogrulanan komutlar:

- `npm run lint`: basarili.
- `npm run build`: basarili.
- `npm run test:update`: 6 test basarili.
- `npm audit --audit-level=moderate --omit=dev`: 0 vulnerability.

Eski rapordaki `React` namespace lint hatasi artik guncel degil.

Not: `scripts/generate-update-manifest.mjs` default app version okuma fallback'inde hala `firefox/browser/config/version.txt` path'ini kullaniyor. CI workflow bu script'i `--app-version "$APP_VER"` ile cagirdigi icin CI adiminda etkilenmeyebilir; fakat lokal kullanimda `engine/` modeline gore duzeltilmeli.

### 7.10 Flatpak ve Linux Paketleme

Flatpak dosyalari var:

- `org.gkdevstudio.Hilal.yml`
- `flatpak/org.gkdevstudio.Hilal.json`
- `flatpak/org.gkdevstudio.Hilal.desktop`
- `flatpak/org.gkdevstudio.Hilal.metainfo.xml`
- `flatpak/policies.json`

Flatpak policy, Firefox app updater'i kapatiyor; bu Flatpak dagitim modeli icin dogru.

`scripts/build-flatpak.sh check-ready` bu makinede basarisiz oldu. Iki sebep goruldu:

- macOS BSD grep `-P` desteklemedigi icin script uyumluluk hatasi veriyor.
- Script alpha/stable kontrolunde release'i stable Flathub icin hazir bulmuyor.

Bu beklenen bir blokaj olabilir, fakat `grep -P` kullanimi cross-platform script kalitesi acisindan duzeltilmeli. Ayrica `org.gkdevstudio.Hilal.yml` icindeki bazi install path'leri mevcut repo yapisiyla uyumsuz gorunuyor (`hilal-browser/branding/hilal/...` gibi); Flatpak build gercekten calistirilarak dogrulanmali.

### 7.11 Android

Android build dokumani ve `scripts/build-android.sh` mevcut. Ancak desktop `browser/` front-end patchlerinin Android/Fenix'e uygulanmadigi dokumanda dogru sekilde belirtilmis.

Bu denetimde Android build calistirilmadi. Android destek iddiasi "altyapi/dokumantasyon mevcut" seviyesinde tutulmali; urun seviyesi destek olarak sunulmamali.

---

## 8. CI/CD ve Public Durum

Public GitHub API'ye gore:

- Latest release: `v0.2.0-alpha.5`, published `2026-05-29T01:23:57Z`.
- Release assetleri:
  - `Hilal-Browser-0.2.0-alpha.5-mac.dmg`, SHA256 `15995219...`, 106,960,422 bytes.
  - `Hilal-Browser-v0.2.0-alpha.5-win64-installer.exe`, SHA256 `db6b243b...`, 85,646,701 bytes.
  - `Hilal-Browser-v0.2.0-alpha.5-win64.zip`, SHA256 `b5a0e73d...`, 130,187,425 bytes.
- `v0.2.0-alpha.5` release metadata'si `prerelease=false`. Isminde alpha olan release'ler GitHub'da prerelease olarak isaretlenmeli.
- Son 3 `release.yml` workflow run'u failure.
- Son `verify-patches.yml` run'u (#42) sorgu aninda in-progress; onceki main run (#41) cancelled.
- Public `main` branch protected degil.
- Acik issue'lar: #27 sidebar Shadow Root polling, #22 Extreme privacy/RFP, #12 macOS sidebar vibrancy.

CI dosyalari yerelde daha olgun bir hedef gosteriyor: `release.yml` macOS signing/notarization, DMG, MAR, update manifest, checksums ve SBOM adimlari iceriyor. Ancak public run sonuclari basarisiz oldugu icin bu akisin fiilen release guvencesi verdigi soylenemez.

---

## 9. Dogrulama Sonuclari

| Komut | Sonuc |
|---|---|
| `git status --porcelain` | Dirty: `hilal-browser-audit-report.md`, `manifest.toml` |
| `./bin/hil status` | Basarisiz; upstream lock yazildi, engine `HEAD` cozumlenemedi |
| `git -C engine rev-parse HEAD` | Basarisiz; `HEAD` unknown revision |
| `git -C engine fsck --no-progress` | Basarisiz, exit code `11`, missing objects/invalid refs |
| `./bin/hil verify` | No-op: tarball checksum configured degil |
| `npm run lint` in `www` | Basarili |
| `npm run build` in `www` | Basarili |
| `npm run test:update` in `www` | Basarili, 6/6 |
| `npm audit --audit-level=moderate --omit=dev` in `www` | 0 vulnerability |
| `cargo test --manifest-path hil/Cargo.toml` | Basarili, 0 test |
| `scripts/build-flatpak.sh check-ready` | Basarisiz: `grep -P` uyumsuzlugu ve alpha/stable blokaji |
| `df -h . engine` | Yaklasik 7.8 GiB bos alan |

Tam `scripts/build-macos.sh`, `./mach run`, `./mach test --auto`, Windows build, Linux build, Flatpak build ve Android build calistirilmadi.

---

## 10. Kritik Riskler

### K-1. Yerel Repo Dirty Durumunda

Final status'ta `hilal-browser-audit-report.md` ve `manifest.toml` degisik. Rapor beklenen degisikliktir; `manifest.toml` ise release oncesi bilincli olarak commitlenmeli veya geri alinmali.

**Etki:** Release hijyeni, patch sirasi ve build tekrarlanabilirligi icin bloklayici.

### K-2. `engine/` Git Object Store Sagliksiz

`engine/` final durumda `refs/heads/.invalid` HEAD'e sahip ve onceki okumada missing alternate object path/missing object hatalari verdi. Bu durumda clean patch apply, refresh veya build dogrulamasi saglikli kabul edilemez.

**Etki:** Release oncesi bloklayici.

### K-3. Public Release Workflow Basarisiz

Public GitHub API son 3 `release.yml` run'unu failure olarak gosteriyor.

**Etki:** Otomatik release pipeline su anda guvenilir kalite kapisi degil.

### K-4. Alpha Release'ler GitHub'da Prerelease Degil

`v0.2.0-alpha.5` ve `v0.2.0-alpha.4` API'de `prerelease=false` gorunuyor.

**Etki:** Kullanici beklentisi ve release semantigi yanlis. Alpha buildler stable gibi algilanabilir.

### K-5. Full Browser Build/Run/Test Dogrulanmadi

Website ve helper tooling gecti, fakat asil tarayici binary'si bu denetimde build edilmedi ve calistirilmadi.

**Etki:** Browser davranisi hakkinda rapor ancak statik kod ve onceki artifact bilgisine dayanabilir.

---

## 11. Orta Seviye Riskler

### R-1. Upstream Checksum Verify No-op

`upstream.lock` icinde `tarball_url` ve `tarball_sha256` bos. `./bin/hil verify` bu yuzden gercek bir integrity kontrolu yapmiyor.

### R-2. Version Metadata Dagilmis

`manifest.toml` `0.3.0`, public release `0.2.0-alpha.5`, Flatpak metadata `0.2.0-alpha.5`, local dist MAR `0.2.0-alpha.4`. Release sirasinda bu alanlar tek kaynak stratejisine baglanmali.

### R-3. Scriptlerde Eski `firefox/` Path Kalintilari Var

Ana model `engine/` olsa da bazi script loglari ve fallback path'leri hala `firefox/` diyor. En onemlisi `scripts/generate-update-manifest.mjs` default version okuma path'i. Bu, manuel release sirasinda yanlis appVersion uretebilir.

### R-4. Sidebar/Compact Mode Test Acigi

Sidebar UI ve compact mode buyuk bir yuzey ekliyor. Open issue #27 bu alanda kirilganlik oldugunu destekliyor. Browser chrome UI icin otomatik regresyon testi gorulmedi.

### R-5. Workspace/Session State Cakismalari

Workspace tasima akisi split view ve tab group state'ini bazi durumlarda siliyor. Bu bilincli tercih olabilir, fakat kullanici deneyimi acisindan test edilmeli ve gerekirse UI'da sinirlandirilmali.

### R-6. Privacy Level Runtime Dogrulamasi Eksik

Kodda ayarlar gorunuyor, fakat calisan browser profilinde standard/strict/extreme secimlerinin beklenen pref'leri uyguladigi bu denetimde test edilmedi.

### R-7. Flatpak Script Cross-platform Sorunu

`grep -P` macOS'ta calismiyor. Linux-only kabul edilecekse dokumanda belirtilmeli; degilse portable hale getirilmeli.

### R-8. uBlock Download Apply-time Dependency

uBlock XPI checksum-pinned, bu iyi. Ancak source-of-truth repo icinde tutulmuyor ve apply sirasinda GitHub download'a bagli. Offline/reproducible build hedefinde bu strateji tekrar degerlendirilmeli.

---

## 12. Olgunlasmis Alanlar

- Patch/overlay mimarisi netlesmis ve `manifest.toml` ile siralanmis.
- Rust `hil` araci temel workflow'u tek komutta topluyor.
- Website TypeScript, build ve update endpoint testleri bugun basarili.
- Update endpoint, Hilal display version ile Firefox app version ayrimini test ediyor.
- MAR imza zorunlulugu script seviyesinde daha guvenli hale gelmis.
- Desktop update policy ve Flatpak update policy ayrimi dogru.
- Privacy dokumani anonimlik iddialarini sinirli ve daha dogru kuruyor.
- Turkish langpack Firefox `153.0a1` ile uyumlu metadata tasiyor.
- uBlock Origin XPI checksum-pinned olarak indiriliyor.
- Public release assetlerinde GitHub digest alanlari var.

---

## 13. Release Readiness Degerlendirmesi

### Alpha

Bugunku haliyle yeni bir alpha release kesilmeden once su minimum maddeler tamamlanmali:

1. `manifest.toml` degisikligi bilerek commitlenmeli veya temizlenmeli.
2. `engine/` saglikli sekilde yeniden kurulup `./bin/hil apply --force` temiz gecmeli.
3. Public `verify-patches.yml` run'u completed/success olmali.
4. En az bir macOS package build ve `./mach run` smoke test gecmeli.
5. Alpha GitHub release metadata'si `prerelease=true` olmali.
6. Release notes hangi updater/auto-update seviyesinin desteklendigini acikca soylemeli.

Bu maddelerden sonra alpha release makul olabilir.

### Stable

Stable release bugunku durumda hazir degil. Stable icin ek olarak:

1. Release workflow yesil olmali ve artifact'lar CI tarafindan uretilmeli.
2. macOS signing/notarization dogrulanmali.
3. Windows binary signing stratejisi netlesmeli.
4. Signed MAR eski build uzerinden gercek update smoke testinden gecmeli.
5. Browser chrome UI icin temel regresyon testleri eklenmeli.
6. Sidebar/workspace/privacy/bang akislari icin browser chrome testleri olmali.
7. Version metadata tek kaynaktan uretilmeli.
8. `upstream.lock` verify komutu gercek checksum dogrulamasi yapmali.
9. Public alpha/beta/stable release semantigi duzeltilmeli.

---

## 14. Tavsiye Edilen Oncelik Sirasi

1. `manifest.toml` working tree degisikligini review et; commit veya temizle.
2. `engine/` HEAD/object store sorununu gider; temiz setup/apply dogrula.
3. `./bin/hil apply --force` sonucunu public CI ile eslestir.
4. `scripts/generate-update-manifest.mjs` fallback path'ini `engine/` modeline tasidiginizdan emin ol.
5. Alpha release'leri GitHub'da `prerelease=true` yap.
6. Release workflow failure loglarini inceleyip CI'yi yesile getir.
7. Workspace + split view ve sidebar Shadow Root konularina test ekle.
8. Privacy level runtime pref testleri ekle.
9. Flatpak readiness script'ini portable hale getir veya Linux-only oldugunu acik belirt.
10. `upstream.lock` verify icin tarball URL/SHA veya baska guvenilir upstream integrity modeli belirle.

---

## 15. Kaynaklar

Yerel kaynaklar:

- `manifest.toml`
- `upstream.lock`
- `changes/`
- `hil/src/main.rs`
- `docs/`
- `scripts/`
- `.github/workflows/`
- `www/`
- `mozconfigs/`
- `flatpak/`

Public kaynaklar:

- GitHub releases API: `https://api.github.com/repos/VastSea0/hilal-browser/releases?per_page=5`
- GitHub tags API: `https://api.github.com/repos/VastSea0/hilal-browser/tags?per_page=10`
- GitHub verify workflow API: `https://api.github.com/repos/VastSea0/hilal-browser/actions/workflows/verify-patches.yml/runs?per_page=5`
- GitHub release workflow API: `https://api.github.com/repos/VastSea0/hilal-browser/actions/workflows/release.yml/runs?per_page=5`
- GitHub issues API: `https://api.github.com/repos/VastSea0/hilal-browser/issues?state=open&per_page=20`
- GitHub main branch API: `https://api.github.com/repos/VastSea0/hilal-browser/branches/main`

---

## 16. Nihai Not

Hilal Browser'in en son durumu tarafsizca su cumleyle ozetlenebilir:

Proje, Firefox uzerinde ozgun bir browser deneyimi olusturacak kadar ozellik biriktirmis; ancak release muhendisligi, checkout sagligi, CI guvenilirligi ve browser-level regresyon testleri ayni olgunlukta degil. Bu nedenle mevcut urun dili alpha/pre-release cizgisinde kalmali; stable iddiasi icin once dogrulanabilir build ve update zinciri tamamlanmali.
