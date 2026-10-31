import { motion } from "motion/react";
import { ShieldCheck, ArrowLeft, ExternalLink, HeartHandshake, EyeOff, Lock } from "lucide-react";

interface PrivacyPageProps {
  lang: "tr" | "en";
  onBack?: () => void;
}

const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 26,
};

export default function PrivacyPage({ lang, onBack }: PrivacyPageProps) {
  const isTr = lang === "tr";

  return (
    <main className="min-h-screen pt-32 sm:pt-40 pb-28 px-4 sm:px-6 bg-m3-surface text-[var(--md-sys-color-on-surface)]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold hover:bg-m3-container-high transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTr ? "Ana Sayfaya Dön" : "Back to Home"}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            <span>{isTr ? "Resmi Gizlilik Politikası" : "Official Privacy Policy"}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--md-sys-color-on-surface)]">
            {isTr ? "Gizlilik Politikası" : "Privacy Policy"}
          </h1>
          <p className="text-xs font-mono text-[var(--md-sys-color-primary)] font-medium">
            {isTr ? "Son Güncelleme: 31 Ekim 2026" : "Last Updated: October 31, 2026"}
          </p>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30 space-y-2">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "Sıfır Kişisel Veri" : "Zero Personal Data"}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              {isTr
                ? "Ad, e-posta, telefon, cihaz modeli veya reklam kimliği toplanmaz."
                : "No names, emails, phone numbers, device models, or advertising IDs are collected."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30 space-y-2">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "Yerel Cihaz Depolaması" : "Strictly Local Storage"}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              {isTr
                ? "Geçmiş, yer imleri ve oturumlar yalnızca telefonunuzda güvenle tutulur."
                : "History, bookmarks, and sessions live solely on your physical device."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30 space-y-2">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "Yalnızca Sponsorlar" : "Funded by Sponsors Only"}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              {isTr
                ? "Veri satışı veya reklam ağı yoktur. Gelir modelimiz sadece açık kaynak sponsorluklarıdır."
                : "No data brokering, zero ad networks. Powered strictly by community donations."}
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-8 text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "1. Açık Kaynak Şeffaflığı" : "1. Open Source Transparency"}
            </h2>
            <p>
              {isTr
                ? "Hilal Browser, VastSea (Egehan Kahraman) tarafından geliştirilen açık kaynaklı bir web tarayıcısıdır. Projenin kaynak kodlarının tamamı GitHub üzerinde herkese açıktır. Uygulamanın hangi verileri nasıl işlediği, hangi ağ isteklerini gönderdiği kaynak kodlar üzerinden bağımsız olarak denetlenebilir."
                : "Hilal Browser is an open-source web browser developed by VastSea (Egehan Kahraman). The full source code is publicly accessible on GitHub, allowing anyone to independently verify our networking routines and data handling."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "2. Toplanan Veriler: Anonim Kullanım İstatistikleri" : "2. Data Collected: Anonymous Usage Statistics"}
            </h2>
            <p>
              {isTr
                ? "Masaüstü Hilal Browser hiçbir kullanım istatistiği göndermez. Android uygulaması, kaç kişinin hangi sürümü kullandığını görmek için günde en fazla bir kez şu bilgileri gönderir:"
                : "The Hilal desktop browser sends no usage statistics. To see how many people use which version, the Android app sends the following at most once a day:"}
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>{isTr ? "Uygulama ilk açıldığında rastgele üretilen bir kurulum kimliği" : "A random installation ID created when the app first starts"}</li>
              <li>{isTr ? "Uygulama sürümü ve derleme numarası" : "The app version and build number"}</li>
              <li>{isTr ? "Android API seviyesi, işlemci mimarisi ve sistem dili" : "The Android API level, CPU architecture, and system language"}</li>
              <li>{isTr ? "Seçili arama motoru, tema, uBlock Origin'in açık olup olmadığı ve yaklaşık sekme sayısı" : "The selected search engine, theme, whether uBlock Origin is on, and a rough tab count"}</li>
            </ul>
            <p className="text-xs text-[var(--md-sys-color-primary)] font-medium">
              {isTr
                ? "Bu veriler hiçbir kişiyle ilişkilendirilmez ve proje sunucusu aracılığıyla Google Cloud Firestore'da saklanır. IP adresiniz istatistik veritabanına yazılmaz. Ayarlar > \"Anonim kullanım istatistikleri\" kapatılarak tamamen durdurulabilir."
                : "This data is not linked to any person and is stored in Google Cloud Firestore through the project's server. Your IP address is not written to the statistics database. Turn it off completely in Settings > \"Anonymous usage statistics\"."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "3. Asla Toplanmayan ve İletilmeyen Veriler" : "3. Data We NEVER Collect"}
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isTr ? "Tarama Geçmişi ve Ziyaret Edilen URL'ler" : "Browsing history or visited URLs"}</li>
              <li>{isTr ? "Arama Terimleri ve Hilal Bangs Sorguları" : "Search queries or Hilal Bangs inputs"}</li>
              <li>{isTr ? "Form Girişleri, Şifreler ve Oturum Çerezleri" : "Form data, passwords, and session cookies"}</li>
              <li>{isTr ? "Ticari Takip SDK'ları (Google Analytics, Firebase, Facebook SDK vb.)" : "Commercial tracker SDKs (Google Analytics, Firebase, Facebook SDK, etc.)"}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "4. Para Kazanma Modeli: Yalnızca Sponsorlar" : "4. Monetization Model: Community Sponsors Only"}
            </h2>
            <p>
              {isTr
                ? "Hilal Browser ticari bir veri madenciliği veya reklam projesi değildir. Kullanıcı verileri hiçbir şirkete satılmaz veya kiralanmaz. Uygulama içinde reklam yer almaz. Projenin tek gelir kaynağı açık kaynak topluluk bağışları ve GitHub sponsorluklarıdır."
                : "Hilal Browser is not an advertising or data mining company. We never sell, rent, or monetize user data. There are no ads in the browser. The project is sustained purely through open-source community sponsorships and voluntary donations."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
              {isTr ? "5. İletişim ve Denetlenebilirlik" : "5. Contact & Auditability"}
            </h2>
            <p>
              {isTr
                ? "Açık kaynak kodlarımızı incelemek veya gizlilik politikamız hakkında sorularınızı iletmek için:"
                : "To inspect our source code or submit questions regarding our privacy practices:"}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/VastSea0/hilal-browser"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
