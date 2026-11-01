import { useEffect, useState } from "react";
import { ArrowLeft, Zap } from "lucide-react";

interface SharedBoost {
  name: string | null;
  data: {
    shared: {
      name: string;
      domain: string;
      author?: string;
      preview?: string;
    };
  };
}

interface BoostSharePageProps {
  lang: "tr" | "en";
  id: string;
  onBack: () => void;
}

// Shown when a shared Boost link is opened outside Hilal. Inside Hilal the
// browser catches the link and offers the Boost itself.
export default function BoostSharePage({ lang, id, onBack }: BoostSharePageProps) {
  const isTr = lang === "tr";
  const [boost, setBoost] = useState<SharedBoost | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/boosts/${encodeURIComponent(id)}`)
      .then(response => (response.ok ? response.json() : Promise.reject()))
      .then(setBoost)
      .catch(() => setFailed(true));
  }, [id]);

  const shared = boost?.data.shared;
  const author = shared?.author || boost?.name;

  return (
    <main className="min-h-screen pt-32 sm:pt-40 pb-28 px-4 sm:px-6 bg-m3-surface text-[var(--md-sys-color-on-surface)]">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold hover:bg-m3-container-high transition-colors cursor-pointer border-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isTr ? "Ana Sayfaya Dön" : "Back to Home"}</span>
        </button>

        {failed ? (
          <div className="p-8 rounded-[32px] bg-m3-container-low text-center space-y-2">
            <h1 className="text-2xl font-bold">{isTr ? "Bu Boost bulunamadı" : "This Boost could not be found"}</h1>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              {isTr ? "Bağlantı yanlış olabilir ya da Boost kaldırılmış olabilir." : "The link may be wrong, or the Boost may have been removed."}
            </p>
          </div>
        ) : !shared ? (
          <div className="h-64 rounded-[32px] bg-m3-container-low animate-pulse" />
        ) : (
          <article className="p-6 sm:p-10 rounded-[36px] bg-m3-container-low border border-[var(--outline-variant)]/30 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-container)] text-[var(--on-primary-container)] grid place-items-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{shared.name}</h1>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  {isTr ? `${shared.domain} için` : `For ${shared.domain}`}
                  {author ? (isTr ? ` · ${author} tarafından` : ` · by ${author}`) : ""}
                </p>
              </div>
            </div>
            {shared.preview && (
              <img
                src={shared.preview}
                alt={isTr ? "Boost önizlemesi" : "Boost preview"}
                className="w-full rounded-2xl border border-[var(--outline-variant)]/40"
              />
            )}
            <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              {isTr
                ? "Bu bir Hilal Boost'u: bir sitenin renklerini, yazı tiplerini ve görünüşünü değiştirir. Eklemek için bu bağlantıyı Hilal Browser'da açın."
                : "This is a Hilal Boost: it changes a site's colors, fonts and look. Open this link in Hilal Browser to add it."}
            </p>
          </article>
        )}
      </div>
    </main>
  );
}
