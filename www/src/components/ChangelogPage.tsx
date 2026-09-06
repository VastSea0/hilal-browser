import { motion } from "motion/react";
import {
  GitCommit,
  Tag,
  Calendar,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { RELEASES_DATA } from "../data/changelogData";

interface ChangelogPageProps {
  lang: "tr" | "en";
  onBack?: () => void;
  onOpenDownload?: () => void;
}

const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 26,
};

const m3FadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

const m3Stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

function formatHighlightText(text: string) {
  return text
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-[var(--md-sys-color-on-surface)]">$1</strong>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded bg-m3-container-high font-mono text-xs text-[var(--md-sys-color-primary)]">$1</code>'
    );
}

export default function ChangelogPage({ lang }: ChangelogPageProps) {
  const formatDate = (isoStr: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr.slice(0, 10);
      if (lang === "tr") {
        return d.toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoStr.slice(0, 10);
    }
  };

  return (
    <main className="min-h-screen pt-36 sm:pt-44 pb-28 px-4 sm:px-6 bg-m3-surface text-[var(--md-sys-color-on-surface)]">
      <div className="max-w-4xl mx-auto">
        {/* M3 Expressive Header */}
        <motion.div
          variants={m3Stagger}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4 mb-20"
        >
          <motion.div
            variants={m3FadeIn}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold tracking-wide"
          >
            <GitCommit className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            <span>{lang === "tr" ? "Resmi Sürüm Notları" : "Official Release Notes"}</span>
          </motion.div>

          <motion.h1
            variants={m3FadeIn}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[var(--md-sys-color-on-surface)] leading-[1.05]"
            style={{ fontStretch: "110%" }}
          >
            {lang === "tr" ? "Sürüm Notları" : "Changelog"}
          </motion.h1>

          <motion.p
            variants={m3FadeIn}
            className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--md-sys-color-on-surface-variant)] leading-relaxed font-normal"
          >
            {lang === "tr"
              ? "Hilal Browser için yayınlanan sürümler, yeni özellikler ve hata düzeltmelerinin kronolojik geçmişi."
              : "Chronological release history, new features, and bug fixes for Hilal Browser."}
          </motion.p>
        </motion.div>

        {/* Sequential Timeline List */}
        <motion.div
          variants={m3Stagger}
          initial="hidden"
          animate="visible"
          className="relative border-l-2 border-[var(--md-sys-color-outline-variant)]/30 pl-6 sm:pl-10 ml-3 sm:ml-6 space-y-16"
        >
          {RELEASES_DATA.map((rel) => {
            const hasHighlights =
              rel.highlights &&
              (rel.highlights.added.length > 0 ||
                rel.highlights.changed.length > 0 ||
                rel.highlights.fixed.length > 0);

            return (
              <motion.section
                key={rel.tag}
                variants={m3FadeIn}
                className="relative space-y-6"
              >
                {/* Timeline Node */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-m3-container-high border-2 border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] flex items-center justify-center shadow-sm">
                  {rel.isDev ? (
                    <GitBranch className="w-3 h-3" />
                  ) : (
                    <Tag className="w-3 h-3" />
                  )}
                </div>

                {/* Release Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
                      {rel.tag}
                    </h2>
                    {rel.isDev && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                        {lang === "tr" ? "Geliştirme" : "Development"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium">
                    {rel.date && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <time dateTime={rel.date}>{formatDate(rel.date)}</time>
                      </span>
                    )}
                    <span>•</span>
                    <a
                      href={rel.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-m3-container-low hover:bg-m3-container border border-[var(--md-sys-color-outline-variant)]/40 text-[var(--md-sys-color-primary)] transition-colors font-semibold"
                    >
                      <span>{rel.isDev ? (lang === "tr" ? `${rel.commitCount} Commit` : `${rel.commitCount} Commits`) : "GitHub"}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>

                {/* Highlights (Added, Changed, Fixed) */}
                {hasHighlights && rel.highlights && (
                  <div className="space-y-6 text-sm text-[var(--md-sys-color-on-surface)]">
                    {rel.highlights.added.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{lang === "tr" ? "Eklenenler" : "Added"}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 leading-relaxed text-[var(--md-sys-color-on-surface)] marker:text-emerald-500">
                          {rel.highlights.added.map((item, idx) => (
                            <li
                              key={idx}
                              dangerouslySetInnerHTML={{
                                __html: formatHighlightText(item),
                              }}
                            />
                          ))}
                        </ul>
                      </div>
                    )}

                    {rel.highlights.changed.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{lang === "tr" ? "Değiştirilenler" : "Changed"}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 leading-relaxed text-[var(--md-sys-color-on-surface)] marker:text-amber-500">
                          {rel.highlights.changed.map((item, idx) => (
                            <li
                              key={idx}
                              dangerouslySetInnerHTML={{
                                __html: formatHighlightText(item),
                              }}
                            />
                          ))}
                        </ul>
                      </div>
                    )}

                    {rel.highlights.fixed.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === "tr" ? "Düzeltmeler" : "Fixed"}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 leading-relaxed text-[var(--md-sys-color-on-surface)] marker:text-rose-500">
                          {rel.highlights.fixed.map((item, idx) => (
                            <li
                              key={idx}
                              dangerouslySetInnerHTML={{
                                __html: formatHighlightText(item),
                              }}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback commit items */}
                {!hasHighlights && (
                  <ul className="space-y-2 text-sm text-[var(--md-sys-color-on-surface)]">
                    {rel.commits.map((c) => (
                      <li
                        key={c.hash}
                        className="flex items-baseline justify-between gap-3 py-1 border-b border-[var(--md-sys-color-outline-variant)]/10 last:border-b-0"
                      >
                        <span className="leading-relaxed">{c.subject}</span>
                        <a
                          href={c.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs px-2 py-0.5 rounded bg-m3-container-low hover:bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-primary)] shrink-0 transition-colors"
                          title={c.author}
                        >
                          {c.shortHash}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
}
